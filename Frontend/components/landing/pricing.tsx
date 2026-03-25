"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Rocket, Building2, Loader2, Timer } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useLanguage } from "@/context/language-context";
import { SectionHeaderReveal } from "@/components/landing/motion/section-header-reveal";

const PLANS = [
  {
    id: "free",
    name: "Free",
    icon: Zap,
    description: "Para experimentar",
    price_monthly: 0,
    price_yearly: 0,
    color: "white",
    features: [
      "3 projetos por mês",
      "Tipos básicos de software",
      "Preview em tempo real",
      "Exportar código",
      "Suporte via docs",
    ],
    limits: "3 gerações/mês",
    cta: "Começar Grátis",
    href: "/sign-up",
    planId: null,
  },
  {
    id: "starter",
    name: "Starter",
    icon: Rocket,
    description: "Para freelancers",
    price_monthly: 79,
    price_yearly: 59,
    color: "violet",
    features: [
      "20 projetos por mês",
      "Todos os tipos de projeto",
      "Preview em tempo real",
      "Chat IA para refinamentos",
      "Download ZIP completo",
      "Duplicar projetos",
      "Suporte por chat",
    ],
    limits: "20 gerações/mês",
    cta: "Assinar Starter",
    href: "/sign-up?plan=starter",
    planId: "starter_monthly",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    icon: Crown,
    description: "Para agências",
    price_monthly: 197,
    price_yearly: 147,
    color: "gradient",
    features: [
      "100 projetos por mês",
      "Projetos ilimitados salvos",
      "Chat IA avançado com histórico",
      "Salvar refinamentos no projeto",
      "Export ZIP otimizado",
      "Templates exclusivos",
      "Admin dashboard",
      "Suporte prioritário 24/7",
      "30 dias de suporte de implantação incluídos",
    ],
    limits: "100 gerações/mês",
    cta: "Assinar Pro",
    href: "/sign-up?plan=pro",
    planId: "pro_monthly",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Building2,
    description: "Para empresas",
    price_monthly: 0,
    price_yearly: 0,
    color: "dark",
    features: [
      "Gerações ilimitadas",
      "White-label completo",
      "Deploy na sua infraestrutura",
      "Integrações personalizadas",
      "SLA garantido 99.9%",
      "Suporte dedicado",
      "Treinamento da equipe",
      "Contrato personalizado",
    ],
    limits: "Ilimitado",
    cta: "Falar com Vendas",
    href: "/contact",
    planId: null,
  },
];

// Global fixed end date for the founder offer — same for every user
const FOUNDER_OFFER_END = new Date("2026-04-30T23:59:59Z");

function useFounderCountdown() {
  const [daysLeft, setDaysLeft] = useState<number>(() =>
    Math.max(0, Math.ceil((FOUNDER_OFFER_END.getTime() - Date.now()) / 86_400_000))
  );

  useEffect(() => {
    const calc = () => Math.max(0, Math.ceil((FOUNDER_OFFER_END.getTime() - Date.now()) / 86_400_000));
    const iv = setInterval(() => setDaysLeft(calc()), 60_000);
    return () => clearInterval(iv);
  }, []);

  return daysLeft;
}

