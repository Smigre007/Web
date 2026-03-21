"use client";

import { ThemeProvider, useTheme } from "@/context/theme-context";
import { LanguageProvider } from "@/context/language-context";
import { type ReactNode } from "react";

function ThemedBody({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  return (
    <div
      data-theme={theme}
      className={`theme-editorial min-h-screen transition-[background-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isLight ? "bg-cream text-ink" : ""
      }`}
    >
      {children}
    </div>
  );
}

export function GlobalProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ThemedBody>{children}</ThemedBody>
      </LanguageProvider>
    </ThemeProvider>
  );
}
