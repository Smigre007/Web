/**
 * Chaves e leitura do tema da interface (sem React) — evita ciclos com theme-context.
 */

export const THEME_STORAGE_KEY = "neurocode-landing-theme";

export const UI_THEME_EVENT = "neurocode:ui-theme-change";

/** Mesmo valor que neurocode-prefs-local NEUROCODE_PREFS_KEY */
export const NEUROCODE_PREFS_KEY = "neurocode-prefs";

export const UI_THEME_IDS = ["light", "dark", "monokai", "dracula"] as const;

export type UiTheme = (typeof UI_THEME_IDS)[number];

export function isUiTheme(v: unknown): v is UiTheme {
  return typeof v === "string" && (UI_THEME_IDS as readonly string[]).includes(v);
}

/** Para color-scheme CSS: só light é esquema claro. */
export function isDarkColorScheme(theme: UiTheme): boolean {
  return theme !== "light";
}

/**
 * 1) neurocode-landing-theme
 * 2) campo uiTheme dentro de neurocode-prefs (JSON)
 */
export function resolveUiThemeFromStorage(): UiTheme | null {
  if (typeof window === "undefined") return null;
  try {
    const direct = localStorage.getItem(THEME_STORAGE_KEY);
    if (isUiTheme(direct)) return direct;
    const raw = localStorage.getItem(NEUROCODE_PREFS_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as { uiTheme?: unknown };
    if (isUiTheme(j.uiTheme)) return j.uiTheme;
  } catch {
    /* ignore */
  }
  return null;
}
