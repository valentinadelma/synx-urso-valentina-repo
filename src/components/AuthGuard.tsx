import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth, type PermissionId } from "@/lib/auth";

export function AuthGuard({
  children,
  permission,
  ownerOnly,
}: {
  children: ReactNode;
  permission?: PermissionId;
  ownerOnly?: boolean;
}) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isOwner, can } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-signal" />
          <span className="mono-label text-muted-foreground">
            Autenticando sessão
          </span>
        </div>
      </div>
    );
  }

  const denied = (ownerOnly && !isOwner) || !can(permission);
  if (denied) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md rounded-sm border border-danger/40 bg-surface/80 p-8 text-center">
          <ShieldAlert className="mx-auto mb-4 h-8 w-8 text-danger" />
          <h1 className="font-display text-lg font-bold uppercase tracking-[0.2em] text-foreground">
            Acesso negado
          </h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            Seu login não tem permissão para este módulo. Solicite liberação ao
            Owner.
          </p>
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="mt-6 rounded-sm border border-border px-4 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-signal/50 hover:text-signal"
          >
            Voltar aos módulos
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
