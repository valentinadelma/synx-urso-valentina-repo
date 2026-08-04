import { useCallback, useEffect, useState } from "react";
import anime1 from "@/assets/anime-1.png";
import anime2 from "@/assets/anime-2.png";
import anime3 from "@/assets/anime-3.png";
import anime4 from "@/assets/anime-4.png";
import anime5 from "@/assets/anime-5.png";
import anime6 from "@/assets/anime-6.png";

/* ------------------------------------------------------------------
 * "Companheira" — arte anime fixa em um canto da tela.
 * Posicionada em um canto exato para não atrapalhar a interface.
 * ------------------------------------------------------------------ */

export const ANIME_KEY = "synx_anime";

export interface AnimeChar {
  id: string;
  name: string;
  src: string;
}

export const ANIME_CHARS: AnimeChar[] = [
  { id: "sakura", name: "Sakura", src: anime1 },
  { id: "aoi", name: "Aoi", src: anime2 },
  { id: "kurenai", name: "Kurenai", src: anime3 },
  { id: "lain-hoodie", name: "Lain (Bear Hoodie)", src: anime4 },
  { id: "lain-wired", name: "Lain (Wired)", src: anime5 },
  { id: "lain-suit", name: "Lain (Protocol)", src: anime6 },
];


export type AnimePosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

export const ANIME_POSITIONS: { id: AnimePosition; label: string }[] = [
  { id: "bottom-right", label: "Inferior direito" },
  { id: "bottom-left", label: "Inferior esquerdo" },
  { id: "top-right", label: "Superior direito" },
  { id: "top-left", label: "Superior esquerdo" },
];

export interface AnimeConfig {
  enabled: boolean;
  charId: string;
  position: AnimePosition;
  size: number; // altura em vh
  opacity: number; // 0-100
}

export const DEFAULT_ANIME: AnimeConfig = {
  enabled: true,
  charId: "sakura",
  position: "bottom-right",
  size: 42,
  opacity: 90,
};

function read(): AnimeConfig {
  if (typeof localStorage === "undefined") return DEFAULT_ANIME;
  try {
    const raw = localStorage.getItem(ANIME_KEY);
    if (!raw) return DEFAULT_ANIME;
    return { ...DEFAULT_ANIME, ...(JSON.parse(raw) as Partial<AnimeConfig>) };
  } catch {
    return DEFAULT_ANIME;
  }
}

export function useAnime() {
  const [config, setConfigState] = useState<AnimeConfig>(DEFAULT_ANIME);

  useEffect(() => {
    setConfigState(read());
    const onChange = () => setConfigState(read());
    window.addEventListener("synx:anime", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("synx:anime", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setConfig = useCallback((patch: Partial<AnimeConfig>) => {
    const next = { ...read(), ...patch };
    localStorage.setItem(ANIME_KEY, JSON.stringify(next));
    setConfigState(next);
    window.dispatchEvent(new Event("synx:anime"));
  }, []);

  return { config, setConfig, chars: ANIME_CHARS };
}

const POS_CLASS: Record<AnimePosition, string> = {
  "bottom-right": "bottom-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "top-right": "top-0 right-0",
  "top-left": "top-0 left-0",
};

export function AnimeOverlay() {
  const { config } = useAnime();
  const char = ANIME_CHARS.find((c) => c.id === config.charId) || ANIME_CHARS[0]!;

  if (!config.enabled) return null;

  return (
    <img
      src={char.src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      width={768}
      height={1024}
      className={`pointer-events-none fixed z-40 select-none object-contain drop-shadow-[0_0_24px_rgba(0,0,0,0.45)] ${POS_CLASS[config.position]} hidden lg:block`}
      style={{
        height: `${config.size}vh`,
        width: "auto",
        opacity: config.opacity / 100,
      }}
    />
  );
}
