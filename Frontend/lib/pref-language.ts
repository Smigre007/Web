import type { Language } from "@/context/language-context";

/** prefs.language usa pt-BR; o contexto usa pt | en | es | fr */
export function prefLanguageToContext(code: string | undefined): Language {
  if (code === "en" || code === "es" || code === "fr") return code;
  return "pt";
}