export function Pricing() {
  const { t } = useLanguage();
  const [isYearly, setIsYearly] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { isSignedIn } = useAuth();
  const daysLeft = useFounderCountdown();

  const handlePaidPlan = async (planId: string, planKey: string) => {
    if (!isSignedIn) return; // Will be handled by Link href to /sign-up
    setLoadingPlan(planKey);
    try {
      const priceKey = isYearly ? planId.replace("_monthly", "_yearly") : planId;
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: priceKey }),
      });
      const data = await res.json();
      if (data.url) {
        try {
          const parsed = new URL(data.url);
          if (parsed.protocol === "https:" || parsed.protocol === "http:") {
            window.location.href = data.url;
          } else {
            toast.error(data.error ?? "Erro ao iniciar checkout");
          }
        } catch {
          toast.error(data.error ?? "Erro ao iniciar checkout");
        }
      } else {
        toast.error(data.error ?? "Erro ao iniciar checkout");
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="py-24 md:py-32 px-6 relative bg-cream">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <SectionHeaderReveal
            centered
            className="mb-0"
            eyebrow={
              <>
                <span className="w-8 h-px bg-ink-35 shrink-0" />
                <span>{t("pricing", "eyebrow")}</span>
              </>
            }
            title={t("pricing", "title")}
            titleClassName="section-title text-5xl md:text-6xl lg:text-7xl text-ink mb-6"
            description={t("pricing", "subtitle")}
            descriptionClassName="text-ink-60 text-xl max-w-2xl mx-auto font-serif font-medium text-center"
          />

          {/* Founder offer countdown */}
          {daysLeft !== null && daysLeft > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-600 text-xs font-mono mb-6 mt-2"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Oferta de fundadores expira em <strong>{daysLeft} dias</strong> — garante o preço anual antes que acabe</span>
            </motion.div>
          )}

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className={`text-sm ${!isYearly ? "text-ink" : "text-ink-35"}`}>
              {t("pricing", "monthly")}
            </span>
            <button
              type="button"
              onClick={() => setIsYearly(!isYearly)}
              aria-pressed={isYearly}
              aria-label={t("pricing", "billingToggle")}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isYearly ? "bg-amber-600" : "bg-ink/20"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  isYearly ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-sm flex items-center gap-1.5 ${isYearly ? "text-ink" : "text-ink-35"}`}>
              {t("pricing", "yearly")}{" "}
              <span className="inline-flex items-center gap-0.5 text-amber-600 font-semibold text-xs bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
                -25%
              </span>
            </span>
          </div>

          {/* Annual savings callout */}
          {isYearly && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-amber-600 font-mono mt-3"
            >
              ✓ No plano Pro você economiza <strong>R$600/ano</strong> em relação ao mensal
            </motion.p>
          )}
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.12 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold">
                    ✨ MAIS POPULAR
                  </div>
                </div>
              )}

              <div
                className={`group/plan relative h-full overflow-hidden rounded-2xl border p-6 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col hover:scale-[1.02] ${
                  plan.popular
                    ? "border-amber-500/40 bg-amber-950/30 shadow-lg shadow-amber-500/15"
                    : plan.color === "dark"
                    ? "border-white/[0.06] bg-card"
                    : "border-white/10 bg-card"
                }`}
              >
                {/* Brilho radial que acompanha sensação “prod-card” (vol.5) */}
                <div
                  className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-gold/25 via-amber-500/10 to-transparent opacity-0 blur-3xl transition-opacity duration-500 group-hover/plan:opacity-100"
                  aria-hidden
                />
                {/* Plan header */}
                <div className="mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                      plan.popular
                        ? "bg-amber-600"
                        : "bg-white/10"
                    }`}
                  >
                    <plan.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-black text-xl text-white">{plan.name}</div>
                  <div className="text-white/50 text-sm mt-1">{plan.description}</div>
                </div>

                {/* Price */}
                <div className="mb-6 overflow-hidden">
                  {plan.price_monthly === 0 && plan.id === "enterprise" ? (
                    <div className="text-3xl font-black text-white">Custom</div>
                  ) : plan.price_monthly === 0 ? (
                    <div className="text-4xl font-black text-white">Grátis</div>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-white/50 text-sm mb-1.5">R$</span>
                      <div className="overflow-hidden h-[2.75rem] flex items-end">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={isYearly ? `y-${plan.id}` : `m-${plan.id}`}
                            initial={{ y: isYearly ? -22 : 22, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: isYearly ? 22 : -22, opacity: 0 }}
                            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                            className="text-4xl font-black text-white leading-none block"
                          >
                            {isYearly ? plan.price_yearly : plan.price_monthly}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      <span className="text-white/50 text-sm mb-1.5">/mês</span>
                    </div>
                  )}
                  {plan.price_monthly > 0 && (
                    <AnimatePresence>
                      {isYearly && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-amber-400 text-xs mt-1 overflow-hidden"
                        >
                          Cobrado anualmente
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                  <div className="text-xs text-white/80 mt-2 font-medium">{plan.limits}</div>
                </div>

                {/* CTA */}
                {plan.planId && isSignedIn ? (
                  <Button
                    className="w-full mb-6"
                    variant={plan.popular ? "glow" : "outline"}
                    size="lg"
                    onClick={() => handlePaidPlan(plan.planId!, plan.id)}
                    disabled={loadingPlan === plan.id}
                  >
                    {loadingPlan === plan.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" />Aguarde...</>
                    ) : (
                      plan.cta
                    )}
                  </Button>
                ) : (
                  <Link href={plan.href} className="mb-6 block">
                    <Button
                      className="w-full"
                      variant={plan.popular ? "glow" : "outline"}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                )}

                {/* Features */}
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-white/90 font-medium"
                    >
                      <Check className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          className="text-center mt-12 text-ink-60 text-sm font-mono"
        >
          🔒 Pagamento 100% seguro · Cancele quando quiser · Sem fidelidade · 30 dias de suporte pós-entrega
        </motion.div>
      </div>
    </section>
  );
}
