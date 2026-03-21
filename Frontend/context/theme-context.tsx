"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  THEME_STORAGE_KEY,
  UI_THEME_EVENT,
  resolveUiThemeFromStorage,
  isUiTheme,
  isDarkColorScheme,
  type UiTheme,
} from "@/lib/theme-storage";

export { THEME_STORAGE_KEY, UI_THEME_EVENT } from "@/lib/theme-storage";

type Theme = UiTheme;

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  /* eslint-disable react-hooks/set-state-in-effect -- hidratação: ler tema do storage após mount evita mismatch SSR/cliente */
  useLayoutEffect(() => {
    const resolved = resolveUiThemeFromStorage() ?? "light";
    setThemeState(resolved);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, resolved);
    } catch {
      /* */
    }
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", resolved);
      document.documentElement.style.colorScheme = isDarkColorScheme(resolved)
        ? "dark"
        : "light";
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const apply = (t: Theme) => {
      setThemeState(t);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, t);
      } catch {
        /* */
      }
    };
    const onCustom = (e: Event) => {
      const d = (e as CustomEvent<unknown>).detail;
      if (isUiTheme(d)) apply(d);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue != null && isUiTheme(e.newValue)) {
        apply(e.newValue);
      }
    };
    window.addEventListener(UI_THEME_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(UI_THEME_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = isDarkColorScheme(theme) ? "dark" : "light";
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "light" as Theme,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}
