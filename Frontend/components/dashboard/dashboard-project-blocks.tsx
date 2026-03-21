"use client";

import Link from "next/link";
import { Search, Filter, Eye, CheckCircle2, Activity, Plus } from "lucide-react";
import type { DashboardDict } from "@/components/dashboard/dashboard-copy";
import { dashboardStatusBadge, dashboardStatusLabel } from "@/components/dashboard/dashboard-copy";
import { PROJECT_TYPE_LABELS } from "@/lib/utils";

export type DashboardProject = {
  id: string;
  name: string;
  type: string;
  status: string;
  created_at: string;
};

export function DashboardProjectTable({
  projects,
  loading,
  i,
  locale,
  compact,
}: {
  projects: DashboardProject[];
  loading: boolean;
  i: DashboardDict;
  locale: string;
  compact?: boolean;
}) {
  if (loading) {
    return <div className="p-8 text-center text-ink-35 text-sm">{i.loadingProjects}</div>;
  }
  if (!projects.length) {
    return <div className="p-8 text-center text-ink-35 text-sm">{i.noProjects}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-ink/[0.03] border-b border-ink-15">
            <th className="text-left px-4 sm:px-5 py-3 text-xs text-ink-35 font-mono uppercase tracking-wider">{i.name}</th>
            <th className="text-left px-3 sm:px-4 py-3 text-xs text-ink-35 font-mono uppercase tracking-wider">{i.type}</th>
            <th className="text-left px-3 sm:px-4 py-3 text-xs text-ink-35 font-mono uppercase tracking-wider">{i.status}</th>
            {!compact && (
              <th className="text-left px-3 sm:px-4 py-3 text-xs text-ink-35 font-mono uppercase tracking-wider">{i.date}</th>
            )}
            <th className="text-left px-3 sm:px-4 py-3 text-xs text-ink-35 font-mono uppercase tracking-wider">{i.actions}</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p, idx) => (
            <tr
              key={p.id}
              className={`border-b border-ink-15 hover:bg-gold/[0.04] ${idx % 2 === 0 ? "" : "bg-ink/[0.01]"}`}
            >
              <td className="px-4 sm:px-5 py-3 font-medium text-ink max-w-[140px] truncate">{p.name}</td>
              <td className="px-3 sm:px-4 py-3 text-ink-60">
                {PROJECT_TYPE_LABELS[p.type] ?? p.type}
              </td>
              <td className="px-3 sm:px-4 py-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dashboardStatusBadge(p.status)}`}
                >
                  {dashboardStatusLabel(p.status, i)}
                </span>
              </td>
              {!compact && (
                <td className="px-3 sm:px-4 py-3 text-ink-35 whitespace-nowrap">
                  {new Date(p.created_at).toLocaleDateString(locale)}
                </td>
              )}
              <td className="px-3 sm:px-4 py-3">
                <Link
                  href={`/projects/${p.id}`}
                  className="p-1.5 rounded-lg text-ink-35 hover:text-ink hover:bg-ink/[0.05] inline-flex"
                  aria-label={i.actions}
                >
                  <Eye className="w-3.5 h-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardActivityFeed({
  projects,
  i,
  locale,
}: {
  projects: DashboardProject[];
  i: DashboardDict;
  locale: string;
}) {
  if (!projects.length) {
    return <p className="text-ink-35 text-sm">{i.noActivity}</p>;
  }
  return (
    <div className="space-y-3">
      {projects.map((p) => (
        <div key={p.id} className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              p.status === "completed" ? "bg-gold/15" : "bg-ink/[0.04]"
            }`}
          >
            {p.status === "completed" ? (
              <CheckCircle2 className="w-4 h-4 text-gold" aria-hidden />
            ) : (
              <Activity className="w-4 h-4 text-ink-35" aria-hidden />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-ink font-medium truncate">{p.name}</div>
            <div className="text-xs text-ink-35">
              {p.status === "completed"
                ? i.projectCompleted
                : p.status === "error"
                  ? i.projectFailed
                  : p.status === "generating"
                    ? i.projectGenerating
                    : i.projectCreated}{" "}
              · {new Date(p.created_at).toLocaleDateString(locale)}
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${dashboardStatusBadge(p.status)}`}>
            {dashboardStatusLabel(p.status, i)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DashboardProjectsToolbar({
  i,
  projectSearch,
  setProjectSearch,
  projectFilter,
  setProjectFilter,
  onNewProject,
}: {
  i: DashboardDict;
  projectSearch: string;
  setProjectSearch: (v: string) => void;
  projectFilter: string;
  setProjectFilter: (v: string) => void;
  onNewProject: () => void;
}) {
  return (
    <div className="px-4 sm:px-5 py-4 border-b border-ink-15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h2 className="font-semibold text-ink">{i.allProjects}</h2>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-ink-15 bg-cream text-sm min-w-0">
          <Search className="w-3.5 h-3.5 text-ink-35 shrink-0" />
          <input
            value={projectSearch}
            onChange={(e) => setProjectSearch(e.target.value)}
            placeholder={i.searchProject}
            className="bg-transparent outline-none text-ink placeholder-ink-35 min-w-0 flex-1 w-full sm:w-40"
          />
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-ink-15 bg-cream text-sm">
          <Filter className="w-3.5 h-3.5 text-ink-35 shrink-0" />
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-transparent outline-none text-ink-60 cursor-pointer min-w-0 flex-1"
          >
            <option value="all">{i.all}</option>
            <option value="completed">{i.completed}</option>
            <option value="generating">{i.generating}</option>
            <option value="draft">{i.drafts}</option>
            <option value="error">{i.errorStatus}</option>
          </select>
        </div>
        <button
          type="button"
          onClick={onNewProject}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink text-cream text-sm hover:bg-gold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden />
          {i.new}
        </button>
      </div>
    </div>
  );
}
