import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  KeyRound,
  Search as SearchIcon,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PERMISSIONS,
  clearLogs,
  createUser,
  deleteUser,
  listUsers,
  readLogs,
  resetUserPassword,
  setUserPermissions,
  type PermissionId,
  type SearchLog,
  type StoredUser,
} from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Owner — Logins e Permissões | SYNX" },
      {
        name: "description",
        content:
          "Painel exclusivo do Owner: criar e excluir logins, definir permissões de página e auditar as pesquisas dos usuários.",
      },
      { property: "og:title", content: "Painel Owner — Logins e Permissões | SYNX" },
      {
        property: "og:description",
        content:
          "Crie logins, defina permissões por página e acompanhe o histórico de pesquisas dos agentes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  return (
    <AuthGuard ownerOnly>
      <Admin />
    </AuthGuard>
  );
}

const maskCpf = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");

function Admin() {
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [logs, setLogs] = useState<SearchLog[]>([]);
  const [tab, setTab] = useState<"users" | "logs">("users");
  const [filter, setFilter] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [perms, setPerms] = useState<PermissionId[]>(["synx-search", "modules"]);

  const refresh = () => {
    setUsers(listUsers());
    setLogs(readLogs());
  };

  useEffect(() => {
    refresh();
    const onLogs = () => setLogs(readLogs());
    window.addEventListener("synx:logs", onLogs);
    return () => window.removeEventListener("synx:logs", onLogs);
  }, []);

  const togglePerm = (id: PermissionId) =>
    setPerms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createUser({ name, email, cpf, password, permissions: perms });
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message);
    setName("");
    setEmail("");
    setCpf("");
    setPassword("");
    refresh();
  };

  const filteredLogs = useMemo(() => {
    const q = filter.toLowerCase().trim();
    if (!q) return logs;
    return logs.filter(
      (l) =>
        l.userName.toLowerCase().includes(q) ||
        l.query.toLowerCase().includes(q) ||
        l.module.toLowerCase().includes(q) ||
        l.tool.toLowerCase().includes(q),
    );
  }, [logs, filter]);

  const fieldClass =
    "h-11 rounded-sm bg-background/70 border-border font-mono text-foreground placeholder:text-muted-foreground/40 focus-visible:border-signal";

  return (
    <AppShell title="Painel Owner" eyebrow="Controle de acesso" activePath="/admin">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Abas */}
        <div className="flex gap-2">
          {(
            [
              { id: "users", label: "Logins & Permissões", icon: Users },
              { id: "logs", label: "Pesquisas dos usuários", icon: SearchIcon },
            ] as const
          ).map((t) => {
            const active = tab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-sm border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                  active
                    ? "border-signal bg-signal/10 text-signal"
                    : "border-border bg-surface-2/40 text-muted-foreground hover:border-signal/40"
                }`}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "users" ? (
          <>
            {/* Criar login */}
            <section className="rounded-sm border border-border bg-surface/80 p-6">
              <div className="mb-5 flex items-center gap-2">
                <UserPlus size={16} className="text-signal" />
                <h2 className="font-display text-lg font-bold uppercase tracking-[0.15em]">
                  Criar login
                </h2>
              </div>
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label className="mono-label text-muted-foreground">Nome</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Agente"
                      className={fieldClass}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="mono-label text-muted-foreground">Email</Label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="agente@synx.io"
                      className={fieldClass}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="mono-label text-muted-foreground">
                      CPF (login opcional)
                    </Label>
                    <Input
                      value={cpf}
                      onChange={(e) => setCpf(maskCpf(e.target.value))}
                      placeholder="000.000.000-00"
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="mono-label text-muted-foreground">Senha</Label>
                    <Input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={fieldClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <p className="mono-label mb-2 text-muted-foreground">
                    Permissões de página
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PERMISSIONS.map((p) => {
                      const on = perms.includes(p.id);
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => togglePerm(p.id)}
                          className={`flex items-center gap-2 rounded-sm border px-3 py-2 text-left transition-colors ${
                            on
                              ? "border-signal bg-signal/10 text-signal"
                              : "border-border bg-surface-2/40 text-muted-foreground hover:border-signal/40"
                          }`}
                        >
                          {on ? <Check size={13} /> : <X size={13} />}
                          <span className="font-mono text-xs uppercase tracking-wider">
                            {p.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button type="submit" variant="signal" className="gap-2">
                  <UserPlus size={16} /> Criar login
                </Button>
              </form>
            </section>

            {/* Lista de logins */}
            <section className="rounded-sm border border-border bg-surface/80 p-6">
              <div className="mb-5 flex items-center gap-2">
                <Users size={16} className="text-signal" />
                <h2 className="font-display text-lg font-bold uppercase tracking-[0.15em]">
                  Logins ({users.length})
                </h2>
              </div>

              <div className="space-y-3">
                {users.map((u) => {
                  const owner = u.role === "owner";
                  const userPerms = owner
                    ? PERMISSIONS.map((p) => p.id)
                    : u.permissions || [];
                  return (
                    <div
                      key={u.id}
                      className="rounded-sm border border-border bg-surface-2/40 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 font-mono text-sm text-foreground">
                            {u.name}
                            {owner ? (
                              <span className="flex items-center gap-1 rounded-sm border border-gold/40 bg-gold/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-gold">
                                <ShieldCheck size={11} /> owner
                              </span>
                            ) : null}
                          </p>
                          <p className="mono-label text-muted-foreground/70">
                            {u.email}
                            {u.cpf ? ` · ${u.cpf}` : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="tactical"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              const pwd = window.prompt(
                                `Nova senha para ${u.name}:`,
                              );
                              if (!pwd) return;
                              const res = resetUserPassword(u.id, pwd);
                              res.success
                                ? toast.success(res.message)
                                : toast.error(res.message);
                            }}
                          >
                            <KeyRound size={14} /> Senha
                          </Button>
                          {!owner && (
                            <Button
                              variant="danger"
                              size="sm"
                              className="gap-2"
                              onClick={() => {
                                const res = deleteUser(u.id);
                                res.success
                                  ? toast.success(res.message)
                                  : toast.error(res.message);
                                refresh();
                              }}
                            >
                              <Trash2 size={14} /> Excluir
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {PERMISSIONS.map((p) => {
                          const on = userPerms.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              disabled={owner}
                              onClick={() => {
                                const next = on
                                  ? userPerms.filter((x) => x !== p.id)
                                  : [...userPerms, p.id];
                                setUserPermissions(u.id, next);
                                refresh();
                                toast.success(
                                  `${p.label}: ${on ? "removida" : "liberada"}`,
                                );
                              }}
                              className={`flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors disabled:opacity-60 ${
                                on
                                  ? "border-success/50 bg-success/10 text-success"
                                  : "border-border bg-background/40 text-muted-foreground hover:border-signal/40"
                              }`}
                            >
                              {on ? <Check size={12} /> : <X size={12} />}
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          <section className="rounded-sm border border-border bg-surface/80 p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <SearchIcon size={16} className="text-signal" />
                <h2 className="font-display text-lg font-bold uppercase tracking-[0.15em]">
                  Pesquisas ({filteredLogs.length})
                </h2>
              </div>
              <div className="flex gap-2">
                <Input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filtrar por usuário, termo ou módulo"
                  className="h-10 w-64 rounded-sm bg-background/70 font-mono text-xs"
                />
                <Button
                  variant="danger"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    clearLogs();
                    refresh();
                    toast.success("Histórico limpo");
                  }}
                >
                  <Trash2 size={14} /> Limpar
                </Button>
              </div>
            </div>

            {filteredLogs.length === 0 ? (
              <p className="py-16 text-center font-mono text-sm italic text-muted-foreground/50">
                Nenhuma pesquisa registrada ainda.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground/70">
                      <th className="px-3 py-2 font-normal uppercase">Data</th>
                      <th className="px-3 py-2 font-normal uppercase">Usuário</th>
                      <th className="px-3 py-2 font-normal uppercase">Módulo</th>
                      <th className="px-3 py-2 font-normal uppercase">Ferramenta</th>
                      <th className="px-3 py-2 font-normal uppercase">Termo</th>
                      <th className="px-3 py-2 font-normal uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((l) => (
                      <tr
                        key={l.id}
                        className="border-b border-border/50 text-foreground/85"
                      >
                        <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                          {new Date(l.at).toLocaleString("pt-BR")}
                        </td>
                        <td className="px-3 py-2">{l.userName}</td>
                        <td className="px-3 py-2 text-signal">{l.module}</td>
                        <td className="px-3 py-2 text-wire">{l.tool}</td>
                        <td className="max-w-[280px] truncate px-3 py-2">
                          {l.query}
                        </td>
                        <td
                          className={`px-3 py-2 ${l.status === "ok" ? "text-success" : "text-danger"}`}
                        >
                          {l.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}
