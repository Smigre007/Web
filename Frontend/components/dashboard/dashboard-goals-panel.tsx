"use client";

import type { DashboardDict } from "@/components/dashboard/dashboard-copy";

const DEFAULT_GOALS = [
  { nameKey: "goalRevenue" as const, pct: 82, color: "#b45309" },
  { nameKey: "goalUsers" as const, pct: 64, color: "#7c3aed" },
  { nameKey: "goalRetention" as const, pct: 91, color: "#16a34a" },
  { nameKey: "goalNps" as const, pct: 74, color: "#d97706" },
];

const DEFAULT_OKRS: { objKey: "okrGrowth" | "okrUsers" | "okrProduct"; kr: string[]; pct: number }[] = [
  {
    objKey: "okrGrowth",
    kr: ["goalKrMrr", "goalKrChurn"],
    pct: 74,
  },
  {
    objKey: "okrUsers",
    kr: ["goalKrActive", "goalKrNps"],
    pct: 58,
  },
  {
    objKey: "okrProduct",
    kr: ["goalKrV3", "goalKrUptime"],
    pct: 41,
  },
];

export function DashboardGoalsPanel({ i }: { i: DashboardDict }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-ink font-sans">{i.goalsTitle}</h2>
        <p className="text-sm text-ink-35 mt-0.5">{i.goalsSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-ink-15 bg-cream-2 p-5 shadow-sm shadow-ink/[0.03]">
          <h3 className="text-sm font-semibold text-ink mb-5">{i.goalsMonthly}</h3>
          <div className="space-y-4">
            {DEFAULT_GOALS.map((g) => (
              <div key={g.nameKey}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-[13px] font-medium text-ink">{i[g.nameKey]}</span>
                  <span className="text-[13px] font-semibold" style={{ color: g.color }}>
                    {g.pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-ink/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${g.pct}%`, background: g.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-ink-15 bg-cream-2 p-5 shadow-sm shadow-ink/[0.03]">
          <h3 className="text-sm font-semibold text-ink mb-4">{i.goalsQuarter}</h3>
          <div className="flex flex-col">
            {DEFAULT_OKRS.map((o) => (
              <div key={o.objKey} className="py-3.5 border-b border-ink-15 last:border-0 first:pt-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[13px] font-semibold text-ink">{i[o.objKey]}</span>
                  <span
                    className={`text-xs font-bold font-sans ${
                      o.pct > 70 ? "text-emerald-600" : o.pct > 50 ? "text-amber-600" : "text-red-600"
                    }`}
                  >
                    {o.pct}%
                  </span>
                </div>
                {o.kr.map((k) => (
                  <div key={k} className="text-xs text-ink-35 flex items-start gap-2 mb-1 last:mb-0">
                    <span className="text-ink/25 shrink-0">✓</span>
                    <span>{i[k]}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
