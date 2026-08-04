import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Download,
  Loader2,
  Search,
  Terminal,
  Network,
  ShieldCheck,
  Database,
  Globe,
  CircleDot,
  ShieldAlert,
  Braces,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { LinkAnalysis } from "@/components/LinkAnalysis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { osintTools, type SearchTool } from "@/lib/synx-data";
import { logSearch } from "@/lib/auth";
import { collect } from "@/lib/dossier";

export const Route = createFileRoute("/osint")({
  head: () => ({
    meta: [
      { title: "OSINT Intelligence — Central de Investigação SYNX" },
      {
        name: "description",
        content: "Módulo avançado de reconhecimento, OSINT e Análise de Vínculos.",
      },
    ],
  }),
  component: OsintRoute,
});

function OsintRoute() {
  return (
    <AuthGuard permission="osint">
      <OsintSearch />
    </AuthGuard>
  );
}

function OsintSearch() {
  const [activeTool, setActiveTool] = useState<SearchTool>(osintTools[0]!);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLinkAnalysis, setShowLinkAnalysis] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Digite um alvo para investigar");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const proxyUrl = `/api/proxy?endpoint=${encodeURIComponent(activeTool.endpoint)}&param=${activeTool.param}&query=${encodeURIComponent(query.trim())}&toolId=${activeTool.id}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      setResult(data);
      logSearch({ module: "OSINT", tool: activeTool.label, query: query.trim(), status: "ok" });
      collect({ module: "OSINT", tool: activeTool.label, target: query.trim(), data });
      toast.success("Investigação concluída com sucesso");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha na investigação técnica";
      setError(message);
      logSearch({ module: "OSINT", tool: activeTool.label, query: query.trim(), status: "erro" });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `osint-report-${activeTool.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildGraphData = () => {
    const resultData = result as any;
    const nodes: any[] = [];
    const edges: any[] = [];

    const centralId = `target-${query}`;
    nodes.push({
      id: centralId,
      label: query,
      type: query.includes("@") ? "email" : (activeTool.id === "phone" ? "phone" : "person"),
      size: 45,
    });

    if (resultData.osint?.found) {
      resultData.osint.found.forEach((found: any, idx: number) => {
        const nodeId = `social-${idx}`;
        nodes.push({
          id: nodeId,
          label: found.platform,
          type: "social",
          size: 32,
        });
        edges.push({
          from: centralId,
          to: nodeId,
          label: "vinculado",
          type: "social",
        });
      });
    }

    return { nodes, edges };
  };

  const data = result as any;
  const found: any[] = data?.osint?.found ?? [];
  const reputation: number = data?.osint?.reputation ?? 0;
  const summary: string = data?.osint?.summary ?? "";

  return (
    <AppShell
      title="OSINT Intelligence"
      eyebrow="Módulo de Investigação de Elite"
      activePath="/osint"
    >
      {showLinkAnalysis && Boolean(result) && (
        <LinkAnalysis
          data={buildGraphData()}
          onClose={() => setShowLinkAnalysis(false)}
        />
      )}

      <div className="mx-auto max-w-6xl space-y-5">
        {/* API Sub-modules Grid */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {osintTools.map((tool) => {
            const active = tool.id === activeTool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool);
                  setResult(null);
                  setError(null);
                }}
                className={`group relative overflow-hidden rounded-sm border p-4 text-left transition-all ${
                  active
                    ? "border-signal/70 bg-signal/8 shadow-glow"
                    : "border-border bg-surface/60 hover:border-signal/35 hover:bg-surface-2/60"
                }`}
              >
                <div
                  className={`mb-3 grid h-9 w-9 place-items-center rounded-sm border transition-colors ${
                    active
                      ? "border-signal/60 bg-signal/15 text-signal"
                      : "border-border bg-surface-2 text-muted-foreground"
                  }`}
                >
                  <span className="text-lg">{tool.icon}</span>
                </div>
                <h3
                  className={`font-mono text-xs uppercase tracking-[0.14em] ${active ? "text-signal" : "text-foreground"}`}
                >
                  {tool.label}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/80">
                  {tool.description}
                </p>
                {active && (
                  <span className="absolute right-0 top-0 h-full w-px bg-signal/60" />
                )}
              </button>
            );
          })}
        </section>

        {/* Investigation Console */}
        <section className="bracket relative overflow-hidden rounded-sm border border-border bg-surface/70 p-5 backdrop-blur-xl sm:p-6">
          <div className="crt-lines pointer-events-none absolute inset-0 opacity-25" />
          <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
              <span className="mono-label text-signal/90">
                Console de Comando · {activeTool.label}
              </span>
            </div>
            <span className="mono-label text-muted-foreground/50">
              present day // present time
            </span>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center gap-2">
                <Search
                  size={16}
                  className="text-muted-foreground transition-colors group-focus-within:text-signal"
                />
                <span className="font-mono text-sm text-signal/60">&gt;</span>
              </div>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={activeTool.placeholder}
                className="h-14 rounded-sm border-border bg-background/70 pl-14 pr-40 font-mono text-base tracking-wide focus-visible:border-signal focus-visible:ring-signal/20"
              />
              <div className="absolute inset-y-2 right-2">
                <Button
                  type="submit"
                  variant="signal"
                  size="lg"
                  disabled={loading}
                  className="h-10 gap-2 px-6"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                  {loading ? "Rastreando" : "Investigar"}
                </Button>
              </div>
            </div>
          </form>

          {error && (
            <p className="relative mt-4 border-l-2 border-danger/60 bg-danger/8 px-3 py-2 font-mono text-xs text-danger">
              falha // {error}
            </p>
          )}
        </section>

        {/* Results & Graph Access */}
        <section className="overflow-hidden rounded-sm border border-border bg-surface/70 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2/40 px-5 py-3">
            <div className="flex items-center gap-2.5">
              <Terminal size={15} className="text-signal" />
              <span className="mono-label text-muted-foreground">
                Relatório de Inteligência
              </span>
            </div>
            {Boolean(result) && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="signal"
                  size="sm"
                  onClick={() => setShowLinkAnalysis(true)}
                  className="gap-2 px-4"
                >
                  <Network size={14} /> Análise de Vínculos
                </Button>
                <Button
                  variant="tactical"
                  size="sm"
                  onClick={downloadJSON}
                  className="gap-2 px-4"
                >
                  <Download size={14} /> Exportar JSON
                </Button>
              </div>
            )}
          </div>

          <div className="min-h-[320px] p-5 sm:p-6">
            {loading ? (
              <div className="space-y-6 py-12">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <div className="relative grid h-20 w-20 place-items-center">
                    <span className="pulse-ring absolute inset-0 rounded-full border border-signal/30" />
                    <Globe size={26} className="animate-pulse text-signal" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-mono text-sm uppercase tracking-[0.2em] text-signal">
                      scanning 270+ services
                      <span className="animate-caret">_</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cruzando dados e construindo rede de relacionamentos...
                    </p>
                  </div>
                </div>
                <div className="mx-auto h-1 w-full max-w-md overflow-hidden bg-surface-2">
                  <div className="animate-progress-loading h-full w-1/2 bg-signal" />
                </div>
              </div>
            ) : result ? (
              <div className="animate-in fade-in space-y-7 duration-500">
                {/* Stat strip */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    {
                      label: "Reputação",
                      value: `${reputation}`,
                      suffix: "/100",
                      color: "text-success",
                      icon: <ShieldCheck size={13} />,
                    },
                    {
                      label: "Contas encontradas",
                      value: String(found.length),
                      suffix: "",
                      color: "text-signal",
                      icon: <Database size={13} />,
                    },
                    {
                      label: "Serviços varridos",
                      value: "270+",
                      suffix: "",
                      color: "text-wire",
                      icon: <Globe size={13} />,
                    },
                    {
                      label: "Status",
                      value: "OK",
                      suffix: "",
                      color: "text-foreground",
                      icon: <Network size={13} />,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-sm border border-border bg-background/50 p-4 transition-colors hover:border-signal/30"
                    >
                      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                        {stat.icon}
                        <p className="mono-label text-[9px]">{stat.label}</p>
                      </div>
                      <p className={`font-display text-3xl font-bold ${stat.color}`}>
                        {stat.value}
                        <span className="ml-1 text-xs opacity-50">{stat.suffix}</span>
                      </p>
                    </div>
                  ))}
                </div>

                {summary && (
                  <p className="border-l-2 border-signal/50 bg-signal/5 px-4 py-3 font-mono text-xs leading-relaxed text-foreground/80">
                    {summary}
                  </p>
                )}

                {/* Accounts found */}
                {found.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="h-px w-4 bg-signal" />
                      <p className="mono-label text-muted-foreground">
                        Contas encontradas
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {found.map((item: any, i: number) => (
                        <div
                          key={`${item?.platform ?? "svc"}-${i}`}
                          className="flex items-center gap-2.5 rounded-sm border border-border bg-background/50 px-3 py-2.5 transition-colors hover:border-success/40"
                        >
                          <CircleDot size={12} className="shrink-0 text-success" />
                          <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
                            {item?.platform ?? String(item)}
                          </span>
                          {item?.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="mono-label shrink-0 text-[9px] text-signal hover:underline"
                            >
                              abrir
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {found.length === 0 && (
                  <div className="flex items-center gap-3 rounded-sm border border-border bg-background/40 px-4 py-3">
                    <ShieldAlert size={15} className="shrink-0 text-gold" />
                    <p className="font-mono text-xs text-muted-foreground">
                      Nenhuma conta vinculada retornada pelo motor OSINT para este alvo.
                    </p>
                  </div>
                )}

                {/* Raw JSON */}
                <div className="space-y-2">
                  <button
                    onClick={() => setShowRaw((v) => !v)}
                    className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-signal"
                  >
                    <Braces size={13} />
                    <span className="mono-label">
                      {showRaw ? "ocultar" : "exibir"} dados brutos
                    </span>
                  </button>
                  {showRaw && (
                    <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-sm border border-border/60 bg-black/50 p-5 font-mono text-[11px] leading-relaxed text-foreground/70">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                <Database size={40} className="text-muted-foreground/20" />
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/50">
                  aguardando comando de investigação
                  <span className="animate-caret">_</span>
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
