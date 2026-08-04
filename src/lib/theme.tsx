import { useCallback, useEffect, useState } from "react";

/* ------------------------------------------------------------------
 * Temas do SYNX — trocam as cores do site inteiro.
 * O tema é aplicado como data-theme no <html> e persiste no navegador.
 * ------------------------------------------------------------------ */

export const THEME_KEY = "synx_theme";
export const AVATAR_KEY = "synx_avatar";
export const DEFAULT_THEME = "urso";
export const DEFAULT_AVATAR = "/synx-logo.png";

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  swatch: string[];
}

export const THEMES: ThemeOption[] = [
  {
    id: "urso",
    name: "Urso",
    description: "Marrom quente com bege — identidade padrão",
    swatch: ["#20180f", "#3a2c1c", "#8a5a35", "#d9b382"],
  },
  {
    id: "wired",
    name: "Wired",
    description: "Preto abissal com âmbar CRT",
    swatch: ["#14110d", "#1f1a15", "#3a2f22", "#e8a13c"],
  },
  {
    id: "gelo",
    name: "Gelo",
    description: "Azul profundo com ciano",
    swatch: ["#0e1420", "#161f31", "#27405f", "#5fa8e8"],
  },
  {
    id: "matrix",
    name: "Matrix",
    description: "Verde terminal sobre preto",
    swatch: ["#0c130f", "#132018", "#1d3d2a", "#4ee08a"],
  },
  {
    id: "rubi",
    name: "Rubi",
    description: "Vermelho tático com dourado",
    swatch: ["#150e0f", "#241416", "#4a1e22", "#e0464b"],
  },
  {
    id: "claro",
    name: "Claro",
    description: "Fundo claro, alto contraste diurno",
    swatch: ["#f7f4ef", "#ffffff", "#d9d2c7", "#8a5a35"],
  },
];

export function applyTheme(id: string) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", id);
}

export function useTheme() {
  const [theme, setThemeState] = useState<string>(DEFAULT_THEME);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
    setThemeState(saved);
    applyTheme(saved);
  }, []);

  const setTheme = useCallback((id: string) => {
    localStorage.setItem(THEME_KEY, id);
    setThemeState(id);
    applyTheme(id);
  }, []);

  return { theme, setTheme, themes: THEMES };
}

/** Foto de perfil do agente (data URL ou caminho). */
export function useAvatar() {
  const [avatar, setAvatarState] = useState<string>(DEFAULT_AVATAR);

  useEffect(() => {
    const saved = localStorage.getItem(AVATAR_KEY);
    if (saved) setAvatarState(saved);
    const onChange = () =>
      setAvatarState(localStorage.getItem(AVATAR_KEY) || DEFAULT_AVATAR);
    window.addEventListener("synx:avatar", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("synx:avatar", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setAvatar = useCallback((value: string) => {
    if (value) localStorage.setItem(AVATAR_KEY, value);
    else localStorage.removeItem(AVATAR_KEY);
    setAvatarState(value || DEFAULT_AVATAR);
    window.dispatchEvent(new Event("synx:avatar"));
  }, []);

  return { avatar, setAvatar };
}
