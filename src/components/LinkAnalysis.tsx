import { useEffect, useMemo, useRef, useState } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import {
  X,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  ShieldAlert,
  Waypoints,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Node {
  id: string;
  label: string;
  type: "person" | "email" | "phone" | "address" | "social" | "breach";
  color?: string;
  size?: number;
}

interface Edge {
  from: string;
  to: string;
  label: string;
  type: "filiacão" | "telefone" | "endereço" | "encontrado_em" | "relacionado";
}

interface LinkAnalysisProps {
  data: {
    nodes: Node[];
    edges: Edge[];
  };
  onClose: () => void;
}

/* Paleta clara do grafo — estilo dossiê/planilha de vínculos */
const NODE_COLORS: Record<string, string> = {
  person: "#0f6f86",
  email: "#2f7fb5",
  phone: "#1f8a8a",
  address: "#3f7f57",
  social: "#8a6d1f",
  breach: "#b03a35",
};

const GRAPH_BG = "#000000";
const EDGE_COLOR = "#4fd1e0";
const LABEL_COLOR = "#e6f4f7";


const ICON_PATHS: Record<string, string> = {
  person:
    '<circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 20c0-3.6 3.3-5.6 7.2-5.6s7.2 2 7.2 5.6"/>',
  email:
    '<rect x="3" y="5.5" width="18" height="13" rx="1.6"/><path d="M3.6 6.6 12 13l8.4-6.4"/>',
  phone:
    '<path d="M7.2 3.5 9.6 8l-2 1.8c1.1 2.7 3 4.6 5.7 5.7l1.8-2 4.5 2.4-1.4 3.1c-.4.9-1.4 1.4-2.4 1.2C9.6 19 5 14.4 3.5 8.2c-.2-1 .3-2 1.2-2.4z"/>',
  address:
    '<path d="M12 21.5s6.6-6.1 6.6-11a6.6 6.6 0 1 0-13.2 0c0 4.9 6.6 11 6.6 11z"/><circle cx="12" cy="10.2" r="2.4"/>',
  social:
    '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.3 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.3-3.6-8.5S9.6 5.9 12 3.5z"/>',
  breach:
    '<path d="M12 3.2l7 2.8v5.6c0 4.8-2.9 7.9-7 9.2-4.1-1.3-7-4.4-7-9.2V6z"/><path d="M12 9.4v3.6M12 15.8h.01"/>',
};

/** Ícone circular branco com aro colorido — igual ao mapa de vínculos clássico. */
function makeNodeIcon(type: string) {
  const color = NODE_COLORS[type] || "#0f6f86";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="27" fill="#ffffff" stroke="${color}" stroke-width="4"/>
    <g transform="translate(14,14) scale(1.5)" fill="none" stroke="${color}" stroke-width="1.7"
       stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[type] || ICON_PATHS["person"]}</g>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

const LEGEND = [
  { key: "person", label: "Pessoa", icon: User },
  { key: "email", label: "Email", icon: Mail },
  { key: "phone", label: "Telefone", icon: Phone },
  { key: "address", label: "Endereço", icon: MapPin },
  { key: "social", label: "Redes Sociais", icon: Globe },
  { key: "breach", label: "Vazamentos", icon: ShieldAlert },
] as const;

const ANIM = { duration: 600, easingFunction: "easeInOutQuad" } as const;


export function LinkAnalysis({ data, onClose }: LinkAnalysisProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const [selected, setSelected] = useState<Node | null>(null);
  const [stabilizing, setStabilizing] = useState(true);
  const [filters, setFilters] = useState<Record<string, boolean>>({
    person: true,
    email: true,
    phone: true,
    address: true,
    social: true,
    breach: true,
  });

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    data.nodes.forEach((n) => {
      map[n.type] = (map[n.type] || 0) + 1;
    });
    return map;
  }, [data.nodes]);

  useEffect(() => {
    if (!containerRef.current) return;
    setStabilizing(true);

    // Nós: ícone circular branco com aro colorido e rótulo abaixo
    const nodes = new DataSet<any>(
      data.nodes
        .filter((n) => filters[n.type])
        .map((n) => ({
          id: n.id,
          label: n.label,
          title: `${n.type.toUpperCase()}: ${n.label}`,
          shape: "image",
          image: makeNodeIcon(n.type),
          size: Math.max(20, (n.size || 30) * 0.75),
          font: {
            size: 12,
            color: LABEL_COLOR,
            face: "IBM Plex Sans, system-ui, sans-serif",
            strokeWidth: 4,
            strokeColor: GRAPH_BG,
            vadjust: 4,
            multi: false,
          },
          shadow: {
            enabled: true,
            color: "rgba(24, 48, 66, 0.18)",
            size: 8,
            x: 0,
            y: 2,
          },
        })),
    );

    // Vínculos: linha fina cinza-azulada com seta e rótulo do tipo de relação
    const edges = new DataSet<any>(
      data.edges
        .filter((e) => {
          const fromNode = data.nodes.find((n) => n.id === e.from);
          const toNode = data.nodes.find((n) => n.id === e.to);
          return (
            fromNode && toNode && filters[fromNode.type] && filters[toNode.type]
          );
        })
        .map((e) => ({
          from: e.from,
          to: e.to,
          label: e.label,
          title: e.label,
          color: {
            color: EDGE_COLOR,
            highlight: "#0f6f86",
            hover: "#0f6f86",
            opacity: 0.85,
          },
          font: {
            size: 9,
            color: "#9fc6ce",
            face: "IBM Plex Sans, system-ui, sans-serif",
            strokeWidth: 4,
            strokeColor: GRAPH_BG,
            align: "horizontal",

          },
          arrows: { to: { enabled: true, scaleFactor: 0.6, type: "arrow" } },
          smooth: { enabled: false, type: "continuous", roundness: 0 },
          width: 1,
          selectionWidth: 1.6,
        })),
    );

    const options = {
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -18000,
          centralGravity: 0.22,
          springLength: 190,
          springConstant: 0.03,
          avoidOverlap: 0.35,
        },
        maxVelocity: 40,
        solver: "barnesHut",
        timestep: 0.35,
        stabilization: { iterations: 200 },
      },
      nodes: {
        shape: "image",
        shapeProperties: { useBorderWithImage: false, interpolation: true },
      },
      edges: {
        smooth: { enabled: false, type: "continuous", roundness: 0 },
        selectionWidth: 1.6,
      },
      interaction: {
        hover: true,
        navigationButtons: false,
        keyboard: true,
        zoomView: true,
        dragView: true,
        tooltipDelay: 120,
      },
      layout: {
        randomSeed: 42,
        improvedLayout: true,
      },
    };


    if (networkRef.current) {
      networkRef.current.destroy();
    }

    networkRef.current = new Network(
      containerRef.current,
      { nodes, edges },
      options,
    );

    networkRef.current.on("selectNode", (params: any) => {
      const id = params.nodes?.[0];
      setSelected(data.nodes.find((n) => n.id === id) || null);
    });
    networkRef.current.on("deselectNode", () => setSelected(null));

    // Fit to view after stabilization
    networkRef.current.once("stabilizationIterationsDone", () => {
      setStabilizing(false);
      networkRef.current?.fit({ animation: ANIM });
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [data, filters]);

  const handleFilterChange = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleZoom = (direction: "in" | "out") => {
    if (!networkRef.current) return;
    const scale = networkRef.current.getScale();
    const newScale = direction === "in" ? scale * 1.2 : scale / 1.2;
    networkRef.current.moveTo({ scale: newScale, animation: ANIM });
  };

  const handleFit = () => {
    networkRef.current?.fit({ animation: ANIM });
  };

  const handleDownload = () => {
    if (!networkRef.current) return;
    const canvas = (networkRef.current as any).canvas.canvas as HTMLCanvasElement;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `osint-analysis-${Date.now()}.png`;
    link.click();
  };

  const visibleNodes = data.nodes.filter((n) => filters[n.type]).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 backdrop-blur-md sm:p-5">
      <div className="panel bracket relative flex h-full max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-md">
        <div className="crt-lines pointer-events-none absolute inset-0 z-30 opacity-10" />

        {/* Header */}
        <div className="relative z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border bg-surface-2/40 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-signal/40 bg-signal/10 text-signal">
              <Waypoints size={18} />
            </div>
            <div className="min-w-0">
              <h2
                className="glitch truncate font-display text-lg font-bold uppercase tracking-[0.14em] text-foreground"
                data-text="Análise de Vínculos"
              >
                Análise de Vínculos
              </h2>
              <p className="mono-label truncate text-muted-foreground/70">
                Link Analysis · Protocol WIRED /{" "}
                <span className="text-signal/80">
                  {stabilizing ? "calculando topologia" : "grafo estável"}
                </span>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-4 rounded-sm border border-border bg-background/60 px-4 py-1.5 md:flex">
              <div className="text-center">
                <p className="font-mono text-base leading-none text-signal">
                  {String(visibleNodes).padStart(2, "0")}
                </p>
                <p className="mono-label text-[9px] text-muted-foreground/60">
                  nós
                </p>
              </div>
              <span className="h-6 w-px bg-border" />
              <div className="text-center">
                <p className="font-mono text-base leading-none text-wire">
                  {String(data.edges.length).padStart(2, "0")}
                </p>
                <p className="mono-label text-[9px] text-muted-foreground/60">
                  vínculos
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-sm border border-border p-2 text-muted-foreground transition-colors hover:border-danger/50 hover:text-danger"
              aria-label="Fechar análise de vínculos"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative flex flex-1 overflow-hidden">
          {/* Sidebar Filters */}
          <div className="z-20 hidden w-60 shrink-0 flex-col overflow-auto border-r border-border bg-background/70 p-4 sm:flex">
            <p className="mono-label mb-3 text-muted-foreground/70">
              Camadas de entidade
            </p>
            <div className="space-y-1.5">
              {LEGEND.map((filter) => {
                const on = filters[filter.key];
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.key}
                    onClick={() => handleFilterChange(filter.key)}
                    className={`flex w-full items-center gap-2.5 rounded-sm border px-2.5 py-2 text-left transition-all ${
                      on
                        ? "border-border bg-surface-2/70"
                        : "border-transparent bg-transparent opacity-45"
                    }`}
                  >
                    {on ? (
                      <Eye size={13} className="shrink-0 text-signal" />
                    ) : (
                      <EyeOff
                        size={13}
                        className="shrink-0 text-muted-foreground"
                      />
                    )}
                    <span
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-sm"
                      style={{
                        backgroundColor: `${NODE_COLORS[filter.key]}1f`,
                        color: NODE_COLORS[filter.key],
                        boxShadow: `inset 0 0 0 1px ${NODE_COLORS[filter.key]}44`,
                      }}
                    >
                      <Icon size={12} />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-xs uppercase tracking-wider text-foreground">
                      {filter.label}
                    </span>
                    <span className="mono-label shrink-0 text-[10px] text-muted-foreground/70">
                      {counts[filter.key] || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Node detail */}
            <div className="mt-5 border-t border-border pt-4">
              <p className="mono-label mb-2 text-muted-foreground/70">
                Nó selecionado
              </p>
              {selected ? (
                <div
                  className="rounded-sm border bg-surface-2/50 p-3"
                  style={{ borderColor: `${NODE_COLORS[selected.type]}55` }}
                >
                  <p
                    className="mono-label"
                    style={{ color: NODE_COLORS[selected.type] }}
                  >
                    {selected.type}
                  </p>
                  <p className="mt-1.5 break-words font-mono text-xs leading-relaxed text-foreground">
                    {selected.label}
                  </p>
                  <p className="mt-2 break-all font-mono text-[10px] text-muted-foreground/50">
                    id: {selected.id}
                  </p>
                </div>
              ) : (
                <p className="font-mono text-[11px] leading-relaxed text-muted-foreground/50">
                  Clique em um nó do grafo para inspecionar a entidade.
                </p>
              )}
            </div>

            <div className="mt-auto space-y-1.5 border-t border-border pt-4">
              <p className="mono-label text-muted-foreground/70">Telemetria</p>
              <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                <span>NODES</span>
                <span className="text-signal">{data.nodes.length}</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                <span>EDGES</span>
                <span className="text-wire">{data.edges.length}</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                <span>LAYER</span>
                <span className="text-foreground/70">WIRED-07</span>
              </div>
            </div>
          </div>

          {/* Graph Container */}
          <div className="relative flex-1">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundColor: GRAPH_BG,
                backgroundImage:
                  "linear-gradient(to right, rgba(79,209,224,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(79,209,224,0.07) 1px, transparent 1px)",
                backgroundSize: "34px 34px",

              }}
            />
            <div ref={containerRef} className="relative h-full w-full" />


            {stabilizing && (
              <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-sm border border-signal/30 bg-background/80 px-3 py-1.5">
                <span className="mono-label text-signal">
                  computando vínculos
                  <span className="animate-caret">_</span>
                </span>
              </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-4 right-4 z-20 flex flex-wrap justify-end gap-2">
              <Button
                variant="tactical"
                size="sm"
                onClick={() => handleZoom("in")}
                className="gap-2"
              >
                <ZoomIn size={16} />
              </Button>
              <Button
                variant="tactical"
                size="sm"
                onClick={() => handleZoom("out")}
                className="gap-2"
              >
                <ZoomOut size={16} />
              </Button>
              <Button
                variant="tactical"
                size="sm"
                onClick={handleFit}
                className="gap-2"
              >
                <Maximize2 size={14} />
                Ajustar
              </Button>
              <Button
                variant="signal"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download size={16} />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
