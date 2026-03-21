"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import { useTilt } from "@/hooks/use-tilt";
import { useLanguage } from "@/context/language-context";
import { SectionHeaderReveal } from "@/components/landing/motion/section-header-reveal";
import { EDITORIAL_EASE } from "@/components/landing/motion/presets";


const TESTIMONIALS = [
  {
    name: "Carla Mendes",
    role: "Fundadora",
    company: "StyleStore Boutique",
    avatar: "CM",
    rating: 5,
    text: "Em 10 minutos criei o site completo para minha loja de roupas. Nunca imaginei que seria tão simples. O código gerado é profissional de verdade!",
    metric: "Economizei R$18.000 em desenvolvimento",
    project: "E-commerce de moda",
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "Rafael Costa",
    role: "Dev Freelancer",
    company: "RC Digital",
    avatar: "RC",
    rating: 5,
    text: "Uso o NeuroCode para prototipar ideias para clientes. O que levaria 3 dias agora faço em 30 minutos. Minha produtividade triplicou.",
    metric: "3x mais projetos entregues por mês",
    project: "SaaS de gestão",
    color: "from-indigo-500 to-blue-600",
  },
  {
    name: "Ana Beatriz Lima",
    role: "Designer UX",
    company: "Studio ABL",
    avatar: "AL",
    rating: 5,
    text: "Como designer, ficava bloqueada sem saber programar. Agora consigo transformar meus mockups em código real instantaneamente. Revolucionário!",
    metric: "Primeiro cliente em 1 semana do lançamento",
    project: "Dashboard de analytics",
    color: "from-pink-500 to-rose-600",
  },
  {
    name: "Marcos Oliveira",
    role: "CEO",
    company: "Sabor da Serra",
    avatar: "MO",
    rating: 5,
    text: "Meu site de delivery ficou lindo e funcional. Meus clientes adoraram. E eu não precisei gastar R$15.000 com uma agência!",
    metric: "R$15.000 economizados vs. agência tradicional",
    project: "App de delivery",
    color: "from-amber-500 to-orange-600",
  },
  {
    name: "Juliana Torres",
    role: "Co-fundadora",
    company: "FlowHub SaaS",
    avatar: "JT",
    rating: 5,
    text: "Lançamos nosso MVP em 48 horas usando o NeuroCode. Conseguimos nosso primeiro cliente antes mesmo de contratar um desenvolvedor.",
    metric: "MVP em 48h → primeiro cliente em 1 semana",
    project: "Plataforma SaaS",
    color: "from-amber-500 to-orange-600",
  },
  {
    name: "Pedro Alves",
    role: "Empreendedor",
    company: "FinanceApp",
    avatar: "PA",
    rating: 5,
    text: "Criei meu primeiro aplicativo sem saber nada de código. Agora tenho um portfólio e já consegui meu primeiro freelance!",
    metric: "Portfólio em 1 dia, primeiro freela em 2 semanas",
    project: "App de finanças",
    color: "from-cyan-500 to-sky-600",
  },
];

const IMPACT_STATS = [
  { value: "~2h", label: "Do prompt ao código pronto" },
  { value: "9", label: "Tipos de projeto suportados" },
  { value: "NeuroCode\nEngine", label: "Motor de IA proprietário" },
];

function StarRating({ rating, animate }: { rating: number; animate: boolean }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: rating }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={animate ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 18, delay: i * 0.07 }}
        >
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        </motion.div>
      ))}
    </div>
  );
}

interface TestimonialData {
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  text: string;
  metric: string;
  project: string;
  color: string;
}

function TestimonialCard({ t, i, inView }: { t: TestimonialData; i: number; inView: boolean }) {
  const tilt = useTilt({ maxDeg: 5, perspective: 1200 });
  return (
    <motion.div
      key={t.name}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
      className="h-full"
    >
      <div
        // eslint-disable-next-line react-hooks/refs
        ref={tilt.ref}
        // eslint-disable-next-line react-hooks/refs
        onMouseMove={tilt.onMouseMove}
        // eslint-disable-next-line react-hooks/refs
        onMouseLeave={tilt.onMouseLeave}
        style={{ transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)" }}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink-15 bg-cream-2/80 p-6 transition-[border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-gold/30 hover:shadow-lg hover:shadow-gold/8"
      >
        {/* Vinheta inferior no hover (ui-components prod-card-reveal, adaptado) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-gold/[0.07] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden
        />
        <div className="relative z-10 flex flex-1 flex-col">
        {/* Quote icon */}
        <Quote className="w-6 h-6 text-ink-15 mb-4" />

        {/* Stars */}
        <StarRating rating={t.rating} animate={inView} />

        {/* Text */}
        <p className="text-ink-60 text-base leading-relaxed mt-3 mb-5 font-serif font-medium flex-1">
          &ldquo;{t.text}&rdquo;
        </p>

        {/* Metric highlight */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-700 text-xs mb-4 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span>{t.metric}</span>
        </div>

        {/* Project badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/15 border border-gold/25 text-gold text-xs mb-5 font-mono">
          <span>Projeto:</span>
          <span className="font-medium">{t.project}</span>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 pt-4 border-t border-ink-15">
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-xs font-black text-white flex-shrink-0`}
          >
            {t.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink">{t.name}</p>
            <p className="text-xs text-ink-60">{t.role} · {t.company}</p>
          </div>
        </div>
        </div>
      </div>
    </motion.div>
  );
}


export function Testimonials() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-100px" });

  return (
    <section id="testimonials" className="py-24 md:py-32 relative overflow-hidden bg-cream px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <SectionHeaderReveal
            centered
            className="mb-0"
            eyebrow={
              <>
                <span className="w-8 h-px bg-ink-35 shrink-0" />
                <span>{t("testimonials", "eyebrow")}</span>
              </>
            }
            titleSlot={
              <motion.h2
                className="section-title text-5xl md:text-6xl lg:text-7xl text-ink mb-4 max-w-5xl mx-auto"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-10% 0px" }}
                transition={{ duration: 0.7, ease: EDITORIAL_EASE }}
              >
                {t("testimonials", "titleBefore")}{" "}
                <span className="text-gold">{t("testimonials", "titleHighlight")}</span>
              </motion.h2>
            }
            description={t("testimonials", "subtitle")}
            descriptionClassName="text-ink-60 text-xl max-w-2xl mx-auto font-serif font-medium text-center"
            titleClassName=""
          />
        </div>

        {/* Impact stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16 p-5 rounded-2xl border border-gold/20 bg-gold/5"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {IMPACT_STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black text-gold">{s.value}</p>
              <p className="text-xs text-ink-60 mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} t={t} i={i} inView={inView} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <p className="text-ink-60 text-sm font-mono">
            {t("testimonials", "cta")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
