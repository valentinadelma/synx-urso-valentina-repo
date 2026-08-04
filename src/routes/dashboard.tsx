import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  FileText,
  Layers,
  Phone,
  Search,
  Wrench,
  ArrowUpRight,
} from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { modules } from "@/lib/synx-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Módulos — SYNX Portal de Consulta" },
      {
        name: "description",
        content:
          "Grupos de ferramentas, aplicações e conteúdos disponíveis para o seu perfil no portal SYNX.",
      },
      { property: "og:title", content: "Módulos — SYNX Portal de Consulta" },
      {
        property: "og:description",
        content:
          "Grupos de ferramentas, aplicações e conteúdos disponíveis para o seu perfil no portal SYNX.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardRoute,
});

const moduleIcons: Record<string, ReactNode> = {
  analise: <BarChart3 size={24} />,
  ferramentas: <Wrench size={24} />,
  documentos: <FileText size={24} />,
  sistemas: <Layers size={24} />,
  investigacao: <Search size={24} />,
  contatos: <Phone size={24} />,
};

function DashboardRoute() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppShell title="Módulos" eyebrow="Painel operacional" activePath="/dashboard">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Grupos de ferramentas, aplicações e conteúdos disponíveis para o seu
            perfil. Escolha um módulo para ver o que há dentro dele.
          </p>
          <div className="flex shrink-0 items-center gap-3 rounded-sm border border-border bg-surface-2/50 px-4 py-2">
            <span className="mono-label text-muted-foreground">Módulos</span>
            <span className="font-mono text-lg font-bold text-signal">
              {String(modules.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod, i) => (
            <button
              key={mod.id}
              onClick={() => navigate({ to: "/module/$id", params: { id: mod.id } })}
              className="group relative overflow-hidden rounded-sm border border-border bg-surface/80 p-6 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-signal/40 hover:shadow-[0_20px_50px_-25px_var(--signal)]"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-40"
                style={{
                  background: `linear-gradient(90deg, transparent, ${mod.color}, transparent)`,
                }}
              />
              <div className="mb-5 flex items-start justify-between">
                <div
                  className="grid h-12 w-12 place-items-center rounded-sm transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: `${mod.color}1f`,
                    color: mod.color,
                    boxShadow: `inset 0 0 0 1px ${mod.color}33`,
                  }}
                >
                  {moduleIcons[mod.id]}
                </div>
                <span className="mono-label text-muted-foreground/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="font-display text-lg font-semibold">{mod.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {mod.description}
              </p>

              <span
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: mod.color }}
              >
                Ver conteúdo
                <ArrowUpRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
