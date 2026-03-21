"use client";

import { motion } from "framer-motion";
import { TrendingUp, Clock3, HandCoins } from "lucide-react";
import { SectionHeaderReveal } from "@/components/landing/motion/section-header-reveal";
import { CardReveal } from "@/components/landing/motion/card-reveal";
import { EDITORIAL_EASE } from "@/components/landing/motion/presets";

const METRICS = [
  {
    icon: Clock3,
    title: "Tempo de entrega",
    before: "21 dias",
    after: "5 dias",
    gain: "-76%",
  },
  {
    icon: HandCoins,
    title: "Custo de produção",
    before: "R$ 12.000",
    after: "R$ 4.500",
    gain: "-62%",
  },
  {
    icon: TrendingUp,
    title: "Margem por projeto",
    before: "32%",
    after: "61%",
    gain: "+29 pp",
  },
];

export function CaseROI() {
  return (
    <section id="case-roi" className="py-20 md:py-28 px-6 bg-cream-2 border-b border-ink-15">
      <div className="max-w-7xl mx-auto">
        <SectionHeaderReveal
          eyebrow={
            <>
              <span className="w-8 h-px bg-ink-35 shrink-0" />
              <span>Case comercial</span>
            </>
          }
          title="Antes e depois: agência vendendo MVP com maior margem"
          description={
            <>
              Simulação de operação realista para proposta comercial: redução de prazo, queda de custo
              de entrega e aumento de margem por projeto.
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 [perspective:1200px]">
          {METRICS.map((m, i) => (
            <CardReveal
              key={m.title}
              delay={i * 0.09}
              className="rounded-2xl border border-ink-15 bg-cream p-6"
            >
              <m.icon className="w-5 h-5 text-gold mb-3" />
              <h3 className="text-lg font-semibold text-ink mb-4">{m.title}</h3>
              <div className="space-y-2 text-sm text-ink-60">
                <p>
                  <span className="font-mono text-ink-35 uppercase tracking-wide">Antes:</span>{" "}
                  <strong className="text-ink">{m.before}</strong>
                </p>
                <p>
                  <span className="font-mono text-ink-35 uppercase tracking-wide">Depois:</span>{" "}
                  <strong className="text-ink">{m.after}</strong>
                </p>
              </div>
              <motion.p
                className="mt-4 inline-flex px-2.5 py-1 rounded-full bg-gold/15 text-gold text-xs font-mono"
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.45, delay: 0.2 + i * 0.05, ease: EDITORIAL_EASE }}
              >
                Resultado: {m.gain}
              </motion.p>
            </CardReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
