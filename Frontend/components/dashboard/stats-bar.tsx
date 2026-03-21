"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useCountUp } from "@/hooks/use-count-up";
import {
  FolderCode,
  CheckCircle2,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { PROJECT_TYPE_LABELS } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { DASHBOARD_I18N } from "@/components/dashboard/dashboard-copy";
import type { DashboardStatsParsed } from "@/lib/dashboard-parse";

function StatValue({ value }: { value: number | string }) {
  const isNum = typeof value === "number";
  const { ref, formatted } = useCountUp({ target: isNum ? (value as number) : 0, duration: 1400 });
  if (!isNum) return <>{value}</>;
  return <span ref={ref as React.RefObject<HTMLSpanElement>}>{formatted}</span>;
}

export function StatsBar({
  stats,
  loading,
}: {
  stats: DashboardStatsParsed | null;
  loading: boolean;
}) {
  const { language } = useLanguage();
  const lang = (language as "pt" | "en" | "es" | "fr") ?? "pt";
  const i = DASHBOARD_I18N[lang];
  const reduceMotion = useReducedMotion();

  const items = [
    {
      icon: FolderCode,
      label: i.totalProjects,
      value: stats?.total ?? 0,
      color: "text-gold",
      bg: "bg-gold/[0.10]",
    },
    {
      icon: CheckCircle2,
      label: i.completed,
      value: stats?.completed ?? 0,
      color: "text-gold",
      bg: "bg-gold/[0.10]",
    },
    {
      icon: Calendar,
      label: i.thisMonth,
      value: stats?.thisMonth ?? 0,
      color: "text-gold",
      bg: "bg-gold/[0.10]",
    },
    {
      icon: TrendingUp,
      label: i.favoriteType,
      value: stats?.topType
        ? (PROJECT_TYPE_LABELS[stats.topType] ?? stats.topType)
        : "—",
      color: "text-gold",
      bg: "bg-gold/[0.10]",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="h-20 rounded-2xl border border-ink-15 bg-ink/[0.03] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {items.map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : idx * 0.07 }}
          className="flex items-center gap-3 p-3.5 rounded-2xl border border-ink-15 bg-ink/[0.02] hover:border-ink/[0.12] hover:bg-ink/[0.04] transition-all"
        >
          <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
            <item.icon className={`w-4 h-4 ${item.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-ink font-bold text-lg leading-none truncate">
              <StatValue value={item.value} />
            </p>
            <p className="text-ink-35 text-xs mt-0.5 truncate">{item.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
