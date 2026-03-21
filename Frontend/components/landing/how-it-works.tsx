"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MessageSquare, Wand2, Eye, Download } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { SectionHeaderReveal } from "@/components/landing/motion/section-header-reveal";
import { useLandingReducedMotion } from "@/components/landing/motion/use-landing-reduced-motion";

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  violet: { bg: "bg-[#9e1818]",   text: "text-[#c99640]", border: "border-[#c99640]/20" },
  indigo: { bg: "bg-[#141210]",   text: "text-[#c99640]", border: "border-[#c99640]/20" },
  blue:   { bg: "bg-[#9e1818]",   text: "text-[#c99640]", border: "border-[#c99640]/20" },
  green:  { bg: "bg-[#141210]",   text: "text-[#c99640]", border: "border-[#c99640]/20" },
};

const easeEditorial: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function HowItWorks() {
  const { t } = useLanguage();
  const reduced = useLandingReducedMotion();
  const stepsRef = useRef<HTMLDivElement>(null);
  const lineInView = useInView(stepsRef, { once: false, margin: "-15%" });

  const STEPS = [
    {
      step: t("howItWorks", "s1_step"),
      icon: MessageSquare,
      title: t("howItWorks", "s1_title"),
      description: t("howItWorks", "s1_desc"),
      color: "violet",
      example: t("howItWorks", "s1_example"),
    },
    {
      step: t("howItWorks", "s2_step"),
      icon: Wand2,
      title: t("howItWorks", "s2_title"),
      description: t("howItWorks", "s2_desc"),
      color: "indigo",
      example: t("howItWorks", "s2_example"),
    },
    {
      step: t("howItWorks", "s3_step"),
      icon: Eye,
      title: t("howItWorks", "s3_title"),
      description: t("howItWorks", "s3_desc"),
      color: "blue",
      example: t("howItWorks", "s3_example"),
    },
    {
      step: t("howItWorks", "s4_step"),
      icon: Download,
      title: t("howItWorks", "s4_title"),
      description: t("howItWorks", "s4_desc"),
      color: "green",
      example: t("howItWorks", "s4_example"),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 px-6 relative bg-cream">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <SectionHeaderReveal
            centered
            className="mb-0"
            eyebrow={
              <>
                <span className="w-8 h-px bg-ink-35 shrink-0" />
                <span>{t("howItWorks", "eyebrow")}</span>
              </>
            }
            title={t("howItWorks", "title")}
            titleClassName="section-title text-5xl md:text-6xl lg:text-7xl text-ink mb-4"
          />
        </div>

        {/* Steps — with animated connecting line */}
        <div ref={stepsRef} className="relative space-y-8">
          {/* SVG connecting line — desktop only */}
          <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-px -translate-x-1/2 pointer-events-none overflow-hidden">
            <svg
              className="w-full h-full"
              viewBox="0 0 1 100"
              preserveAspectRatio="none"
              style={{ overflow: "visible" }}
            >
              <motion.line
                x1="0.5" y1="0" x2="0.5" y2="100"
                stroke="rgba(20,18,16,0.12)"
                strokeWidth="40"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: reduced ? 1 : 0 }}
                animate={lineInView ? { pathLength: 1 } : { pathLength: reduced ? 1 : 0 }}
                transition={{
                  duration: reduced ? 0 : 1.8,
                  ease: "easeInOut",
                  delay: reduced ? 0 : 0.3,
                }}
              />
            </svg>
          </div>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={
                reduced
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: i % 2 === 0 ? -48 : 48 }
              }
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-60px 0px" }}
              transition={{
                duration: reduced ? 0 : 0.62,
                delay: reduced ? 0 : i * 0.09,
                ease: easeEditorial,
              }}
              className={`flex gap-8 items-center ${
                i % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}
            >
              {/* Card — lift + sombra editorial (ui-components cards) */}
              <div className="group/card flex-1 rounded-2xl border border-ink-15 bg-cream-2/80 p-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-gold/35 hover:shadow-[0_24px_48px_-28px_rgba(20,18,16,0.14)]">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${colorMap[step.color].bg} flex items-center justify-center flex-shrink-0`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className={`text-[10px] font-mono tracking-[0.25em] mb-1 ${colorMap[step.color].text}`}>
                      {t("howItWorks", "stepLabel")} {step.step}
                    </div>
                    <h3 className="text-2xl font-extrabold text-ink mb-3 font-sans tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-ink-60 leading-relaxed mb-4 font-serif text-lg font-medium">
                      {step.description}
                    </p>
                    <div className={`p-3.5 rounded-xl border ${colorMap[step.color].border} bg-[#141210]/[0.04]`}>
                      <p className="text-sm text-[#c99640] font-mono italic leading-relaxed opacity-80">
                        {step.example}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step number (hidden on mobile) */}
              <div className="hidden md:flex w-24 h-24 rounded-full items-center justify-center text-5xl font-black text-ink-15 border border-ink-15 flex-shrink-0 font-sans">
                {step.step}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
