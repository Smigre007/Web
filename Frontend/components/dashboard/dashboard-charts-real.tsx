"use client";

import { useMemo } from "react";
import { useTheme } from "@/context/theme-context";
import { isDarkColorScheme } from "@/lib/theme-storage";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Project = {
  id: string;
  name: string;
  type: string;
  status: string;
  created_at: string;
};

const COLORS_LIGHT = ["#b45309", "#141210", "#6b7280", "#d97706", "#a3a3a3", "#10b981"];
const COLORS_DARK = ["#f59e0b", "#d97706", "#94a3b8", "#fbbf24", "#a3a3a3", "#34d399"];

function monthKey(date: Date, locale: string) {
  return date.toLocaleDateString(locale, { month: "short" });
}

export function DashboardChartsReal({
  projects,
  locale,
  t,
}: {
  projects: Project[];
  locale: string;
  t: (key: string) => string;
}) {
  const { theme } = useTheme();
  const dark = isDarkColorScheme(theme);
  const COLORS = dark ? COLORS_DARK : COLORS_LIGHT;
  const gridStroke = dark ? "rgba(255,255,255,0.08)" : "rgba(20,18,16,0.07)";
  const tickFill = dark ? "#94a3b8" : "#6b7280";
  const barFill = dark ? "#d97706" : "#141210";

  const tooltipStyle = useMemo(
    () =>
      dark
        ? ({
            contentStyle: {
              background: "#1b1c18",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              fontSize: "12px",
              color: "#f4f3ee",
            },
          } as const)
        : ({
            contentStyle: {
              background: "#f5f2ed",
              border: "1px solid rgba(20,18,16,0.1)",
              borderRadius: "12px",
              fontSize: "12px",
              color: "#141210",
            },
          } as const),
    [dark],
  );

  const areaData = useMemo(() => {
    const now = new Date();
    const months: { key: string; ts: number; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: monthKey(d, locale), ts: d.getTime(), value: 0 });
    }
    for (const p of projects) {
      const d = new Date(p.created_at);
      const first = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const row = months.find((m) => m.ts === first);
      if (row) row.value += 1;
    }
    return months.map((m) => ({ month: m.key, projects: m.value }));
  }, [projects, locale]);

  const last7Days = useMemo(() => {
    const now = new Date();
    const days: { key: string; ts: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toLocaleDateString(locale, { weekday: "short" });
      const iso = d.toISOString().slice(0, 10);
      days.push({ key, ts: iso, value: 0 });
    }
    for (const p of projects) {
      const iso = new Date(p.created_at).toISOString().slice(0, 10);
      const row = days.find((d) => d.ts === iso);
      if (row) row.value += 1;
    }
    return days.map((d) => ({ day: d.key, count: d.value }));
  }, [projects, locale]);

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of projects) map.set(p.type, (map.get(p.type) ?? 0) + 1);
    const arr = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    return arr.length ? arr : [{ name: t("noData"), value: 1 }];
  }, [projects, t]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-ink-15 bg-cream-2 p-5">
        <h3 className="text-sm font-semibold text-ink mb-4">{t("projectsPerMonth")}</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGradReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b45309" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#b45309" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="projects" stroke="#b45309" strokeWidth={2} fill="url(#areaGradReal)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-ink-15 bg-cream-2 p-5">
        <h3 className="text-sm font-semibold text-ink mb-4">{t("projectsLast7Days")}</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={last7Days} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="count" fill={barFill} radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-ink-15 bg-cream-2 p-5 lg:col-span-2">
        <h3 className="text-sm font-semibold text-ink mb-4">{t("distributionByType")}</h3>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="48%" height={220}>
            <PieChart>
              <Pie data={byType} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {byType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 flex flex-col gap-2">
            {byType.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-ink-60 flex-1">{entry.name}</span>
                <span className="text-ink font-semibold">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
