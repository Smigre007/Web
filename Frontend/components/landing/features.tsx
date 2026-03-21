"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Code2,
  Palette,
  Globe,
  Database,
  Zap,
  Shield,
  Layers,
  Search,
  Image as ImageIcon,
  FileText,
  Cpu,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { SectionHeaderReveal } from "@/components/landing/motion/section-header-reveal";

const FEATURE_ICONS = [Brain, Code2, Palette, Globe, Database, Layers, Zap, Search, Shield, ImageIcon, FileText, Cpu];
const FEATURE_COLORS = ["violet", "indigo", "pink", "blue", "green", "orange", "yellow", "teal", "red", "purple", "cyan", "emerald"];

const iconColorMap: Record<string, string> = {
  violet: "text-violet-400",
  indigo: "text-indigo-400",
  pink: "text-pink-400",
  blue: "text-blue-400",
  green: "text-amber-400",
  orange: "text-orange-400",
  yellow: "text-amber-400",
  teal: "text-amber-400",
  red: "text-red-400",
  purple: "text-purple-400",
  cyan: "text-cyan-400",
  emerald: "text-amber-400",
};

/** Easing do preenchimento no hover (showcase-gsap .s2-card-fill) */
const fillEase = [0.76, 0, 0.24, 1] as [number, number, number, number];
const easeEditorial = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function Features() {
  const { t } = useLanguage();

  const FEATURES = Array.from({ length: 12 }, (_, i) => ({
    icon: FEATURE_ICONS[i],
    title: t("features", `f${i + 1}_title`),
    description: t("features", `f${i + 1}_desc`),
    color: FEATURE_COLORS[i],
  }));

  return (
    <section id="features" className="relative bg-cream-2 px-6 py-24 md:py-32">
      <div className="absolute inset-0 grid-pattern-editorial opacity-40" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-16 border-b border-ink-15 pb-8">
          <SectionHeaderReveal
            centered
            className="mb-0"
            eyebrow={
              <>
                <span className="h-px w-8 shrink-0 bg-ink-35" aria-hidden />
                <span>{t("features", "eyebrow")}</span>
              </>
            }
            title={t("features", "title")}
            titleClassName="section-title mb-4 text-5xl text-ink md:text-6xl lg:text-7xl"
            description={t("features", "subtitle")}
            descriptionClassName="mx-auto max-w-xl font-serif text-lg font-medium leading-relaxed text-ink-60 md:text-xl text-center"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={`feature-card-${i}`}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.55, delay: i * 0.04, ease: easeEditorial }}
            >
              <div className="group relative h-[320px] cursor-pointer overflow-hidden rounded-2xl border border-ink-15 bg-cream-2 transition-[border-color,box-shadow] duration-500 hover:border-gold/35 hover:shadow-[0_24px_50px_-28px_rgba(15,12,8,0.14)]">
                {/* Preenchimento roxo que sobe — mesmo efeito do showcase, sobre fundo claro */}
                <div
                  className="absolute inset-0 z-0 translate-y-[101%] rounded-2xl bg-gradient-to-br from-[#2a1a5e] to-[#4a2090] transition-transform duration-[650ms] group-hover:translate-y-0"
                  style={{
                    transitionTimingFunction: `cubic-bezier(${fillEase.join(",")})`,
                  }}
                  aria-hidden
                />
                {/* Brilho diagonal leve (shimmer do .s2-featured) */}
                <div
                  className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-2xl"
                  aria-hidden
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-br from-transparent via-white/25 to-transparent opacity-0 transition-[transform,opacity] duration-[850ms] ease-out group-hover:translate-x-full group-hover:opacity-100" />
                </div>

                <div className="relative z-10 flex h-full flex-col p-6 md:p-7">
                  <span className="mb-6 flex items-center justify-between font-mono text-[10px] tracking-[0.3em] text-ink-35 transition-colors duration-300 group-hover:text-cream/70">
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-15 transition-all duration-300 group-hover:bg-gold group-hover:shadow-[0_0_10px_rgba(201,165,92,0.5)]" />
                  </span>

                  <feature.icon
                    className={`relative z-10 mb-4 h-8 w-8 opacity-60 grayscale transition-all duration-300 group-hover:text-gold-lt group-hover:opacity-100 group-hover:grayscale-0 ${iconColorMap[feature.color]}`}
                    strokeWidth={1.35}
                  />

                  <h3 className="relative z-10 mb-2 flex min-h-[2.75rem] items-start font-sans text-base font-extrabold tracking-tight text-ink transition-colors duration-300 group-hover:text-cream">
                    {feature.title}
                  </h3>
                  <p className="relative z-10 flex-1 font-serif text-sm font-medium leading-relaxed text-ink-60 transition-colors duration-300 group-hover:text-cream/92">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
