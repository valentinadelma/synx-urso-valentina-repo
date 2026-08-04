import { createFileRoute } from "@tanstack/react-router";
import { Check, Image as ImageIcon, Palette, RotateCcw, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_AVATAR, useAvatar, useTheme } from "@/lib/theme";
import { ANIME_POSITIONS, useAnime } from "@/lib/anime";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — Temas e Perfil | SYNX" },
      {
        name: "description",
        content:
          "Escolha o tema de cores do portal SYNX e defina a foto de perfil do agente.",
      },
      { property: "og:title", content: "Configurações — Temas e Perfil | SYNX" },
      {
        property: "og:description",
        content:
          "Escolha o tema de cores do portal SYNX e defina a foto de perfil do agente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsRoute,
});

function SettingsRoute() {
  return (
    <AuthGuard permission="settings">
      <Settings />
    </AuthGuard>
  );
}

function Settings() {
  const { theme, setTheme, themes } = useTheme();
  const { avatar, setAvatar } = useAvatar();
  const { config: anime, setConfig: setAnime, chars } = useAnime();
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file?: File) => {
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx. 1,5 MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(String(reader.result));
      toast.success("Foto de perfil atualizada");
    };
    reader.readAsDataURL(file);
  };

  return (
    <AppShell title="Configurações" eyebrow="Aparência" activePath="/settings">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Temas */}
        <section className="rounded-sm border border-border bg-surface/80 p-6">
          <div className="mb-5 flex items-center gap-2">
            <Palette size={16} className="text-signal" />
            <h2 className="font-display text-lg font-bold uppercase tracking-[0.15em]">
              Tema do site
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {themes.map((t) => {
              const active = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    toast.success(`Tema ${t.name} aplicado`);
                  }}
                  className={`group rounded-sm border p-4 text-left transition-colors ${
                    active
                      ? "border-signal bg-signal/10"
                      : "border-border bg-surface-2/40 hover:border-signal/40"
                  }`}
                >
                  <div className="mb-3 flex gap-1.5">
                    {t.swatch.map((c) => (
                      <span
                        key={c}
                        className="h-7 flex-1 rounded-sm border border-border/60"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-semibold uppercase tracking-[0.12em]">
                      {t.name}
                    </span>
                    {active ? <Check size={15} className="text-signal" /> : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Companheira anime */}
        <section className="rounded-sm border border-border bg-surface/80 p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-signal" />
              <h2 className="font-display text-lg font-bold uppercase tracking-[0.15em]">
                Companheira (anime)
              </h2>
            </div>
            <Button
              variant={anime.enabled ? "danger" : "signal"}
              size="sm"
              onClick={() => setAnime({ enabled: !anime.enabled })}
            >
              {anime.enabled ? "Desativar" : "Ativar"}
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {chars.map((c) => {
              const active = c.id === anime.charId;
              return (
                <button
                  key={c.id}
                  onClick={() => setAnime({ charId: c.id, enabled: true })}
                  className={`flex h-40 items-end justify-center overflow-hidden rounded-sm border transition-colors ${
                    active
                      ? "border-signal bg-signal/10"
                      : "border-border bg-surface-2/40 hover:border-signal/40"
                  }`}
                >
                  <img
                    src={c.src}
                    alt={c.name}
                    loading="lazy"
                    width={768}
                    height={1024}
                    className="h-[150px] w-auto object-contain"
                  />
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="mono-label text-muted-foreground">
                Posição na tela
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {ANIME_POSITIONS.map((p) => {
                  const active = p.id === anime.position;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setAnime({ position: p.id })}
                      className={`rounded-sm border px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                        active
                          ? "border-signal bg-signal/10 text-signal"
                          : "border-border bg-surface-2/40 text-muted-foreground hover:border-signal/40"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="mono-label text-muted-foreground">
                  Tamanho · {anime.size}vh
                </Label>
                <input
                  type="range"
                  min={20}
                  max={70}
                  value={anime.size}
                  onChange={(e) => setAnime({ size: Number(e.target.value) })}
                  className="mt-2 w-full accent-[var(--signal)]"
                />
              </div>
              <div>
                <Label className="mono-label text-muted-foreground">
                  Opacidade · {anime.opacity}%
                </Label>
                <input
                  type="range"
                  min={15}
                  max={100}
                  value={anime.opacity}
                  onChange={(e) => setAnime({ opacity: Number(e.target.value) })}
                  className="mt-2 w-full accent-[var(--signal)]"
                />
              </div>
            </div>
          </div>
          <p className="mt-4 font-mono text-[11px] text-muted-foreground/60">
            A arte fica fixa no canto escolhido, sem bloquear cliques. Ocultada
            automaticamente em telas pequenas.
          </p>
        </section>


        {/* Foto de perfil */}
        <section className="rounded-sm border border-border bg-surface/80 p-6">
          <div className="mb-5 flex items-center gap-2">
            <ImageIcon size={16} className="text-signal" />
            <h2 className="font-display text-lg font-bold uppercase tracking-[0.15em]">
              Foto de perfil
            </h2>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-sm border border-signal/35 bg-signal/10">
              <img
                src={avatar}
                alt="Foto de perfil atual"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label className="mono-label text-muted-foreground">
                  Enviar imagem
                </Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileRef.current?.click()}
                  className="w-full sm:w-auto"
                >
                  Escolher arquivo
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar-url" className="mono-label text-muted-foreground">
                  Ou usar uma URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="avatar-url"
                    value={url}
                    placeholder="https://…"
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-10 rounded-sm font-mono"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (!url.trim()) return;
                      setAvatar(url.trim());
                      setUrl("");
                      toast.success("Foto de perfil atualizada");
                    }}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="gap-2 text-muted-foreground"
                onClick={() => {
                  setAvatar(DEFAULT_AVATAR);
                  toast.success("Foto restaurada para o padrão");
                }}
              >
                <RotateCcw size={14} />
                Restaurar padrão
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
