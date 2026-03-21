"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, CheckCircle2, BarChart3, Headset } from "lucide-react";
import { SectionHeaderReveal } from "@/components/landing/motion/section-header-reveal";
import { CardReveal } from "@/components/landing/motion/card-reveal";
import { EDITORIAL_EASE } from "@/components/landing/motion/presets";
import { useLandingReducedMotion } from "@/components/landing/motion/use-landing-reduced-motion";

type PublicStats = {
  users: number;
  projects: number;
  types: number;
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${Math.floor(n / 1_000)}k+`;
  return `${n}+`;
}

export function AgencyPack() {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const reduced = useLandingReducedMotion();

  useEffect(() => {
    fetch("/api/public/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d))
      .catch(() => {});
  }, []);

  const usagePerUser = useMemo(() => {
    if (!stats?.users || !stats?.projects) return 0;
    return Math.max(0, Math.round((stats.projects / stats.users) * 10) / 10);
  }, [stats]);

  return (
    <section id="agency-pack" className="py-20 md:py-28 px-6 bg-cream border-b border-ink-15">
      <div className="max-w-7xl mx-auto">
        <SectionHeaderReveal
          eyebrow={
            <>
              <span className="w-8 h-px bg-ink-35 shrink-0" />
              <span>Oferta para agências</span>
            </>
          }
          title="Plataforma para agências criarem MVPs de clientes em dias, não semanas"
          description={
            <>
              Posicionamento pronto para venda B2B: nicho definido, onboarding comercial,
              demo funcional e pacote com suporte de 30 dias incluído.
            </>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 [perspective:1200px]">
          <CardReveal delay={0} className="rounded-2xl border border-ink-15 bg-cream-2/80 p-7">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-gold" />
              <h3 className="text-xl font-semibold text-ink">Nicho claro + onboarding pronto</h3>
            </div>
            <ul className="space-y-3 text-ink-60">
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-1 text-gold" />Pitch comercial focado em agências e freelancers de produto</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-1 text-gold" />Fluxo de onboarding com perguntas de escopo e briefing inteligente</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-1 text-gold" />Demo funcional para apresentar geração de MVP ao vivo</li>
            </ul>
          </CardReveal>

          <CardReveal delay={0.08} className="rounded-2xl border border-ink-15 bg-card p-7">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gold-lt" />
              <h3 className="text-xl font-semibold text-white">Métricas reais de uso da plataforma</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl border border-white/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Projetos</p>
                <p className="text-2xl font-semibold text-white">{fmt(stats?.projects ?? 0)}</p>
              </div>
              <div className="rounded-xl border border-white/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Usuários</p>
                <p className="text-2xl font-semibold text-white">{fmt(stats?.users ?? 0)}</p>
              </div>
              <div className="rounded-xl border border-white/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Tipos suportados</p>
                <p className="text-2xl font-semibold text-white">{stats?.types ?? 9}+</p>
              </div>
              <div className="rounded-xl border border-white/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Uso médio</p>
                <p className="text-2xl font-semibold text-white">{usagePerUser || 0} proj/usuário</p>
              </div>
            </div>
            <p className="text-xs text-white/45 font-mono">
              Dados atualizados via endpoint público da aplicação (`/api/public/stats`).
            </p>
          </CardReveal>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-8% 0px" }}
          transition={{ duration: 0.55, delay: 0.06, ease: EDITORIAL_EASE }}
          className="mt-6 rounded-2xl border border-gold/30 bg-gold/10 p-5 flex items-start gap-3"
        >
          <Headset className="w-5 h-5 text-gold mt-0.5 shrink-0" />
          <p className="text-ink-60">
            <strong className="text-ink">Inclui 30 dias de suporte pós-entrega</strong> para ajustes
            de onboarding, copy comercial e configuração operacional com o time da agência.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
