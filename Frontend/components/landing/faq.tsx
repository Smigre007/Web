"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { SectionHeaderReveal } from "@/components/landing/motion/section-header-reveal";
import { EDITORIAL_EASE } from "@/components/landing/motion/presets";
import { useLandingReducedMotion } from "@/components/landing/motion/use-landing-reduced-motion";

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  const reduced = useLandingReducedMotion();

  return (
    <motion.div
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-6% 0px" }}
      transition={{
        delay: reduced ? 0 : index * 0.07,
        duration: reduced ? 0 : 0.55,
        ease: EDITORIAL_EASE,
      }}
      className="border border-ink-15 rounded-2xl overflow-hidden bg-cream hover:border-gold/30 transition-colors duration-300"
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group flex min-h-[88px] w-full items-center justify-between p-5 text-left transition-transform duration-200 active:scale-[0.99]"
      >
        <span
          className={`text-base font-bold leading-snug transition-colors ${
            open ? "text-gold" : "text-ink group-hover:text-ink"
          }`}
        >
          {q}
        </span>
        <div
          className={`flex-shrink-0 ml-4 w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
            open
              ? "bg-gold/15 border border-gold/30"
              : "bg-ink-15 border border-ink-15"
          }`}
        >
          {open ? (
            <Minus className="w-3.5 h-3.5 text-gold" />
          ) : (
            <Plus className="w-3.5 h-3.5 text-ink-35" />
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <p className="px-5 pb-5 text-base text-ink-60 leading-relaxed font-serif font-medium">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-80px" });

  const FAQS = Array.from({ length: 8 }, (_, i) => ({
    q: t("faq", `q${i + 1}`),
    a: t("faq", `a${i + 1}`),
  }));

  return (
    <section id="faq" className="py-24 md:py-32 px-6 relative bg-cream-2" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <SectionHeaderReveal
            centered
            className="mb-0"
            eyebrow={
              <>
                <span className="w-8 h-px bg-ink-35 shrink-0" />
                <span>{t("faq", "eyebrow")}</span>
              </>
            }
            title={t("faq", "title")}
            titleClassName="section-title text-5xl md:text-6xl lg:text-7xl text-ink mb-4"
            description={t("faq", "subtitle")}
            descriptionClassName="text-ink-60 text-xl max-w-xl mx-auto font-serif font-medium text-center"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-6xl mx-auto items-start">
          {FAQS.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.p
          className="text-center text-ink-60 text-sm mt-12 font-mono"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.6 }}
        >
          {t("faq", "cta")}{" "}
          <a
            href="mailto:suporte@neurocode.ai"
            className="text-gold hover:text-gold-lt transition-colors"
          >
            {t("faq", "ctaLink")}
          </a>
        </motion.p>
      </div>
    </section>
  );
}
