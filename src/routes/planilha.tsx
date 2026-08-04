import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Trash2, Table2, Search as SearchIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DOSSIER_EVENT,
  clearDossier,
  readDossier,
  removeTarget,
  toCSV,
  type DossierRow,
} from "@/lib/dossier";

export const Route = createFileRoute("/planilha")({
  head: () => ({
    meta: [
      { title: "Planilha Inv — Dossiê de Investigação SYNX" },
      {
        name: "description",
        content:
          "Planilha automática de investigação: todo dado coletado nas buscas é organizado por alvo, categoria e campo.",
      },
      { property: "og:title", content: "Planilha Inv — Dossiê de Investigação SYNX" },
      {
        property: "og:description",
        content:
          "Dossiê automático com todos os dados coletados nos módulos Synx Search e OSINT.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AuthGuard>
      <PlanilhaPage />
    </AuthGuard>
  ),
});

function PlanilhaPage() {
  const [rows, setRows] = useState<DossierRow[]>([]);
  const [filter, setFilter] = useState("");
  const [target, setTarget] = useState<string>("todos");

  useEffect(() => {
    const sync = () => setRows(readDossier());
    sync();
    window.addEventListener(DOSSIER_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(DOSSIER_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const targets = useMemo(
    () => Array.from(new Set(rows.map((r) => r.target))),
    [rows],
  );

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return rows.filter((r) => {
      if (target !== "todos" && r.target !== target) return false;
      if (!q) return true;
      return `${r.target} ${r.category} ${r.field} ${r.value} ${r.tool}`
        .toLowerCase()
        .includes(q);
    });
  }, [rows, filter, target]);

  const grouped = useMemo(() => {
    const map = new Map<string, DossierRow[]>();
    visible.forEach((r) => {
      const key = r.target;
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    });
    return Array.from(map.entries());
  }, [visible]);

  const exportCSV = () => {
    if (!visible.length) {
      toast.error("Nada para exportar");
      return;
    }
    const blob = new Blob([toCSV(visible)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `planilha-investigacao-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Planilha exportada");
  };

  return (
    <AppShell
      title="Planilha Inv"
      eyebrow="Dossiê automático de investigação"
      activePath="/planilha"
    >
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="panel rounded-sm border border-border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-sm border border-signal/40 bg-signal/10 text-signal">
              <Table2 size={18} />
            </div>
            <div className="mr-auto">
              <p className="font-mono text-sm uppercase tracking-widest text-foreground">
                {visible.length} registros
              </p>
              <p className="mono-label text-muted-foreground/70">
                {targets.length} alvos monitorados · coleta automática
              </p>
            </div>
            <Button variant="signal" size="sm" className="gap-2" onClick={exportCSV}>
              <Download size={15} /> Exportar CSV
            </Button>
            <Button
              variant="tactical"
              size="sm"
              className="gap-2"
              onClick={() => {
                clearDossier();
                toast.success("Planilha limpa");
              }}
            >
              <Trash2 size={15} /> Limpar
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <div className="relative min-w-[220px] flex-1">
              <SearchIcon
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filtrar campo, valor, alvo..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["todos", ...targets].map((t) => (
                <button
                  key={t}
                  onClick={() => setTarget(t)}
                  className={`rounded-sm border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                    target === t
                      ? "border-signal bg-signal/10 text-signal"
                      : "border-border text-muted-foreground hover:border-signal/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </section>

        {grouped.length === 0 ? (
          <div className="panel rounded-sm border border-dashed border-border p-12 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              Nenhum dado coletado ainda.
            </p>
            <p className="mt-2 text-xs text-muted-foreground/60">
              Faça uma consulta em Synx Search ou OSINT — os resultados entram
              nesta planilha automaticamente.
            </p>
          </div>
        ) : (
          grouped.map(([alvo, list]) => (
            <section
              key={alvo}
              className="panel overflow-hidden rounded-sm border border-border"
            >
              <div className="flex items-center gap-3 border-b border-border bg-surface-2/40 px-4 py-2.5">
                <p className="mono-label text-signal">alvo</p>
                <p className="mr-auto truncate font-mono text-sm text-foreground">
                  {alvo}
                </p>
                <span className="mono-label text-muted-foreground/70">
                  {list.length} campos
                </span>
                <button
                  onClick={() => removeTarget(alvo)}
                  className="rounded-sm border border-border p-1.5 text-muted-foreground transition-colors hover:border-danger/50 hover:text-danger"
                  aria-label={`Remover ${alvo}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-surface-2/20">
                      {["Categoria", "Campo", "Valor", "Origem", "Data"].map((h) => (
                        <th
                          key={h}
                          className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((r, i) => (
                      <tr
                        key={r.id}
                        className={i % 2 ? "bg-surface-2/10" : undefined}
                      >
                        <td className="border-b border-border/60 px-3 py-2 font-mono text-[11px] uppercase text-signal/80">
                          {r.category}
                        </td>
                        <td className="border-b border-border/60 px-3 py-2 font-mono text-[11px] text-muted-foreground">
                          {r.field}
                        </td>
                        <td className="max-w-[420px] break-words border-b border-border/60 px-3 py-2 font-mono text-xs text-foreground">
                          {r.value}
                        </td>
                        <td className="whitespace-nowrap border-b border-border/60 px-3 py-2 font-mono text-[11px] text-muted-foreground/70">
                          {r.module} · {r.tool}
                        </td>
                        <td className="whitespace-nowrap border-b border-border/60 px-3 py-2 font-mono text-[10px] text-muted-foreground/50">
                          {new Date(r.ts).toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        )}
      </div>
    </AppShell>
  );
}
