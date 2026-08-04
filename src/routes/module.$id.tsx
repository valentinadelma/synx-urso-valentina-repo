import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Inbox } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { moduleDetails } from "@/lib/synx-data";

export const Route = createFileRoute("/module/$id")({
  head: () => ({
    meta: [
      { title: "Módulo — SYNX Portal de Consulta" },
      {
        name: "description",
        content:
          "Conteúdos, ferramentas e sistemas disponíveis dentro do módulo selecionado do portal SYNX.",
      },
      { property: "og:title", content: "Módulo — SYNX Portal de Consulta" },
      {
        property: "og:description",
        content:
          "Conteúdos, ferramentas e sistemas disponíveis dentro do módulo selecionado do portal SYNX.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ModuleRoute,
});

function ModuleRoute() {
  return (
    <AuthGuard permission="modules">
      <ModuleDetail />
    </AuthGuard>
  );
}

function ModuleDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const mod = moduleDetails[id];

  if (!mod) {
    return (
      <AppShell title="Módulo não encontrado" activePath="/dashboard">
        <div className="mx-auto max-w-md rounded-sm border border-border bg-surface/80 p-10 text-center">
          <h2 className="font-display text-2xl font-bold">Módulo não encontrado</h2>
          <Button
            variant="signal"
            className="mt-6"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={mod.title} eyebrow={`Módulo · ${id}`} activePath="/dashboard">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        <div
          className="mb-8 rounded-sm border border-border bg-surface/70 p-6"
          style={{ boxShadow: `inset 3px 0 0 0 ${mod.color}` }}
        >
          <p className="text-sm text-muted-foreground">{mod.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="mono-label text-muted-foreground/60">Itens</span>
            <span className="font-mono text-sm font-bold" style={{ color: mod.color }}>
              {String(mod.content.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {mod.content.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {mod.content.map((item, index) => (
              <article
                key={index}
                className="group flex flex-col rounded-sm border border-border bg-surface/80 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-signal/40"
              >
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>

                {item.tags && item.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="mono-label rounded-md border border-border bg-surface-2/70 px-2 py-1 text-signal"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <a
                  href={item.link}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: mod.color }}
                >
                  Abrir link
                  <ExternalLink size={14} />
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-sm border border-dashed border-border bg-surface/50 p-14 text-center">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-surface-2">
              <Inbox size={22} className="text-muted-foreground" />
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Este módulo ainda não possui conteúdo disponível.
            </p>
            <Button variant="signal" onClick={() => navigate({ to: "/dashboard" })}>
              Voltar ao Dashboard
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
