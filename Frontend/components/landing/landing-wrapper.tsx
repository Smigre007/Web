"use client";

import { type ReactNode } from "react";

// ThemeProvider + LanguageProvider are now global (see components/global-providers.tsx).
// LandingWrapper is kept as a structural pass-through to avoid breaking imports.
export function LandingWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
