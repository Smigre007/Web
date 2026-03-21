"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  FolderCode,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  ChevronRight,
  ListTodo,
  Calendar,
  Target,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { DashboardChartsReal } from "@/components/dashboard/dashboard-charts-real";
import { DashboardTaskBoard } from "@/components/dashboard/dashboard-task-board";
import { DashboardCalendarStrip } from "@/components/dashboard/dashboard-calendar-strip";
import { DashboardGoalsPanel } from "@/components/dashboard/dashboard-goals-panel";
import { DashboardRadarChart } from "@/components/dashboard/dashboard-radar-chart";
import { DASHBOARD_I18N } from "@/components/dashboard/dashboard-copy";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { DashboardKpiGrid } from "@/components/dashboard/dashboard-kpi-grid";
import {
  DashboardProjectTable,
  DashboardActivityFeed,
  DashboardProjectsToolbar,
  type DashboardProject,
} from "@/components/dashboard/dashboard-project-blocks";
import { DashboardAiMinimal } from "@/components/dashboard/dashboard-ai-minimal";
import { PROJECT_TYPE_LABELS } from "@/lib/utils";
import {
  parseDashboardStats,
  parseDashboardUsage,
  normalizeDashboardProjectsPayload,
  isDashboardSection,
  type DashboardSection,
  type DashboardStatsParsed,
  type DashboardUsageParsed,
} from "@/lib/dashboard-parse";

export type { DashboardSection } from "@/lib/dashboard-parse";

const PROJECTS_FETCH_LIMIT = 500;

