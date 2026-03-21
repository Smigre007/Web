"use client";

import type { DashboardDict } from "@/components/dashboard/dashboard-copy";

type Priority = "high" | "mid" | "low";

export type DashboardTask = {
  title: string;
  tag: string;
  tagColor: string;
  priority: Priority;
  due: string;
  assignees: string[];
};

const DEFAULT_TASKS: {
  todo: DashboardTask[];
  doing: DashboardTask[];
  done: DashboardTask[];
} = {
  todo: [
    {
      title: "Redesign da página de onboarding",
      tag: "Design",
      tagColor: "#7c3aed",
      priority: "high",
      due: "Amanhã",
      assignees: ["A", "C"],
    },
    {
      title: "Implementar autenticação 2FA",
      tag: "Dev",
      tagColor: "#b45309",
      priority: "mid",
      due: "15 Mai",
      assignees: ["R"],
    },
  ],
  doing: [
    {
      title: "Integração com API de pagamentos",
      tag: "Backend",
      tagColor: "#16a34a",
      priority: "high",
      due: "Hoje",
      assignees: ["C", "R"],
    },
    {
      title: "Análise de métricas Q2",
      tag: "Analytics",
      tagColor: "#d97706",
      priority: "low",
      due: "20 Mai",
      assignees: ["J"],
    },
  ],
  done: [
    {
      title: "Atualização do sistema de notificações",
      tag: "Full Stack",
      tagColor: "#dc2626",
      priority: "mid",
      due: "08 Mai",
      assignees: ["F", "C"],
    },
    {
      title: "Refactor módulo de relatórios",
      tag: "Dev",
      tagColor: "#b45309",
      priority: "low",
      due: "05 Mai",
      assignees: ["R"],
    },
  ],
};

const AVATAR_COLORS = ["#b45309", "#7c3aed", "#16a34a", "#d97706", "#dc2626"];

export function DashboardTaskBoard({
  i,
}: {
  i: DashboardDict;
}) {
  const tasks = DEFAULT_TASKS;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink font-sans">{i.taskBoardTitle}</h2>
          <p className="text-sm text-ink-35 mt-0.5">{i.taskBoardSubtitle}</p>
        </div>
        <button
          type="button"
          className="rounded-xl border border-ink-15 bg-cream-2 px-4 py-2 text-sm font-medium text-ink hover:border-ink/[0.2] transition-colors shrink-0"
        >
          {i.taskBoardNew}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(
          [
            { key: "todo" as const, label: i.taskColTodo, dot: "#6b7280" },
            { key: "doing" as const, label: i.taskColDoing, dot: "#d97706" },
            { key: "done" as const, label: i.taskColDone, dot: "#16a34a" },
          ] as const
        ).map((col) => (
          <div key={col.key} className="rounded-2xl border border-ink-15 bg-cream/[0.5] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-md text-[11px] font-semibold px-1"
                  style={{
                    background:
                      col.key === "done"
                        ? "rgba(22,163,74,0.12)"
                        : col.key === "doing"
                          ? "rgba(217,119,6,0.2)"
                          : "rgba(107,114,128,0.15)",
                    color: col.dot,
                  }}
                >
                  {tasks[col.key].length}
                </span>
                <span className="text-sm font-semibold text-ink truncate">{col.label}</span>
              </div>
              <button
                type="button"
                className="h-7 w-7 rounded-lg border border-ink-15 text-ink-35 hover:text-ink hover:bg-cream-2 text-sm flex items-center justify-center"
                aria-label={i.taskBoardAdd}
              >
                +
              </button>
            </div>
            <div className="space-y-2.5">
              {tasks[col.key].map((task, idx) => (
                <div
                  key={`${task.title}-${idx}`}
                  className="rounded-xl border border-ink-15 bg-cream-2 p-3.5 shadow-sm shadow-ink/[0.03] hover:shadow-md transition-shadow"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: task.tagColor }}>
                    {task.tag}
                  </div>
                  <p className="text-[13px] font-medium text-ink leading-snug mb-3">{task.title}</p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex -space-x-1.5">
                      {task.assignees.map((a, j) => (
                        <div
                          key={`${a}-${j}`}
                          className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-cream-2 text-[9px] font-bold text-white"
                          style={{ background: AVATAR_COLORS[j % AVATAR_COLORS.length], marginLeft: j > 0 ? -4 : 0 }}
                        >
                          {a}
                        </div>
                      ))}
                    </div>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wide ${
                        task.priority === "high"
                          ? "text-red-600"
                          : task.priority === "mid"
                            ? "text-amber-600"
                            : "text-emerald-600"
                      }`}
                    >
                      {task.priority === "high"
                        ? i.priorityHigh
                        : task.priority === "mid"
                          ? i.priorityMid
                          : i.priorityLow}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-35 mt-2">📅 {task.due}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
