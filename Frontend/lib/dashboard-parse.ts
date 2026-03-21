/** Pure parsers for dashboard API responses — unit-tested. */

export const DASHBOARD_SECTIONS = [
  "overview",
  "analytics",
  "projects",
  "tasks",
  "calendar",
  "goals",
] as const;
export type DashboardSection = (typeof DASHBOARD_SECTIONS)[number];

export type DashboardStatsParsed = {
  total: number;
  completed: number;
  thisMonth: number;
  topType: string;
};

export type DashboardUsageParsed = {
  generations_used: number;
  generations_limit: number;
  percent: number;
  plan: string;
};

export type DashboardProjectParsed = {
  id: string;
  name: string;
  type: string;
  status: string;
  created_at: string;
};

export function isDashboardSection(s: string | null | undefined): s is DashboardSection {
  return !!s && (DASHBOARD_SECTIONS as readonly string[]).includes(s);
}

export function parseDashboardStats(json: unknown): DashboardStatsParsed | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  const o = json as Record<string, unknown>;
  if (typeof o.total !== "number") return null;
  return {
    total: o.total,
    completed: typeof o.completed === "number" ? o.completed : 0,
    thisMonth: typeof o.thisMonth === "number" ? o.thisMonth : 0,
    topType: typeof o.topType === "string" ? o.topType : "",
  };
}

export function parseDashboardUsage(json: unknown): DashboardUsageParsed | null {
  if (!json || typeof json !== "object") return null;
  const o = json as Record<string, unknown>;
  if (typeof o.generations_used !== "number" || typeof o.generations_limit !== "number") return null;
  return {
    generations_used: o.generations_used,
    generations_limit: o.generations_limit,
    percent: typeof o.percent === "number" ? o.percent : 0,
    plan: typeof o.plan === "string" ? o.plan : "free",
  };
}

export function normalizeDashboardProjectsPayload(json: unknown): DashboardProjectParsed[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter((p) => p && typeof p === "object" && typeof (p as { id?: string }).id === "string")
    .map((raw) => {
      const p = raw as Record<string, unknown>;
      return {
        id: String(p.id),
        name: typeof p.name === "string" ? p.name : "—",
        type: typeof p.type === "string" ? p.type : "website",
        status: typeof p.status === "string" ? p.status : "draft",
        created_at: typeof p.created_at === "string" ? p.created_at : new Date().toISOString(),
      };
    });
}
