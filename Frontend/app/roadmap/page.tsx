import { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Rocket, Clock, CheckCircle2 } from "lucide-react";
import { RoadmapVoteButton } from "@/components/roadmap/vote-button";
import { ROADMAP_ITEMS, type RoadmapStatus } from "@/lib/roadmap-data";

export const metadata: Metadata = {
  title: "Roadmap — NeuroCode AI",
  description: "Vote nas próximas funcionalidades do NeuroCode AI e acompanhe o que está sendo desenvolvido.",
};

const STATUS_CONFIG: Record<RoadmapStatus, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  done: { label: "Concluído", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  building: { label: "Em Desenvolvimento", icon: Rocket, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  planned: { label: "Planejado", icon: Clock, color: "text-white/50", bg: "bg-white/5 border-white/10" },
};

async function getVoteCounts(): Promise<Record<string, number>> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("roadmap_votes")
      .select("feature_key");

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      counts[row.feature_key] = (counts[row.feature_key] ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

export default async function RoadmapPage() {
  const voteCounts = await getVoteCounts();

  const byStatus = {
    done: ROADMAP_ITEMS.filter((i) => i.status === "done"),
    building: ROADMAP_ITEMS.filter((i) => i.status === "building"),
    planned: ROADMAP_ITEMS.filter((i) => i.status === "planned").sort(
      (a, b) => (voteCounts[b.key] ?? 0) - (voteCounts[a.key] ?? 0)
    ),
  };

  return (
    <div className="min-h-screen bg-[#08090c] py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm font-mono mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o início
        </Link>

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-emerald-500/70 mb-3">Próximos passos</p>
          <h1 className="text-4xl font-bold text-white mb-3">Roadmap Público</h1>
          <p className="text-white/50 max-w-xl">
            Vote nas funcionalidades que você mais quer ver. Os mais votados entram em desenvolvimento primeiro.
          </p>
        </div>

        <div className="space-y-12">
          {(["building", "planned", "done"] as RoadmapStatus[]).map((status) => {
            const config = STATUS_CONFIG[status];
            const items = byStatus[status];
            if (items.length === 0) return null;

            return (
              <div key={status}>
                {/* Column header */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono mb-5 ${config.bg} ${config.color}`}>
                  <config.icon className="w-3.5 h-3.5" />
                  {config.label}
                  <span className="opacity-50">({items.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.1] transition-colors"
                    >
                      <div className="text-2xl flex-shrink-0">{item.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm mb-1">{item.title}</p>
                        <p className="text-white/45 text-xs leading-relaxed">{item.description}</p>
                      </div>
                      {status !== "done" && (
                        <RoadmapVoteButton
                          featureKey={item.key}
                          initialCount={voteCounts[item.key] ?? 0}
                        />
                      )}
                      {status === "done" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] flex items-center justify-between">
          <p className="text-white/25 text-sm font-mono">
            Tem outra ideia?{" "}
            <Link href="/contact" className="text-emerald-500/70 hover:text-emerald-400 transition-colors">
              Entre em contato
            </Link>
          </p>
          <Link
            href="/changelog"
            className="text-white/30 hover:text-white/60 text-sm font-mono transition-colors"
          >
            Ver changelog →
          </Link>
        </div>
      </div>
    </div>
  );
}
