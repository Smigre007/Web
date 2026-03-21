/**
 * Preferências em localStorage para o gerador, CodeViewer e tema da interface.
 */

import {
  THEME_STORAGE_KEY,
  UI_THEME_EVENT,
  NEUROCODE_PREFS_KEY,
  isUiTheme,
} from "@/lib/theme-storage";
import { isProjectTypeId } from "@/lib/project-types";

export { NEUROCODE_PREFS_KEY };
export const NEUROCODE_CODE_THEME_KEY = "neurocode-code-theme";

export const CODE_THEME_EVENT = "neurocode:code-theme-change";
export const DEFAULT_PROJECT_TYPE_EVENT = "neurocode:default-project-type-change";

export function readLocalPrefsJson(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(NEUROCODE_PREFS_KEY) || "{}") as Record<
      string,
      unknown
    >;
  } catch {
    return {};
  }
}

/** Mescla campos nas prefs locais e notifica o CodeViewer se o tema mudar. */
export function mergePrefsIntoLocalStorage(patch: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    const prev = readLocalPrefsJson();
    const merged = { ...prev, ...patch };
    localStorage.setItem(NEUROCODE_PREFS_KEY, JSON.stringify(merged));
    const theme = merged.codeTheme;
    if (typeof theme === "string" && theme) {
      localStorage.setItem(NEUROCODE_CODE_THEME_KEY, theme);
      /* Evita setState no ThemeProvider/CodeViewer durante setState doutro componente (ex.: SettingsPage). */
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent(CODE_THEME_EVENT, { detail: theme }));
      });
    }
    const ui = merged.uiTheme;
    if (isUiTheme(ui)) {
      localStorage.setItem(THEME_STORAGE_KEY, ui);
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent(UI_THEME_EVENT, { detail: ui }));
      });
    }
    if ("defaultProjectType" in patch) {
      const next = merged.defaultProjectType;
      const prevDt = prev.defaultProjectType;
      if (isProjectTypeId(next) && next !== prevDt) {
        queueMicrotask(() => {
          window.dispatchEvent(
            new CustomEvent(DEFAULT_PROJECT_TYPE_EVENT, { detail: next })
          );
        });
      }
    }
  } catch {
    /* ignore */
  }
}
