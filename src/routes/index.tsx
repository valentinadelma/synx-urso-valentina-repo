import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticleBackground } from "@/components/ParticleBackground";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
const LOGO_URL = "/synx-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SYNX — Acesso ao Portal de Inteligência" },
      {
        name: "description",
        content:
          "Acesso restrito ao portal SYNX. Entre com seu CPF e senha para usar os módulos de consulta e análise.",
      },
      { property: "og:title", content: "SYNX — Acesso ao Portal de Inteligência" },
      {
        property: "og:description",
        content:
          "Acesso restrito ao portal SYNX. Entre com seu CPF e senha para usar os módulos de consulta e análise.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

const maskCpf = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  useTheme();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/dashboard" });
  }, [isAuthenticated, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = login(cpf, password);
      if (result.success) {
        toast.success(result.message);
        navigate({ to: "/dashboard" });
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "h-11 rounded-sm bg-background/70 border-border font-mono text-foreground placeholder:text-muted-foreground/40 focus-visible:border-signal focus-visible:ring-signal/25 focus-visible:ring-[3px]";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <ParticleBackground />
      <div className="noise pointer-events-none absolute -inset-8 z-[2] opacity-[0.03]" />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-3xl items-center gap-10 rounded-sm border border-border bg-surface/80 p-8 shadow-[var(--shadow-panel)] backdrop-blur-xl sm:p-12 md:grid-cols-[auto_1fr]">
          {/* Identidade */}
          <div className="flex flex-col items-center gap-4 md:pr-10">
            <img
              src={LOGO_URL}
              alt="Logotipo SYNX"
              className="h-40 w-40 object-contain"
            />
            <h1
              className="signal-text font-display text-3xl font-bold uppercase tracking-[0.35em]"
              data-text="SYNX"
            >
              SYNX
            </h1>
          </div>

          {/* Login */}
          <form onSubmit={handleLogin} className="space-y-5">
            <p className="font-mono text-sm text-muted-foreground">Iniciar sessão</p>

            <div className="space-y-2">
              <Label htmlFor="cpf" className="mono-label text-muted-foreground">
                CPF
              </Label>
              <Input
                id="cpf"
                inputMode="numeric"
                autoComplete="username"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(maskCpf(e.target.value))}
                className={fieldClass}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="mono-label text-muted-foreground">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-sm font-display uppercase tracking-[0.2em]"
            >
              {loading ? "Verificando…" : "Entrar"}
            </Button>

            <div className="flex items-center gap-2 pt-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              <span className="mono-label text-muted-foreground">
                terminal seguro · acesso restrito
              </span>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
