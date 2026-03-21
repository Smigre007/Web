"use client";

import { SectionHeaderReveal } from "@/components/landing/motion/section-header-reveal";
import { CardReveal } from "@/components/landing/motion/card-reveal";

const OBJECTIONS = [
  {
    q: "“E se meu cliente pedir mudanças?”",
    a: "O fluxo já contempla refinamento por prompt e 30 dias de suporte de implantação para ajustes finos.",
  },
  {
    q: "“Quem é dono do código entregue?”",
    a: "A entrega é em código aberto para o cliente final, com documentação e handoff técnico prontos.",
  },
  {
    q: "“Consigo mostrar valor antes de fechar?”",
    a: "Sim. A demo funcional permite apresentar uma V1 navegável durante a própria reunião comercial.",
  },
  {
    q: "“Isso funciona para agência pequena?”",
    a: "Sim. O pacote foi desenhado para times enxutos que precisam entregar rápido sem ampliar equipe.",
  },
];

export function SalesObjections() {
  return (
    <section id="objections" className="py-20 md:py-28 px-6 bg-cream">
      <div className="max-w-6xl mx-auto">
        <SectionHeaderReveal
          eyebrow={
            <>
              <span className="w-8 h-px bg-ink-35 shrink-0" />
              <span>Objeções comerciais</span>
            </>
          }
          title="Respostas prontas para fechar negócio"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 [perspective:1200px]">
          {OBJECTIONS.map((item, i) => (
            <CardReveal
              key={item.q}
              delay={i * 0.07}
              className="rounded-xl border border-ink-15 bg-cream-2/80 p-5"
            >
              <h3 className="text-ink font-semibold mb-2">{item.q}</h3>
              <p className="text-ink-60">{item.a}</p>
            </CardReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
