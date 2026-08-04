import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, Fingerprint, Mail, ShieldCheck, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useAvatar } from "@/lib/theme";
const LOGO_URL = "/synx-logo.png";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Perfil do Agente — SYNX" },
      {
        name: "description",
        content:
          "Dados cadastrais, credenciais e nível de acesso do agente autenticado no portal SYNX.",
      },
      { property: "og:title", content: "Perfil do Agente — SYNX" },
      {
        property: "og:description",
        content:
          "Dados cadastrais, credenciais e nível de acesso do agente autenticado no portal SYNX.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfileRoute,
});

function ProfileRoute() {
  return (
    <AuthGuard>
      <Profile />
    </AuthGuard>
  );
}

function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { avatar } = useAvatar();

  const fields = [
    { label: "Nome completo", value: user?.name || "—", icon: User },
    { label: "E-mail", value: user?.email || "—", icon: Mail },
    { label: "CPF", value: user?.cpf || "—", icon: Fingerprint },
    { label: "Perfil de acesso", value: user?.role || "—", icon: BadgeCheck },
  ];

  return (
    <AppShell title="Perfil do Agente" eyebrow="Credenciais" activePath="/profile">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        <div className="overflow-hidden rounded-sm border border-border bg-surface/80 backdrop-blur-sm">
          <div className="relative border-b border-border p-7">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: `url(${avatar})`,
                backgroundSize: "contain",
                backgroundPosition: "right center",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-sm border border-signal/30 bg-signal/10">
                <img
                  src={LOGO_URL}
                  alt="Avatar do agente"
                  className="h-full w-full object-contain p-1.5"
                />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-display text-2xl font-bold">
                  {user?.name || "Usuário"}
                </h2>
                <p className="mono-label mt-1 truncate text-muted-foreground">
                  ID {user?.id || "—"}
                </p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-success/25 bg-success/8 px-3 py-1">
                  <ShieldCheck size={13} className="text-success" />
                  <span className="mono-label text-success">Sessão ativa</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label} className="bg-surface p-6">
                <div className="mb-2 flex items-center gap-2">
                  <field.icon size={14} className="shrink-0 text-signal/70" />
                  <span className="mono-label text-muted-foreground">
                    {field.label}
                  </span>
                </div>
                <p className="truncate font-mono text-sm text-foreground">
                  {field.value}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-6">
            <Button
              variant="signal"
              className="w-full sm:w-auto"
              onClick={() => navigate({ to: "/dashboard" })}
            >
              Voltar aos módulos
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
