"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EDITORIAL_EASE } from "@/components/landing/motion/presets";
import { useLandingReducedMotion } from "@/components/landing/motion/use-landing-reduced-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PANELS = [
  {
    num: "01",
    eyebrow: "Tipo de projeto",
    title: "Landing Page",
    body: "Sites de conversão para produtos e serviços. Hero, benefícios, depoimentos e CTA — tudo gerado em segundos.",
    features: ["Conversão", "SEO", "Responsivo"],
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=900&h=620&q=85",
    imageAlt: "Design de landing page moderna em laptop",
  },
  {
    num: "02",
    eyebrow: "Tipo de projeto",
    title: "E-commerce",
    body: "Lojas virtuais com carrinho, checkout e integração com gateways. Catálogo, filtros e gestão de pedidos.",
    features: ["Carrinho", "Pagamento", "Catálogo"],
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=900&h=620&q=85",
    imageAlt: "Loja virtual e-commerce moderna",
  },
  {
    num: "03",
    eyebrow: "Tipo de projeto",
    title: "Dashboard",
    body: "Painéis analíticos e relatórios em tempo real. Gráficos, tabelas e métricas sob medida para sua operação.",
    features: ["Gráficos", "Relatórios", "Tempo real"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&h=620&q=85",
    imageAlt: "Dashboard de analytics com gráficos",
  },
  {
    num: "04",
    eyebrow: "Tipo de projeto",
    title: "SaaS",
    body: "Plataformas com assinatura, gestão de usuários e áreas restritas. Tudo que uma aplicação B2B precisa.",
    features: ["Auth", "Planos", "Admin"],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&h=620&q=85",
    imageAlt: "Plataforma SaaS com código e interface",
  },
];

export function HorizontalScroll() {
  const reduced = useLandingReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const exploreInView = useInView(wrapperRef, { once: false, amount: 0.12 });
  const sectionRef = useRef<HTMLElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const section = sectionRef.current;
    const panels = panelsRef.current;
    const progressBar = progressRef.current;
    if (!wrapper || !section || !panels || !progressBar) return;

    const panelCount = PANELS.length;
    const totalWidth = window.innerWidth * (panelCount - 1);

    // gsap.context() handles React StrictMode double-invoke safely —
    // ctx.revert() cleanly removes all ScrollTriggers and resets scroll state.
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapper,
        start: "top top",
        end: `+=${totalWidth}`,
        pin: section,
        scrub: 1,
        onUpdate: (self) => {
          panels.style.transform = `translate3d(${-self.progress * totalWidth}px, 0, 0)`;
          progressBar.style.width = `${self.progress * 100}%`;
        },
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div id="explore" ref={wrapperRef} className="relative">
      <section
        ref={sectionRef}
        className="relative flex items-stretch overflow-hidden"
        style={{ height: "100vh", background: "#141210" }}
      >
        {/* Progress bar at bottom */}
        <div
          ref={progressRef}
          className="absolute bottom-0 left-0 h-0.5 bg-gold z-10 transition-[width] duration-100 ease-linear"
          style={{ width: "0%" }}
          aria-hidden
        />

        {/* Panels row — translated by ScrollTrigger */}
        <div
          ref={panelsRef}
          className="flex h-full will-change-transform"
          style={{ width: "max-content" }}
        >
          {PANELS.map((panel, panelIndex) => (
            <div
              key={panel.num}
              className="flex-shrink-0 w-screen h-full flex items-center px-8 md:px-16 lg:px-24 border-r border-white/10 relative overflow-hidden"
            >
              <motion.div
                className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl mx-auto items-center"
                initial={false}
                animate={
                  reduced || exploreInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 36 }
                }
                transition={{
                  duration: reduced ? 0 : 0.8,
                  delay:
                    reduced || !exploreInView ? 0 : panelIndex * 0.14,
                  ease: EDITORIAL_EASE,
                }}
              >
                {/* Content */}
                <div className="flex flex-col gap-6 md:gap-8">
                  <span className="text-[10px] font-mono tracking-[0.35em] text-gold uppercase">
                    {panel.eyebrow}
                  </span>
                  <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[0.95]">
                    {panel.title}
                  </h2>
                  <p className="font-serif text-lg md:text-xl text-white/90 font-medium leading-relaxed max-w-md">
                    {panel.body}
                  </p>
                  <div className="flex flex-col gap-2">
                    {panel.features.map((f) => (
                      <div
                        key={f}
                        className="flex items-center gap-3 text-xs font-mono tracking-[0.2em] text-white/85 uppercase font-semibold"
                      >
                        <span className="w-5 h-px bg-gold/50 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image */}
                <div className="hidden lg:flex items-center justify-center">
                  <div className="relative w-[520px] h-[360px] rounded-2xl overflow-hidden border border-white/10 group">
                    {/* Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={panel.image}
                      alt={panel.imageAlt}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Dark overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/80 via-[#141210]/20 to-transparent pointer-events-none" />
                    {/* Gold border glow on hover */}
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gold/0 group-hover:ring-gold/30 transition-all duration-500 pointer-events-none" />
                    {/* Number badge */}
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#141210]/70 border border-gold/40 backdrop-blur-sm flex items-center justify-center font-mono text-xs font-bold text-gold">
                      {panel.num}
                    </div>
                    {/* Bottom label */}
                    <div className="absolute bottom-4 left-5 font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase">
                      {panel.title}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Scroll hint — only on first panel, fixed position */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 text-[9px] font-mono tracking-[0.4em] text-white/25 uppercase"
          aria-hidden
        >
          <span>Role para navegar</span>
          <span className="flex gap-0.5">
            <span className="animate-pulse">›</span>
            <span className="animate-pulse [animation-delay:0.15s]">›</span>
            <span className="animate-pulse [animation-delay:0.3s]">›</span>
          </span>
        </div>
      </section>
    </div>
  );
}
