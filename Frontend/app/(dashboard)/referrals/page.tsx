"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  DollarSign,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Link as LinkIcon,
  Wallet,
  ChevronRight,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Referral {
  date: string;
  user: string;
  plan: string;
  status: "converted" | "pending" | "cancelled";
  commission: string;
}

interface ReferralStats {
  totalReferred: number;
  converted: number;
  totalCommission: string;
  balance: string;
}

// ─── Fallback data ────────────────────────────────────────────────────────────

const FALLBACK_STATS: ReferralStats = {
  totalReferred: 8,
  converted: 3,
  totalCommission: "R$ 71,00",
  balance: "R$ 71,00",
};

const MOCK_REFERRALS: Referral[] = [
  {
    date: "10 Mai 2025",
    user: "joão@email.com",
    plan: "Starter",
    status: "converted",
    commission: "R$ 15,80",
  },
  {
    date: "08 Mai 2025",
    user: "maria@email.com",
    plan: "Pro",
    status: "converted",
    commission: "R$ 39,40",
  },
  {
    date: "05 Mai 2025",
    user: "carlos@email.com",
    plan: "Starter",
    status: "pending",
    commission: "R$ 15,80",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Referral["status"] }) {
  const map: Record<Referral["status"], { label: string; classes: string }> = {
    converted: {
      label: "Convertido",
      classes: "bg-green-50 border-green-200 text-green-700",
    },
    pending: {
      label: "Pendente",
      classes: "bg-yellow-50 border-yellow-200 text-yellow-700",
    },
    cancelled: {
      label: "Cancelado",
      classes: "bg-gray-100 border-gray-200 text-gray-500",
    },
  };
  const { label, classes } = map[status];
  return (
    <span
      className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${classes}`}
    >
      {label}
    </span>
  );
}

function HowItWorksStep({
  number,
  icon,
  title,
  desc,
}: {
  number: number;
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full bg-cream-2 border-2 border-ink-15 flex items-center justify-center text-2xl mb-3">
        {icon}
      </div>
      <div className="w-6 h-6 rounded-full bg-ink text-cream text-xs font-bold flex items-center justify-center mb-2">
        {number}
      </div>
      <p className="text-sm font-semibold text-ink mb-1">{title}</p>
      <p className="text-xs text-ink-35 max-w-[140px] leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState<string>("USER123");
  const [stats, setStats] = useState<ReferralStats>(FALLBACK_STATS);
  const [referrals, setReferrals] = useState<Referral[]>(MOCK_REFERRALS);
  const [copied, setCopied] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const referralLink = `https://neurocode.ai?ref=${referralCode}`;

  // Fetch referral data from API
  useEffect(() => {
    async function fetchReferrals() {
      try {
        const res = await fetch("/api/referrals");
        if (res.ok) {
          const data = await res.json();
          if (data.code) setReferralCode(data.code);
          if (data.stats) setStats(data.stats);
          if (Array.isArray(data.referrals) && data.referrals.length > 0) {
            setReferrals(data.referrals);
          }
        }
      } catch {
        // silently fall back to mock data
      } finally {
        setDataLoading(false);
      }
    }
    fetchReferrals();
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Não foi possível copiar. Tente manualmente.");
    }
  }, [referralLink]);

  const handleShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "NeuroCode AI — Gerador de Código com IA",
          text: "Crie código profissional em segundos com IA. Experimente grátis!",
          url: referralLink,
        });
      } catch {
        // user cancelled or error — fall through to copy
      }
    } else {
      handleCopy();
    }
  }, [referralLink, handleCopy]);

  const handleWithdraw = async () => {
    setWithdrawLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setWithdrawLoading(false);
    toast.success("Saque solicitado! Em breve você receberá via Pix.");
  };

  const shareLinks = [
    {
      label: "WhatsApp",
      color: "text-green-600 border-green-200 hover:bg-green-50",
      href: `https://wa.me/?text=${encodeURIComponent(
        `Ei! Estou usando o NeuroCode AI para criar código com IA e é incrível! Experimente grátis: ${referralLink}`
      )}`,
    },
    {
      label: "Twitter/X",
      color: "text-sky-600 border-sky-200 hover:bg-sky-50",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `Criei um site completo em 30 segundos com IA! Teste o @NeuroCodeAI grátis: ${referralLink}`
      )}`,
    },
    {
      label: "LinkedIn",
      color: "text-blue-700 border-blue-200 hover:bg-blue-50",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        referralLink
      )}`,
    },
    {
      label: "Email",
      color: "text-ink-35 border-ink-15 hover:bg-cream-2",
      href: `mailto:?subject=${encodeURIComponent(
        "Conheça o NeuroCode AI"
      )}&body=${encodeURIComponent(
        `Olá!\n\nEstou usando o NeuroCode AI para gerar código com inteligência artificial e está sendo incrível.\n\nVocê consegue criar sites, APIs e apps completos em segundos.\n\nExperimente grátis pelo meu link: ${referralLink}\n\nAbraços!`
      )}`,
    },
  ];

  return (
    <div className="min-h-screen bg-cream px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div>
          <h1 className="text-3xl font-bold text-ink mb-1">
            Programa de Indicações 💰
          </h1>
          <p className="text-sm text-ink-35">
            Indique amigos e ganhe 20% de comissão por cada assinatura convertida
          </p>
        </div>

        {/* ── Referral link ─────────────────────────────────────────────── */}
        <div className="bg-cream-2 border border-ink-15 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
              <LinkIcon className="w-4 h-4 text-gold" />
            </div>
            <span className="font-mono text-sm text-ink truncate select-all">
              {referralLink}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 border border-ink-15 rounded-xl px-4 py-2.5 text-sm text-ink-35 hover:bg-cream hover:text-ink transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 bg-ink text-cream rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-ink/80 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </button>
          </div>
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Indicados */}
          <div className="bg-cream border border-ink-15 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">
                {dataLoading ? <Loader2 className="w-5 h-5 animate-spin text-ink-35" /> : stats.totalReferred}
              </p>
              <p className="text-xs text-ink-35">Total Indicados</p>
            </div>
          </div>

          {/* Convertidos */}
          <div className="bg-cream border border-ink-15 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">
                {dataLoading ? <Loader2 className="w-5 h-5 animate-spin text-ink-35" /> : stats.converted}
              </p>
              <p className="text-xs text-ink-35">Convertidos</p>
            </div>
          </div>

          {/* Comissão Ganha */}
          <div className="bg-cream border border-ink-15 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">
                {dataLoading ? "—" : stats.totalCommission}
              </p>
              <p className="text-xs text-ink-35">Comissão Ganha</p>
            </div>
          </div>
        </div>

        {/* ── Como Funciona ──────────────────────────────────────────────── */}
        <div className="bg-cream border border-ink-15 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-ink mb-6">Como Funciona</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <HowItWorksStep
              number={1}
              icon="🔗"
              title="Compartilhe seu link"
              desc="Copie seu link exclusivo e envie para amigos e redes sociais"
            />
            <HowItWorksStep
              number={2}
              icon="👥"
              title="Amigo se cadastra"
              desc="Seu amigo acessa pelo link e cria uma conta grátis"
            />
            <HowItWorksStep
              number={3}
              icon="💳"
              title="Assina um plano"
              desc="Quando ele assinar qualquer plano pago"
            />
            <HowItWorksStep
              number={4}
              icon="💰"
              title="Você ganha 20%"
              desc="Receba 20% de comissão creditado automaticamente"
            />
          </div>
        </div>

        {/* ── Commission details + Withdrawal ───────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Commission details */}
          <div className="bg-cream border border-ink-15 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-ink">Detalhes da Comissão</h2>
              <p className="text-xs text-ink-35 mt-0.5">Tudo que você precisa saber</p>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">20% por conversão Starter/Pro</p>
                  <p className="text-xs text-ink-35">
                    Starter: ~R$15,80 · Pro: ~R$39,40 por indicação
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">Pagamento mensal via Pix</p>
                  <p className="text-xs text-ink-35">
                    Todo dia 5 do mês · saldo mínimo de R$50
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">Validade do cookie: 30 dias</p>
                  <p className="text-xs text-ink-35">
                    Conversões atribuídas por 30 dias após o clique
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-3 h-3 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">
                    Processamento em até 5 dias úteis
                  </p>
                  <p className="text-xs text-ink-35">Após solicitação do saque</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-ink-15">
              <div className="flex items-start gap-2 text-xs text-ink-35">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  Comissões são estornadas se o indicado solicitar reembolso
                  dentro de 14 dias da assinatura.
                </span>
              </div>
            </div>
          </div>

          {/* Withdrawal */}
          <div className="bg-cream border border-ink-15 rounded-2xl p-6 flex flex-col">
            <div>
              <h2 className="text-lg font-bold text-ink">Solicitar Saque</h2>
              <p className="text-xs text-ink-35 mt-0.5">Receba sua comissão via Pix</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
                <Wallet className="w-7 h-7 text-gold" />
              </div>
              <p className="text-3xl font-bold text-ink mb-1">
                {dataLoading ? "—" : stats.balance}
              </p>
              <p className="text-xs text-ink-35 mb-6">Saldo disponível</p>

              <div className="w-full bg-cream-2 rounded-xl p-3 text-center text-xs text-ink-35 mb-4">
                Mínimo para saque:{" "}
                <span className="font-semibold text-ink">R$50,00</span>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={withdrawLoading}
                className="w-full bg-ink text-cream rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-ink/80 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {withdrawLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    Solicitar via Pix
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Referral History Table ────────────────────────────────────── */}
        <div className="bg-cream border border-ink-15 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-ink-15 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Histórico de Indicações</h2>
              <p className="text-xs text-ink-35 mt-0.5">
                Acompanhe o status de cada indicação
              </p>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full border border-ink-15 font-medium text-ink-35">
              {referrals.length} indicações
            </span>
          </div>

          {referrals.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cream-2 flex items-center justify-center">
                <Users className="w-5 h-5 text-ink-35" />
              </div>
              <p className="text-sm font-medium text-ink">Sem indicações ainda</p>
              <p className="text-xs text-ink-35 text-center max-w-xs">
                Compartilhe seu link para começar a ganhar comissões
              </p>
              <button
                onClick={handleCopy}
                className="mt-2 inline-flex items-center gap-2 bg-ink text-cream rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-ink/80 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copiar meu link
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-15 bg-cream-2/60">
                    <th className="text-left text-xs font-semibold text-ink-35 px-5 py-3">
                      Data
                    </th>
                    <th className="text-left text-xs font-semibold text-ink-35 px-5 py-3">
                      Usuário
                    </th>
                    <th className="text-left text-xs font-semibold text-ink-35 px-5 py-3">
                      Plano
                    </th>
                    <th className="text-left text-xs font-semibold text-ink-35 px-5 py-3">
                      Status
                    </th>
                    <th className="text-right text-xs font-semibold text-ink-35 px-5 py-3">
                      Comissão
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-15">
                  {referrals.map((ref, i) => (
                    <tr key={i} className="hover:bg-cream-2/30 transition-colors">
                      <td className="px-5 py-4 text-sm text-ink-35 font-mono whitespace-nowrap">
                        {ref.date}
                      </td>
                      <td className="px-5 py-4 text-sm text-ink whitespace-nowrap">
                        {ref.user}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs px-2.5 py-0.5 rounded-full border border-ink-15 font-medium text-ink-35">
                          {ref.plan}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={ref.status} />
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-right whitespace-nowrap">
                        {ref.status === "cancelled" ? (
                          <span className="text-ink-35 line-through">
                            {ref.commission}
                          </span>
                        ) : ref.status === "pending" ? (
                          <span className="text-yellow-600">{ref.commission}</span>
                        ) : (
                          <span className="text-green-600">{ref.commission}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-ink-15 bg-cream-2/40">
                    <td
                      colSpan={4}
                      className="px-5 py-3 text-xs font-semibold text-ink-35"
                    >
                      Total de comissões convertidas
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-ink text-right">
                      {stats.totalCommission}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* ── Share section ─────────────────────────────────────────────── */}
        <div className="bg-cream border border-ink-15 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-ink mb-1">Compartilhar via</h2>
          <p className="text-xs text-ink-35 mb-5">
            Escolha sua plataforma favorita
          </p>
          <div className="flex flex-wrap gap-3">
            {shareLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 border rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${s.color}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {s.label}
              </a>
            ))}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 border border-ink-15 rounded-xl px-4 py-2.5 text-sm font-medium text-ink-35 hover:bg-cream-2 hover:text-ink transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-600">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Promo tip ─────────────────────────────────────────────────── */}
        <div className="bg-gold/[0.06] border border-gold/25 rounded-2xl p-5 flex items-start gap-4">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div>
            <p className="text-sm font-semibold text-ink mb-1">
              Dica para mais conversões
            </p>
            <p className="text-sm text-ink-35 leading-relaxed">
              Compartilhe seu link em grupos de empreendedores, desenvolvedores e
              profissionais de marketing. Quanto mais nichado o público, maior a
              taxa de conversão. Inclua um pequeno relato de como usa o NeuroCode
              para deixar o convite mais persuasivo.
            </p>
            <a
              href="/gerar"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-gold hover:opacity-70 transition-opacity font-medium"
            >
              Criar meu primeiro projeto
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
