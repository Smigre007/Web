"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage, type Language } from "@/context/language-context";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English",   flag: "🇺🇸" },
  { code: "es", label: "Español",   flag: "🇪🇸" },
  { code: "fr", label: "Français",  flag: "🇫🇷" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 p-2 rounded-full text-ink-35 hover:text-ink-60
                   hover:bg-ink/[0.05] transition-all duration-200"
        aria-label="Select language"
        title={current.label}
      >
        <span className="text-sm leading-none">{current.flag}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-ink-15
                        bg-cream shadow-lg shadow-ink/[0.06] overflow-hidden z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors duration-150
                ${lang.code === language
                  ? "bg-gold/10 text-gold font-semibold"
                  : "text-ink-60 hover:bg-ink/[0.04] hover:text-ink"
                }`}
            >
              <span className="text-base leading-none">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
