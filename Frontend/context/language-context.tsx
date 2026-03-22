"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { LANG_COOKIE_NAME, type LanguageCode, languageToHtmlLang } from "@/lib/locale-html";

export type Language = LanguageCode;

const STORAGE_KEY = "neurocode-lang";

function persistLangCookie(lang: Language) {
  if (typeof document === "undefined") return;
  document.cookie = `${LANG_COOKIE_NAME}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
}

// ─── Lazy import messages ──────────────────────────────────────────────────────
async function loadMessages(lang: Language) {
  switch (lang) {
    case "en": return (await import("@/locales/en.json")).default;
    case "es": return (await import("@/locales/es.json")).default;
    case "fr": return (await import("@/locales/fr.json")).default;
    default:   return (await import("@/locales/pt.json")).default;
  }
}

type Messages = Record<string, Record<string, string>>;

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: string, key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  /** Definido no layout a partir do cookie `neurocode-lang` — evita PT no SSR/hidratação quando o cookie já é en/es/fr. */
  initialLanguage = "pt",
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageSate] = useState<Language>(initialLanguage);
  const [messages, setMessages] = useState<Messages>({});

  // Preferência do dispositivo (localStorage) > cookie do layout (idioma já escolhido) > pt
  useEffect(() => {
    const stored = (typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null) as Language | null;
    const resolved: Language =
      stored && ["pt", "en", "es", "fr"].includes(stored) ? stored : initialLanguage;
    setLanguageSate(resolved);
    persistLangCookie(resolved);
    loadMessages(resolved).then(setMessages);
  }, [initialLanguage]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageSate(lang);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, lang);
    persistLangCookie(lang);
    loadMessages(lang).then(setMessages);
  }, []);

  const htmlLang = languageToHtmlLang(language);
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = htmlLang;
  }, [htmlLang]);

  const t = useCallback((section: string, key: string) => {
    return messages?.[section]?.[key] ?? key;
  }, [messages]);

  const contextValue = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
