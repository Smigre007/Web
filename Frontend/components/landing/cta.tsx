"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMagnetic } from "@/hooks/use-magnetic";
import { useLanguage } from "@/context/language-context";
import { SIGN_UP_FOR_IA_HREF } from "@/lib/ia-routes";
import { useLandingReducedMotion } from "@/components/landing/motion/use-landing-reduced-motion";

const easeEditorial: [number, number, number, number] = [0.22, 1, 0.36, 1];

function buildContainerVariants(reduced: boolean) {
  if (reduced) {
    return {
      hidden: { opacity: 1, y: 0 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0, staggerChildren: 0 },
      },
    };
  }
  return {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: easeEditorial,
        staggerChildren: 0.1,
      },
    },
  };
}

function buildItemVariants(reduced: boolean) {
  if (reduced) {
    return {
      hidden: { opacity: 1, y: 0 },
      show: { opacity: 1, y: 0, transition: { duration: 0 } },
    };
  }
  return {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { ease: easeEditorial } },
  };
}

function buildItemVariantsNoY(reduced: boolean) {
  if (reduced) {
    return { hidden: { opacity: 1 }, show: { opacity: 1, transition: { duration: 0 } } };
  }
  return { hidden: { opacity: 0 }, show: { opacity: 1 } };
}

export function CTA() {
  const magnetic = useMagnetic({ strength: 9 });
  const { t } = useLanguage();
  const reduced = useLandingReducedMotion();
  const containerVariants = buildContainerVariants(reduced);
  const itemVariants = buildItemVariants(reduced);
  const itemVariantsNoY = buildItemVariantsNoY(reduced);

  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden bg-cream">
      {/* Decorative orbs — back.out feel on view */}
      {!reduced && (
        <>
          <motion.div
            className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-gold/15 blur-3xl"
            initial={{ scale: 0.35, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
            aria-hidden
          />
          <motion.div
            className="pointer-events-none absolute -right-20 bottom-1/4 h-64 w-64 rounded-full bg-amber-600/10 blur-3xl"
            initial={{ scale: 0.4, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 1.05, delay: 0.12, ease: [0.34, 1.56, 0.64, 1] }}
            aria-hidden
          />
        </>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, margin: "-60px 0px" }}
          className="max-w-4xl mx-auto text-center p-12 md:p-16 rounded-2xl border border-ink-15 bg-cream-2/80 transition-[box-shadow,border-color] duration-500 hover:border-gold/25 hover:shadow-[0_28px_60px_-32px_rgba(20,18,16,0.12)]"
        >
          <motion.p
            variants={itemVariants}
            className="section-eyebrow flex items-center justify-center gap-3 mb-6"
          >
            <span className="w-8 h-px bg-ink-35 shrink-0" />
            <span>{t("cta", "eyebrow")}</span>
          </motion.p>

          <motion.h2
            variants={itemVariants}
            className="section-title text-5xl md:text-6xl lg:text-7xl text-ink mb-6"
          >
            {t("cta", "title")}
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-ink-60 mb-10 font-serif font-medium max-w-xl mx-auto"
          >
            {t("cta", "subtitle")}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              ref={magnetic.ref as React.RefObject<HTMLAnchorElement>}
              // eslint-disable-next-line react-hooks/refs
              onMouseMove={magnetic.onMouseMove as React.MouseEventHandler<HTMLAnchorElement>}
              // eslint-disable-next-line react-hooks/refs
              onMouseLeave={magnetic.onMouseLeave}
              data-cursor-hover
              href={SIGN_UP_FOR_IA_HREF}
              className="hero-cta-editorial inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-gold to-amber-600 text-ink px-8 py-4 font-mono text-[10px] uppercase tracking-[0.3em] transition-all duration-300 hover:brightness-105 shadow-lg shadow-amber-900/15 border border-ink/10 group"
            >
              <Sparkles className="w-4 h-4" />
              {t("cta", "btn")}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.p
            variants={itemVariantsNoY}
            className="text-sm text-ink-60 mt-6 font-mono"
          >
            {t("cta", "note")}
          </motion.p>
          <motion.p variants={itemVariantsNoY} className="text-xs text-ink-35 mt-3 font-mono">
            Inclui onboarding comercial + documentação operacional curta + 30 dias de suporte.
          </motion.p>
          <motion.a
            variants={itemVariantsNoY}
            href="/docs/operacao"
            className="link-editorial-underline inline-block text-xs text-ink-60 hover:text-ink mt-2 underline-offset-4 no-underline"
          >
            Ver documentação operacional
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
