"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/theme-context";
import { isDarkColorScheme } from "@/lib/theme-storage";
import { useLanguage } from "@/context/language-context";

const SECTION_IDS = [
  "hero",
  "agency-pack",
  "case-roi",
  "explore",
  "features",
  "how-it-works",
  "demo",
  "testimonials",
  "pricing",
  "objections",
  "faq",
] as const;

// Sections that have a dark background — labels/indicators must be white
const DARK_BG_SECTIONS = new Set(["explore"]);

export function SectionNav() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = isDarkColorScheme(theme);

  const sections = useMemo(
    () =>
      SECTION_IDS.map((id) => ({
        id,
        label: t("sectionNav", id),
      })),
    [t]
  );

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    els.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Force white colors when sitting over a dark-bg section; otherwise follow theme
  const onDark = isDark || DARK_BG_SECTIONS.has(activeId ?? "");

  return (
    <nav
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-0.5"
      aria-label={t("sectionNav", "ariaNav")}
    >
      {sections.map(({ id, label }) => {
        const isActive = activeId === id;
        return (
          <button
            key={id}
            onClick={() => goTo(id)}
            className="group flex items-center justify-end gap-2.5 py-1 text-right"
            aria-label={`${t("sectionNav", "goTo")} ${label}`}
            aria-current={isActive ? "true" : undefined}
          >
            {/* Label — always visible, bold + full color when active */}
            <span
              className={`text-[10px] font-mono tracking-[0.15em] uppercase transition-all duration-300 ${
                isActive
                  ? onDark
                    ? "text-white opacity-100 font-semibold"
                    : "text-ink opacity-100 font-semibold"
                  : onDark
                    ? "text-white/35 group-hover:text-white/70"
                    : "text-ink-35 group-hover:text-ink-60"
              }`}
            >
              {label}
            </span>

            {/* Indicator bar */}
            <motion.span
              className={`block rounded-full flex-shrink-0 transition-colors duration-300 ${
                isActive
                  ? onDark
                    ? "bg-white"
                    : "bg-ink"
                  : onDark
                    ? "bg-white/20 group-hover:bg-white/50"
                    : "bg-ink-15 group-hover:bg-ink-35"
              }`}
              animate={{
                width: isActive ? 24 : 6,
                height: 3,
              }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            />
          </button>
        );
      })}
    </nav>
  );
}
