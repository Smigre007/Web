"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CreditCard,
  Crown,
  Zap,
  Rocket,
  Check,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  X,
  RefreshCw,
  FileText,
  Download,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Usage {
  plan: string;
  generations_used: number;
  generations_limit: number;
  percent: number;
  cancel_at_period_end?: boolean;
  renewal_date?: string;
  status?: string;
}

interface Invoice {
  id: string;
  number: string | null;
  amount: number;
  currency: string;
  status: string | null;
  date: number;
  pdf: string | null;
  description: string | null;
}

// ── Plan definitions ──────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "free",
    name: "Free",
    icon: Zap,
    price: { monthly: "R$0", yearly: "R$0" },
    sub: { monthly: "para sempre", yearly: "para sempre" },
    features: [
      "3 gerações/mês",
      "Código básico",
      "Preview HTML",
      "Export ZIP",
    ],
    popular: false,
  },
  {
    id: "starter",
    name: "Starter",
    icon: Rocket,
    price: { monthly: "R$79", yearly: "R$59" },
    sub: { monthly: "/mês", yearly: "/mês (anual)" },
    features: [
      "20 gerações/mês",
      "Código avançado",
      "Chat de refinamento",
      "Histórico de versões",
      "Suporte por email",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    icon: Crown,
    price: { monthly: "R$197", yearly: "R$147" },
    sub: { monthly: "/mês", yearly: "/mês (anual)" },
    features: [
      "100 gerações/mês",
      "Tudo do Starter",
      "GitHub push",
      "Múltiplos idiomas",
      "Suporte prioritário",
      "Projetos ilimitados salvos",
    ],
    popular: true,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { language } = useLanguage();
  const lang = (language as "pt" | "en" | "es" | "fr") ?? "pt";
  const t = {
    pt: {
      title: "Assinatura",
      subtitle: "Gerencie seu plano e pagamentos",
      loading: "Carregando...",
      checkoutError: "Erro ao iniciar checkout",
      connectionError: "Erro de conexão. Tente novamente.",
      refresh: "Atualizar",
    },
    en: {
      title: "Subscription",
      subtitle: "Manage your plan and payments",
      loading: "Loading...",
      checkoutError: "Failed to start checkout",
      connectionError: "Connection error. Try again.",
      refresh: "Refresh",
    },
    es: {
      title: "Suscripción",
      subtitle: "Gestiona tu plan y pagos",
      loading: "Cargando...",
      checkoutError: "Error al iniciar checkout",
      connectionError: "Error de conexión. Inténtalo de nuevo.",
      refresh: "Actualizar",
    },
    fr: {
      title: "Abonnement",
      subtitle: "Gérez votre plan et vos paiements",
      loading: "Chargement...",
      checkoutError: "Erreur au démarrage du checkout",
      connectionError: "Erreur de connexion. Réessayez.",
      refresh: "Actualiser",
    },
  }[lang];

  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const searchParams = useSearchParams();

  const currentPlan = usage?.plan ?? "free";
  const isPaidPlan = currentPlan !== "free";

  useEffect(() => {
    fetch("/api/user/usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setUsage(d))
      .catch(() => {});

    fetch("/api/invoices")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.invoices && setInvoices(d.invoices))
      .catch(() => {})
      .finally(() => setLoadingInvoices(false));
  }, []);

  useEffect(() => {
    if (searchParams.get("success") === "1") {
      toast.success("Assinatura ativada!", {
        description: "Seu plano foi atualizado com sucesso.",
      });
    } else if (searchParams.get("cancelled") === "1") {
      toast.error("Pagamento cancelado", {
        description: "Você pode tentar novamente quando quiser.",
      });
    }
  }, [searchParams]);

  const handleUpgrade = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const endpoint = isPaidPlan ? "/api/upgrade-subscription" : "/api/checkout";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: `${planId}_${billing}` }),
      });
      const data = await res.json();

      if (data.upgraded) {
        toast.success("Plano atualizado!", {
          description: "Sua assinatura foi alterada imediatamente.",
        });
        fetch("/api/user/usage")
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => d && setUsage(d))
          .catch(() => {});
        setLoadingPlan(null);
      } else if (data.url) {
        try {
          const parsed = new URL(data.url);
          if (parsed.protocol === "https:" || parsed.protocol === "http:") {
            window.location.href = data.url;
          } else {
            toast.error("URL de checkout inválida");
            setLoadingPlan(null);
          }
        } catch {
          toast.error("URL de checkout inválida");
          setLoadingPlan(null);
        }
      } else {
        toast.error(data.error ?? t.checkoutError);
        setLoadingPlan(null);
      }
    } catch {
      toast.error(t.connectionError);
      setLoadingPlan(null);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch("/api/cancel-subscription", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Assinatura cancelada", {
          description: "Você mantém o acesso até o fim do período pago.",
          duration: 6000,
        });
        setShowCancelConfirm(false);
        setUsage((u) => (u ? { ...u, cancel_at_period_end: true } : u));
      } else {
        toast.error(data.error ?? "Erro ao cancelar assinatura");
      }
    } catch {
      toast.error(t.connectionError);
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivate = async () => {
    setReactivating(true);
    try {
      const res = await fetch("/api/reactivate-subscription", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Assinatura reativada!", {
          description: "Seu plano continua ativo normalmente.",
        });
        setUsage((u) => (u ? { ...u, cancel_at_period_end: false } : u));
      } else {
        toast.error(data.error ?? "Erro ao reativar assinatura");
      }
    } catch {
      toast.error(t.connectionError);
    } finally {
      setReactivating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-gold" />
          {t.title}
        </h1>
        <p className="text-ink-35 mt-1 text-sm">{t.subtitle}</p>
      </div>

      {/* Current plan banner */}
      <div className="bg-gradient-to-r from-ink to-ink/70 rounded-2xl p-6 text-cream mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wider text-cream/50 font-medium mb-1">
              Plano Atual
            </p>
            <p className="text-2xl font-black capitalize">{currentPlan}</p>
            {usage?.renewal_date && (
              <p className="text-xs text-cream/50 mt-1">
                Renova em{" "}
                {new Date(usage.renewal_date).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {usage?.cancel_at_period_end ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2.5 py-1 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                Cancelamento agendado
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-300 bg-emerald-400/20 border border-emerald-400/30 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Ativo
              </span>
            )}
          </div>
        </div>

        {/* Usage bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-cream/60 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Gerações este mês
            </span>
            <span className="text-xs font-mono text-cream/70">
              {usage
                ? `${usage.generations_used} / ${usage.generations_limit}`
                : t.loading}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-cream/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-gold-lt transition-all"
              style={{ width: `${usage?.percent ?? 0}%` }}
            />
          </div>
          {usage && usage.percent >= 80 && (
            <p className="text-xs text-amber-300 mt-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {usage.percent === 100
                ? "Limite atingido — faça upgrade para continuar"
                : "Quase no limite mensal"}
            </p>
          )}
        </div>
      </div>

      {/* Cancellation pending warning */}
      {usage?.cancel_at_period_end && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-amber-200 bg-amber-50/60 mb-6"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-ink">Cancelamento agendado</p>
              <p className="text-xs text-ink-35 mt-0.5">
                Você mantém acesso até o fim do período. Pode reativar a qualquer momento.
              </p>
            </div>
          </div>
          <button
            onClick={handleReactivate}
            disabled={reactivating}
            className="border border-ink-15 text-ink-35 rounded-xl px-4 py-2 text-sm hover:bg-cream-2 hover:text-ink transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reactivating ? "animate-spin" : ""}`} />
            Reativar
          </button>
        </motion.div>
      )}

      {/* Monthly / Yearly toggle */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-ink">
          {isPaidPlan ? "Trocar de plano" : "Fazer Upgrade"}
        </h2>
        <div className="flex items-center gap-1 p-1 rounded-xl border border-ink-15 bg-cream-2">
          {(["monthly", "yearly"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setBilling(period)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                billing === period
                  ? "bg-ink text-cream shadow-sm"
                  : "text-ink-35 hover:text-ink"
              }`}
            >
              {period === "monthly" ? (
                "Mensal"
              ) : (
                <span className="flex items-center gap-1.5">
                  Anual
                  <span className="text-[10px] bg-gold/15 text-gold px-1.5 py-0.5 rounded-md font-bold">
                    -25%
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {PLANS.map((plan, i) => {
          const isCurrent = currentPlan === plan.id;
          const isDowngrade = plan.id === "free" && isPaidPlan;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gold text-ink text-xs font-bold px-2 py-0.5 rounded-full">
                    POPULAR
                  </span>
                </div>
              )}

              <div
                className={`p-5 rounded-2xl border h-full flex flex-col transition-all ${
                  isCurrent
                    ? "border-2 border-gold shadow-sm bg-gold/[0.04]"
                    : plan.popular
                    ? "border border-gold/30 hover:border-gold/50"
                    : "border border-ink-15 hover:border-gold/40"
                } bg-cream`}
              >
                {/* Plan name + current badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <plan.icon className="w-5 h-5 text-gold" />
                    <span className="font-bold text-ink">{plan.name}</span>
                  </div>
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 border border-gold/25 px-2 py-0.5 rounded-full">
                      <Check className="w-2.5 h-2.5" />
                      Ativo
                    </span>
                  )}
                </div>

                {/* Price */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={billing}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="mb-4"
                  >
                    <span className="text-2xl font-black text-ink">
                      {plan.price[billing]}
                    </span>
                    <span className="text-sm text-ink-35 ml-1">
                      {plan.sub[billing]}
                    </span>
                  </motion.div>
                </AnimatePresence>

                {/* Features */}
                <ul className="space-y-2 mb-5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-ink-35">
                      <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Action button */}
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full border border-ink-15 text-ink-35 rounded-xl px-4 py-2 text-sm cursor-not-allowed opacity-60"
                  >
                    Plano Atual
                  </button>
                ) : isDowngrade ? (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={!!loadingPlan || cancelling}
                    className="w-full border border-red-200 text-red-500 rounded-xl px-4 py-2 text-sm hover:bg-red-50 hover:border-red-300 transition-all"
                  >
                    Cancelar assinatura
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={!!loadingPlan}
                    className={`w-full rounded-xl px-4 py-2 text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                      plan.popular
                        ? "bg-ink text-cream hover:bg-ink/80"
                        : "border border-ink-15 text-ink hover:bg-cream-2"
                    } disabled:opacity-60`}
                  >
                    {loadingPlan === plan.id ? (
                      "Redirecionando..."
                    ) : (
                      <>
                        {isPaidPlan ? `Trocar para ${plan.name}` : "Fazer Upgrade"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs text-ink-35 text-center mb-10 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5" />
        Pagamentos seguros via Stripe · Cancele a qualquer momento
      </p>

      {/* Invoice history */}
      <div>
        <h2 className="text-xl font-bold text-ink flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gold" />
          Histórico de Faturas
        </h2>

        {loadingInvoices ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-ink/[0.03] animate-pulse border border-ink-15"
              />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-10 rounded-2xl border border-ink-15 bg-cream-2 text-center">
            <FileText className="w-8 h-8 text-ink-35 mx-auto mb-3" />
            <p className="text-sm font-medium text-ink-35">Nenhuma fatura encontrada</p>
            <p className="text-xs text-ink-35 mt-1">
              Suas faturas aparecerão aqui após o primeiro pagamento
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-ink-15 bg-cream overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-ink-15">
              {["Data", "Valor", "Status", "PDF"].map((col) => (
                <span
                  key={col}
                  className="text-xs uppercase tracking-wider text-ink-35 font-medium"
                >
                  {col}
                </span>
              ))}
            </div>
            {invoices.map((inv, i) => (
              <div
                key={inv.id}
                className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-4 ${
                  i > 0 ? "border-t border-ink/[0.05]" : ""
                } hover:bg-ink/[0.02] transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {inv.number ?? inv.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-ink-35">
                      {new Date(inv.date * 1000).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <span className="text-sm font-semibold text-ink whitespace-nowrap">
                  {inv.currency === "BRL" ? "R$" : inv.currency}{" "}
                  {inv.amount.toFixed(2).replace(".", ",")}
                </span>

                <span
                  className={`text-xs font-medium ${
                    inv.status === "paid"
                      ? "text-gold"
                      : inv.status === "open"
                      ? "text-amber-500"
                      : "text-ink-35"
                  }`}
                >
                  {inv.status === "paid"
                    ? "Pago"
                    : inv.status === "open"
                    ? "Em aberto"
                    : (inv.status ?? "—")}
                </span>

                {inv.pdf ? (
                  <a
                    href={inv.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-ink-35 hover:text-ink hover:bg-ink/[0.05] transition-all"
                    title="Baixar PDF"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="w-8" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <>
            <motion.div
              className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelConfirm(false)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative w-full max-w-md rounded-3xl border border-ink-15 p-8 bg-cream shadow-2xl"
                initial={{ scale: 0.92, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 16 }}
                transition={{ type: "spring", damping: 26, stiffness: 320 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-ink-35 hover:text-ink hover:bg-ink/[0.05] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-7 h-7 text-red-400" />
                </div>

                <h2 className="text-xl font-black text-ink text-center mb-3">
                  Cancelar assinatura?
                </h2>
                <p className="text-ink-35 text-sm text-center leading-relaxed mb-6">
                  Sua assinatura será cancelada ao fim do período atual. Você continuará
                  tendo acesso até lá. Depois, sua conta voltará ao plano{" "}
                  <strong className="text-ink">Free</strong> com 3 gerações/mês.
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={cancelling}
                  >
                    Manter plano
                  </Button>
                  <button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60 transition-all"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    {cancelling ? "Cancelando..." : "Confirmar cancelamento"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
