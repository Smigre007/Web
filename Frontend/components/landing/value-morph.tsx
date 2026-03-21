"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useLanguage } from "@/context/language-context";
import { EDITORIAL_EASE } from "@/components/landing/motion/presets";
import { useLandingReducedMotion } from "@/components/landing/motion/use-landing-reduced-motion";

const MORPH_INTERVAL_MS = 2800;

export function ValueMorph() {
  const { t } = useLanguage();
  const reduced = useLandingReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.35 });
  const [idx, setIdx] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);
  const prevInViewRef = useRef(false);

  const words = useMemo(
    () => [t("landingExtras", "morph_0"), t("landingExtras", "morph_1"), t("landingExtras", "morph_2"), t("landingExtras", "morph_3")],
    [t]
  );

  useEffect(() => {
    const wasInView = prevInViewRef.current;
    prevInViewRef.current = inView;

    if (!inView) {
      // Reset state so the rising edge can remount and re-run the entrance animation.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIdx(0);
      return;
    }

    if (reduced) return;

    // Rising edge: force the animated word span to remount (same strategy as the Hero's re-entry).
    if (!wasInView && inView) {
      setIdx(0);
      setCycleKey((k) => k + 1);
    }

    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % words.length);
    }, MORPH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [inView, reduced, words.length]);

  const prefix = t("landingExtras", "morph_prefix");

  return (
    <section
      id="value-morph"
      ref={ref}
      className="py-10 md:py-12 px-6 bg-cream border-b border-ink-15"
      aria-live="polite"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-baseline sm:justify-center gap-2 sm:gap-4 text-center sm:text-left">
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-ink-35 shrink-0">
          {prefix}
        </span>
        <div className="relative min-h-[2.5rem] sm:min-h-[1.5rem] flex items-center justify-center sm:justify-start overflow-hidden">
          {reduced ? (
            <span className="text-2xl md:text-3xl font-serif font-semibold text-ink">{words[0]}</span>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`${cycleKey}-${idx}`}
                initial={{ y: 48, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ duration: 0.5, ease: EDITORIAL_EASE }}
                className="text-2xl md:text-3xl font-serif font-semibold text-gold block"
              >
                {words[idx]}
              </motion.span>
            </AnimatePresence>
          )}
        </div>
        <div className="flex justify-center gap-1.5 sm:ml-2" aria-hidden>
          {words.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                i === idx ? "bg-gold" : "bg-ink-15"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
