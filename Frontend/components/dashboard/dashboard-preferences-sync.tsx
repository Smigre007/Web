"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { THEME_STORAGE_KEY, useTheme } from "@/context/theme-context";
import { isUiTheme } from "@/lib/theme-storage";
import { useLanguage } from "@/context/language-context";
import { prefLanguageToContext } from "@/lib/pref-language";
import { mergePrefsIntoLocalStorage } from "@/lib/neurocode-prefs-local";
import { isProjectTypeId } from "@/lib/project-types";

/**
 * Aplica idioma (e opcionalmente tema explícito da conta) vindos do servidor.
 * Só aplica uiTheme se existir no JSON da API (evita gravar "light" implícito e bloquear dark).
 */
export function DashboardPreferencesSync() {
  const { isLoaded, userId } = useAuth();
  const { setTheme } = useTheme();
  const { setLanguage } = useLanguage();
  const ran = useRef(false);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    if (ran.current) return;
    ran.current = true;
    let cancelled = false;
    fetch("/api/user/preferences")
      .then((r) => r.json())
      .then((data: { preferences?: Record<string, unknown> }) => {
        if (cancelled) return;
        const prefs = data.preferences ?? {};
        const hasExplicitUi = Object.prototype.hasOwnProperty.call(prefs, "uiTheme");
        const ui = prefs.uiTheme;
        if (hasExplicitUi && isUiTheme(ui)) {
          const localTheme =
            typeof window !== "undefined"
              ? window.localStorage.getItem(THEME_STORAGE_KEY)
              : null;
          if (!localTheme || localTheme === ui) {
            setTheme(ui);
          }
        }
        if (typeof prefs.language === "string" && prefs.language.trim() !== "") {
          setLanguage(prefLanguageToContext(prefs.language));
        }
        const dt = prefs.defaultProjectType;
        if (Object.prototype.hasOwnProperty.call(prefs, "defaultProjectType") && isProjectTypeId(dt)) {
          mergePrefsIntoLocalStorage({ defaultProjectType: dt });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isLoaded, userId, setTheme, setLanguage]);

  return null;
}
