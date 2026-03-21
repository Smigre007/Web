"use client";

import { useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DashboardDict } from "@/components/dashboard/dashboard-copy";
import { useTheme } from "@/context/theme-context";
import { isDarkColorScheme } from "@/lib/theme-storage";

const RADAR_DATA = [
  { subject: "sales", A: 82 },
  { subject: "support", A: 76 },
  { subject: "marketing", A: 91 },
  { subject: "product", A: 67 },
  { subject: "design", A: 88 },
  { subject: "dev", A: 94 },
];

export function DashboardRadarChart({ i }: { i: DashboardDict }) {
  const { theme } = useTheme();
  const dark = isDarkColorScheme(theme);
  const polarGridStroke = dark ? "rgba(255,255,255,0.1)" : "rgba(20,18,16,0.1)";
  const tickFill = dark ? "#94a3b8" : "#6b7280";

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

  const data = RADAR_DATA.map((row) => ({
    ...row,
    label: i[`radar_${row.subject}` as keyof DashboardDict] as string,
  }));

  return (
    <div className="rounded-2xl border border-ink-15 bg-cream-2 p-5">
      <h3 className="text-sm font-semibold text-ink mb-1">{i.radarTitle}</h3>
      <p className="text-xs text-ink-35 mb-4">{i.radarSubtitle}</p>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
          <PolarGrid stroke={polarGridStroke} />
          <PolarAngleAxis dataKey="label" tick={{ fontSize: 11, fill: tickFill }} />
          <Tooltip {...tooltipStyle} />
          <Radar name={i.radarScore} dataKey="A" stroke="#b45309" fill="#b45309" fillOpacity={0.12} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
