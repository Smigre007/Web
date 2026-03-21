import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// ── Colour palette aligned with the design system ─────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  website: "#b8965a",
  webapp: "#d4b07a",
  saas: "#8b7355",
  landing: "#c4a882",
  dashboard: "#9b7e5a",
  api: "#6b5a3e",
  mobile: "#a08060",
  automation: "#7a6245",
  platform: "#b89a6a",
};

const FALLBACK_COLORS = [
  "#b8965a",
  "#d4b07a",
  "#8b7355",
  "#c4a882",
  "#9b7e5a",
  "#6b5a3e",
];

const TYPE_LABELS: Record<string, string> = {
  website: "Website",
  webapp: "Web App",
  saas: "SaaS",
  landing: "Landing Page",
  dashboard: "Dashboard",
  api: "API REST",
  mobile: "Mobile",
  automation: "Automação",
  platform: "Plataforma",
};

function safeDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const db = getSupabaseAdmin();

    const { data: projects, error } = await db
      .from("projects")
      .select("id, created_at, status, type")
      .eq("user_clerk_id", userId);

    if (error) throw error;

    const all = projects ?? [];
    const total = all.length;
    const completed = all.filter((p) => p.status === "completed").length;

    // ── Périodos ────────────────────────────────────────────────────────────────
    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();
    const startOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    ).toISOString();

    const thisMonth = all.filter((p) => p.created_at >= startOfMonth).length;
    const lastMonth = all.filter(
      (p) =>
        p.created_at >= startOfLastMonth && p.created_at < startOfMonth
    ).length;

    const completedThisMonth = all.filter(
      (p) => p.status === "completed" && p.created_at >= startOfMonth
    ).length;
    const completedLastMonth = all.filter(
      (p) =>
        p.status === "completed" &&
        p.created_at >= startOfLastMonth &&
        p.created_at < startOfMonth
    ).length;

    // ── Dados mensais para o gráfico (últimos 6 meses) ──────────────────────────
    const monthlyData: { month: string; projects: number; completed: number }[] =
      [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();

      const count = all.filter(
        (p) => p.created_at >= start && p.created_at < end
      ).length;
      const comp = all.filter(
        (p) =>
          p.status === "completed" &&
          p.created_at >= start &&
          p.created_at < end
      ).length;

      const rawLabel = d.toLocaleString("pt-BR", { month: "short" });
      const label =
        rawLabel.charAt(0).toUpperCase() +
        rawLabel.slice(1).replace(".", "");

      monthlyData.push({ month: label, projects: count, completed: comp });
    }

    // ── Distribuição por tipo ──────────────────────────────────────────────────
    const typeCounts: Record<string, number> = {};
    for (const p of all) {
      typeCounts[p.type] = (typeCounts[p.type] ?? 0) + 1;
    }

    const topType =
      Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const typeData = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], i) => ({
        name: TYPE_LABELS[name] ?? name,
        rawName: name,
        value: total > 0 ? Math.round((count / total) * 100) : 0,
        count,
        color:
          TYPE_COLORS[name] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      }));

    // ── Deltas reais ────────────────────────────────────────────────────────────
    const deltas = {
      total: safeDelta(thisMonth, lastMonth),
      completed: safeDelta(completedThisMonth, completedLastMonth),
      thisMonth: safeDelta(thisMonth, lastMonth),
    };

    return NextResponse.json({
      total,
      completed,
      thisMonth,
      lastMonth,
      topType,
      monthlyData,
      typeData,
      deltas,
    });
  } catch {
    return NextResponse.json({
      total: 0,
      completed: 0,
      thisMonth: 0,
      lastMonth: 0,
      topType: null,
      monthlyData: [],
      typeData: [],
      deltas: { total: 0, completed: 0, thisMonth: 0 },
    });
  }
}