export function DashboardClientV2({
  userName,
  initialTab,
}: {
  userName: string;
  initialTab?: string;
}) {
  const { language } = useLanguage();
  const lang = (language as "pt" | "en" | "es" | "fr") ?? "pt";
  const i = DASHBOARD_I18N[lang];
  const locale = language === "en" ? "en-US" : language === "es" ? "es-ES" : language === "fr" ? "fr-FR" : "pt-BR";
  const prefersReducedMotion = useReducedMotion();

  const router = useRouter();
  const searchParams = useSearchParams();

  const section = useMemo((): DashboardSection => {
    const t = searchParams.get("tab");
    if (isDashboardSection(t)) return t;
    if (isDashboardSection(initialTab)) return initialTab;
    return "overview";
  }, [searchParams, initialTab]);

  const replaceTab = useCallback(
    (next: DashboardSection) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", next);
      params.delete("type");
      router.replace(`/dashboard?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const [stats, setStats] = useState<DashboardStatsParsed | null>(null);
  const [usage, setUsage] = useState<DashboardUsageParsed | null>(null);
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");

  const fetchStatsAndUsage = useCallback(async () => {
    try {
      const [statsRes, usageRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/user/usage"),
      ]);
      if (statsRes.ok) {
        const d = await statsRes.json();
        const parsed = parseDashboardStats(d);
        if (parsed) setStats(parsed);
      }
      if (usageRes.ok) {
        const d = await usageRes.json();
        const parsed = parseDashboardUsage(d);
        if (parsed) setUsage(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchProjects = useCallback(() => {
    setLoadingProjects(true);
    setProjectsError(null);
    fetch(`/api/projects?limit=${PROJECTS_FETCH_LIMIT}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          const msg = typeof (data as { error?: string }).error === "string" ? (data as { error: string }).error : i.dataLoadError;
          setProjectsError(msg);
          return [] as DashboardProject[];
        }
        return normalizeDashboardProjectsPayload(data);
      })
      .then(setProjects)
      .catch(() => {
        setProjectsError(i.dataLoadError);
        setProjects([]);
      })
      .finally(() => setLoadingProjects(false));
  }, [i.dataLoadError]);

  const refreshAll = useCallback(() => {
    void fetchStatsAndUsage();
    fetchProjects();
  }, [fetchStatsAndUsage, fetchProjects]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void fetchStatsAndUsage();
    });
    return () => cancelAnimationFrame(id);
  }, [fetchStatsAndUsage]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      fetchProjects();
    });
    return () => cancelAnimationFrame(id);
  }, [fetchProjects]);

  useEffect(() => {
    const onRefresh = () => refreshAll();
    window.addEventListener("neurocode:dashboard-refresh", onRefresh);
    return () => window.removeEventListener("neurocode:dashboard-refresh", onRefresh);
  }, [refreshAll]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") refreshAll();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refreshAll]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(projectSearch.toLowerCase());
      const matchFilter = projectFilter === "all" || p.status === projectFilter;
      return matchSearch && matchFilter;
    });
  }, [projects, projectSearch, projectFilter]);

  const openCommandPalette = useCallback(() => {
    window.dispatchEvent(new Event("neurocode:open-command-palette"));
  }, []);

  const navItems: { id: DashboardSection; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: i.overview, icon: LayoutDashboard },
    { id: "analytics", label: i.analytics, icon: BarChart3 },
    { id: "projects", label: i.projects, icon: FolderCode },
    { id: "tasks", label: i.tasks, icon: ListTodo },
    { id: "calendar", label: i.calendar, icon: Calendar },
    { id: "goals", label: i.goals, icon: Target },
  ];

  const currentTabLabel = navItems.find((n) => n.id === section)?.label ?? i.overview;

  const topTypeDisplay =
    stats?.topType && stats.topType.length > 0
      ? PROJECT_TYPE_LABELS[stats.topType] ?? stats.topType
      : "—";

  const kpiItems = useMemo(
    () => [
      {
        label: i.totalProjects,
        value: stats?.total ?? "—",
        sub: `${stats?.thisMonth ?? 0} ${i.thisMonth}`,
        icon: FolderCode,
      },
      {
        label: i.completed,
        value: stats?.completed ?? "—",
        sub: `${i.topType}: ${topTypeDisplay}`,
        icon: CheckCircle2,
      },
      {
        label: i.usage,
        value: usage ? `${usage.generations_used}/${usage.generations_limit}` : "—",
        sub: usage ? `${usage.percent}% ${i.used}` : "",
        icon: Zap,
      },
      {
        label: i.currentPlan,
        value: usage?.plan ?? "—",
        sub: i.seePlans,
        icon: ArrowUpRight,
        href: "/settings/billing",
      },
    ],
    [i, stats, usage, topTypeDisplay]
  );

  const tCharts = (k: string) => i[k] ?? k;

  const hasGeneratingProject = useMemo(
    () => projects.some((p) => p.status === "generating"),
    [projects]
  );

  const sectionMotion = prefersReducedMotion ? { duration: 0 } : { duration: 0.18 };

  return (
    <div className="flex flex-col min-h-0 h-full max-h-[100dvh]">
      <div className="flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 space-y-4">
        <DashboardTopbar
          i={i}
          userName={userName}
          currentTabLabel={currentTabLabel}
          onOpenCommandPalette={openCommandPalette}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex gap-1 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1 flex-1 min-w-0"
            role="tablist"
            aria-label={i.breadcrumbRoot}
          >
            {navItems.map((item) => {
              const isActive = section === item.id;
              const tabId = `dashboard-tab-${item.id}`;
              const panelId = `dashboard-panel-${item.id}`;
              return (
                <button
                  key={item.id}
                  id={tabId}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => replaceTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 border ${
                    isActive
                      ? "bg-ink text-cream border-ink shadow-sm"
                      : "text-ink-35 hover:text-ink-60 bg-cream-2 border-ink-15 hover:border-ink/[0.18]"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" aria-hidden />
                  {item.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => refreshAll()}
            className="shrink-0 text-xs px-3 py-2 rounded-xl border border-ink-15 bg-cream-2 text-ink-60 hover:text-ink hover:border-ink/[0.2] transition-colors"
          >
            {i.retry}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pb-28 sm:pb-24">
        {projectsError ? (
          <div
            className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            role="alert"
          >
            <span>{projectsError}</span>
            <button
              type="button"
              onClick={() => fetchProjects()}
              className="text-sm font-medium underline underline-offset-2 hover:no-underline"
            >
              {i.retry}
            </button>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            id={`dashboard-panel-${section}`}
            role="tabpanel"
            aria-labelledby={`dashboard-tab-${section}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={sectionMotion}
            className="space-y-6 pb-8"
          >
            {section === "overview" && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 text-sm font-medium text-ink border border-ink-15 rounded-xl px-4 py-2.5 bg-cream-2 hover:border-ink/25 hover:bg-cream transition-colors w-fit"
                  >
                    {i.libraryOpen}
                    <ChevronRight className="w-4 h-4" aria-hidden />
                  </Link>
                  {hasGeneratingProject ? (
                    <Link
                      href="/projects?status=generating"
                      className="inline-flex items-center gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl px-4 py-2.5 hover:bg-amber-100/80 transition-colors w-fit"
                    >
                      {i.generatingBanner}
                      <ChevronRight className="w-4 h-4 shrink-0" aria-hidden />
                    </Link>
                  ) : null}
                </div>
                <DashboardKpiGrid items={kpiItems} />
                <DashboardChartsReal projects={projects} locale={locale} t={tCharts} />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                  <div className="rounded-2xl border border-ink-15 bg-cream-2 overflow-hidden shadow-sm shadow-ink/[0.03]">
                    <div className="px-4 sm:px-5 py-4 border-b border-ink-15 flex items-center justify-between gap-2">
                      <h2 className="font-semibold text-ink font-sans">{i.recentProjects}</h2>
                      <button
                        type="button"
                        onClick={() => replaceTab("projects")}
                        className="text-xs text-ink-35 hover:text-ink flex items-center gap-1 shrink-0"
                      >
                        {i.seeAll} <ChevronRight className="w-3.5 h-3.5" aria-hidden />
                      </button>
                    </div>
                    <DashboardProjectTable
                      projects={projects.slice(0, 5)}
                      loading={loadingProjects}
                      i={i}
                      locale={locale}
                      compact
                    />
                  </div>
                  <div className="rounded-2xl border border-ink-15 bg-cream-2 p-4 sm:p-5 shadow-sm shadow-ink/[0.03]">
                    <h2 className="font-semibold text-ink font-sans mb-4">{i.recentActivity}</h2>
                    <DashboardActivityFeed projects={projects.slice(0, 6)} i={i} locale={locale} />
                  </div>
                </div>
              </>
            )}

            {section === "analytics" && (
              <>
                <div>
                  <h2 className="font-semibold text-ink text-lg font-sans">{i.advancedAnalytics}</h2>
                  <p className="text-ink-35 text-sm">{i.analyticsSubtitle}</p>
                </div>
                <DashboardChartsReal projects={projects} locale={locale} t={tCharts} />
                <DashboardRadarChart i={i} />
              </>
            )}

            {section === "projects" && (
              <div className="rounded-2xl border border-ink-15 bg-cream-2 overflow-hidden shadow-sm shadow-ink/[0.03]">
                <DashboardProjectsToolbar
                  i={i}
                  projectSearch={projectSearch}
                  setProjectSearch={setProjectSearch}
                  projectFilter={projectFilter}
                  setProjectFilter={setProjectFilter}
                  onNewProject={() => router.push("/gerar")}
                />
                <DashboardProjectTable
                  projects={filteredProjects}
                  loading={loadingProjects}
                  i={i}
                  locale={locale}
                />
              </div>
            )}

            {section === "tasks" && <DashboardTaskBoard i={i} />}

            {section === "calendar" && <DashboardCalendarStrip i={i} locale={locale} />}

            {section === "goals" && <DashboardGoalsPanel i={i} />}

          </motion.div>
        </AnimatePresence>
      </div>

      <DashboardAiMinimal i={i} onGoToFullChat={() => router.push("/chat-ia")} />
    </div>
  );
}
