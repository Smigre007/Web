/** Cookie name (same values as `localStorage` key neurocode-lang: pt | en | es | fr) */
export const LANG_COOKIE_NAME = "neurocode-lang" as const;

export type LanguageCode = "pt" | "en" | "es" | "fr";

const VALID: LanguageCode[] = ["pt", "en", "es", "fr"];

export function isLanguageCode(v: string | undefined): v is LanguageCode {
  return !!v && VALID.includes(v as LanguageCode);
}

/** HTML `lang` attribute (BCP 47). */
export function languageToHtmlLang(lang: LanguageCode): string {
  if (lang === "pt") return "pt-BR";
  return lang;
}

/** Cookie stores same codes as localStorage (pt, en, es, fr). */
export function cookieValueToHtmlLang(value: string | undefined): string {
  if (isLanguageCode(value)) return languageToHtmlLang(value);
  return "pt-BR";
}
