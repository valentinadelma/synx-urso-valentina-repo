import { useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, PanelLeftClose, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { WiredBackdrop } from "@/components/WiredBackdrop";
import { AnimeOverlay } from "@/lib/anime";
import { useAuth, type PermissionId } from "@/lib/auth";
import { useAvatar, useTheme } from "@/lib/theme";
const LOGO_URL = "/synx-logo.png";

const navItems: {
  label: string;
  code: string;
  to: string | null;
  permission?: PermissionId;
  ownerOnly?: boolean;
}[] = [
  { label: "Módulos", code: "MOD", to: "/dashboard" },
  { label: "Synx Search", code: "SRC", to: "/synx-search", permission: "synx-search" },
  { label: "OSINT Intelligence", code: "OSINT", to: "/osint", permission: "osint" },
  { label: "Painel Owner", code: "OWN", to: "/admin", ownerOnly: true },
  { label: "Configurações", code: "CFG", to: "/settings", permission: "settings" },
  { label: "Manuais", code: "DOC", to: null },
  { label: "Planilha Inv", code: "PLN", to: "/planilha" },
];


function Clock() {
  const [now, setNow] = useState<string>("--:--:--");
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("pt-BR", { hour12: false }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-xs text-signal/80">{now}</span>;
}

export function AppShell({
  title,
  eyebrow,
  children,
  activePath,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  activePath: string;
}) {
  const navigate = useNavigate();
  const { user, logout, isOwner, can } = useAuth();
  const { avatar } = useAvatar();
  useTheme();
  const [open, setOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-background text-foreground">
      <WiredBackdrop />
      <AnimeOverlay />

      <div className="relative z-10 flex h-full w-full">
        {/* Sidebar */}
        <aside
          className={`${open ? "w-64" : "w-0"} flex flex-col overflow-hidden border-r border-border bg-sidebar/90 backdrop-blur-xl transition-all duration-300`}
        >
          <div className="border-b border-border p-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-sm border border-signal/30 bg-signal/10">
                <img
                  src={LOGO_URL}
                  alt="Logotipo SYNX"
                  className="h-full w-full object-contain p-1"
                />
              </div>
              <div className="min-w-0">
                <h2
                  className="glitch truncate font-display text-lg font-bold uppercase tracking-[0.3em]"
                  data-text="SYNX"
                >
                  SYNX
                </h2>
                <p className="mono-label truncate text-muted-foreground/70">
                  the wired
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            <div className="mono-label px-3 py-3 text-muted-foreground/50">
              Geral
            </div>
            {navItems
              .filter((item) => (item.ownerOnly ? isOwner : can(item.permission)))
              .map((item) => {
              const active = item.to === activePath;
              return (
                <button
                  key={item.label}
                  onClick={() => item.to && navigate({ to: item.to })}
                  className={`group flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-sm transition-all ${
                    active
                      ? "bg-signal/10 text-signal shadow-[inset_2px_0_0_0_var(--signal)]"
                      : "text-muted-foreground hover:bg-surface-2/70 hover:text-foreground"
                  }`}
                >
                  <span
                    className={`mono-label rounded-sm px-1.5 py-0.5 text-[9px] ${
                      active
                        ? "bg-signal/20 text-signal"
                        : "bg-surface-2 text-muted-foreground/70"
                    }`}
                  >
                    {item.code}
                  </span>
                  <span className="truncate font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-border p-4">
            <div className="mb-3 flex items-center justify-between gap-2 rounded-sm border border-success/25 bg-success/8 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <ShieldCheck size={13} className="shrink-0 text-success" />
                <span className="mono-label truncate text-success">
                  canal seguro
                </span>
              </div>
              <Clock />
            </div>
            <Button
              onClick={handleLogout}
              variant="danger"
              className="w-full gap-2"
            >
              <LogOut size={16} />
              Desconectar
            </Button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border bg-surface/60 px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setOpen(!open)}
                className="shrink-0 rounded-sm border border-transparent p-2 text-muted-foreground transition-colors hover:border-border hover:text-signal"
                aria-label="Alternar menu lateral"
              >
                {open ? <PanelLeftClose size={18} /> : <Menu size={18} />}
              </button>
              <div className="min-w-0">
                {eyebrow ? (
                  <p className="mono-label truncate text-signal/70">{eyebrow}</p>
                ) : null}
                <h1
                  className="truncate font-display text-xl font-bold uppercase tracking-[0.08em] sm:text-2xl"
                  data-text={title}
                >
                  {title}
                </h1>
              </div>
            </div>

            <button
              onClick={() => navigate({ to: "/profile" })}
              className="flex shrink-0 items-center gap-3 rounded-sm border border-border bg-surface-2/50 px-3 py-1.5 transition-colors hover:border-signal/40"
            >
              <div className="hidden text-right sm:block">
                <p className="font-mono text-sm leading-tight text-foreground">
                  {user?.name || "Usuário"}
                </p>
                <p className="mono-label text-muted-foreground/70">
                  agente · synx
                </p>
              </div>
              <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-sm border border-signal/35 bg-signal/10">
                <img
                  src={avatar}
                  alt="Avatar do agente"
                  className="h-full w-full object-cover"
                />
              </div>
            </button>
          </header>

          <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>

          <footer className="hidden items-center justify-between border-t border-border bg-background/70 px-6 py-1.5 md:flex">
            <span className="mono-label text-muted-foreground/40">
              synx // wired protocol 7
            </span>
            <span className="mono-label text-muted-foreground/40">
              and you don't seem to understand
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
