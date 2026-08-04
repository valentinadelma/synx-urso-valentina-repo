import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, Search, Terminal, Database, Key, Globe } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { synxSearchTools, type SearchTool } from "@/lib/synx-data";
import { logSearch } from "@/lib/auth";
import { collect } from "@/lib/dossier";

export const Route = createFileRoute("/synx-search")({
  head: () => ({
    meta: [
      { title: "Synx Search — Central de Inteligência de Logs" },
      {
        name: "description",
        content: "Consulta massiva de logs, credenciais e vazamentos via API SYNX.",
      },
    ],
  }),
  component: SynxSearchRoute,
});

function SynxSearchRoute() {
  return (
    <AuthGuard permission="synx-search">
      <SynxSearch />
    </AuthGuard>
  );
}

function SynxSearch() {
  const [activeTool, setActiveTool] = useState<SearchTool>(synxSearchTools[0]!);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Digite um termo para pesquisar");
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
      logSearch({ module: "Synx Search", tool: activeTool.label, query: query.trim(), status: "ok" });
      collect({ module: "Synx Search", tool: activeTool.label, target: query.trim(), data });
      toast.success("Consulta de logs concluída");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro na consulta de base de dados";
      setError(message);
      logSearch({ module: "Synx Search", tool: activeTool.label, query: query.trim(), status: "erro" });
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
    a.download = `synx-logs-${activeTool.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell
      title="Synx Search"
      eyebrow="Consulta de Logs & Vazamentos"
      activePath="/synx-search"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Log Tools Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {synxSearchTools.map((tool) => {
            const active = tool.id === activeTool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool);
                  setResult(null);
                  setError(null);
                }}
                className={`rounded-sm border p-4 text-left transition-all ${
                  active
                    ? "border-signal bg-signal/5 shadow-glow"
                    : "border-border bg-surface-2/40 hover:border-signal/40"
                }`}
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-sm border ${
                  active ? "border-signal text-signal" : "border-border text-muted-foreground"
                }`}>
                  <span className="text-xl">{tool.icon}</span>
                </div>
                <p className={`text-sm font-bold ${active ? "text-signal" : "text-foreground"}`}>
                  {tool.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                  {tool.description}
                </p>
              </button>
            );
          })}
        </section>

        {/* Search Console */}
        <section className="rounded-sm border border-border bg-surface/80 p-6 backdrop-blur-xl">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={activeTool.placeholder}
                className="h-14 border-border bg-surface-2/50 pl-12 font-mono text-base focus-visible:border-signal rounded-sm"
              />
            </div>
            <Button 
              type="submit" 
              variant="signal" 
              size="lg" 
              disabled={loading} 
              className="h-14 gap-2 px-8 rounded-sm shadow-lg"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Database size={20} />}
              {loading ? "Buscando..." : "Consultar"}
            </Button>
          </form>
        </section>

        {/* Log Output */}
        <section className="overflow-hidden rounded-sm border border-border bg-surface/80 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border bg-surface-2/40 px-6 py-4">
            <div className="flex items-center gap-3">
              <Terminal size={16} className="text-signal" />
              <span className="mono-label text-muted-foreground">Saída de Logs · {activeTool.endpoint}</span>
            </div>
            {Boolean(result) && (
              <Button variant="tactical" size="sm" onClick={downloadJSON} className="gap-2">
                <Download size={14} /> JSON
              </Button>
            )}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={32} className="animate-spin text-signal" />
                <p className="font-mono text-sm text-signal animate-pulse">Acessando base de dados Leaksights...</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs mono-label text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Globe size={12} /> Cloud Source</div>
                  <div className="flex items-center gap-1.5"><Key size={12} /> Decrypted</div>
                </div>
                <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-foreground/80 bg-black/30 p-6 rounded-sm border border-border/50 max-h-[500px] overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-center py-20 opacity-30">
                <Database size={48} className="mx-auto mb-4" />
                <p className="font-mono text-sm italic">Nenhum log carregado. Inicie uma consulta.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
