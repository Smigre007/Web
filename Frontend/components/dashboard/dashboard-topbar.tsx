"use client";

import { Search, ChevronRight } from "lucide-react";
import type { DashboardDict } from "@/components/dashboard/dashboard-copy";
import { modifierPlusKLabel } from "@/lib/keyboard-hint";

export function DashboardTopbar({
  i,
  userName,
  currentTabLabel,
  onOpenCommandPalette,
}: {
  i: DashboardDict;
  userName: string;
  currentTabLabel: string;
  onOpenCommandPalette: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-ink-15 pb-4">
      <div className="min-w-0">
        <nav className="flex items-center gap-1 text-xs text-ink-35 font-mono uppercase tracking-wider mb-1.5" aria-label="Breadcrumb">
          <span className="text-ink-60">{i.breadcrumbRoot}</span>
          <ChevronRight className="w-3 h-3 shrink-0 opacity-60" aria-hidden />
          <span className="text-ink truncate">{currentTabLabel}</span>
        </nav>
        <h1 className="font-sans text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
          {i.hello}, {userName}
        </h1>
        <p className="text-ink-35 text-sm mt-0.5 line-clamp-2">{i.welcome}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto max-w-md">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex flex-1 sm:flex-initial items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-ink-15 bg-cream-2 text-left text-sm text-ink-35 hover:text-ink-60 hover:border-ink/[0.2] transition-colors min-w-0"
          aria-label={i.searchCommands}
        >
          <Search className="w-4 h-4 shrink-0 opacity-70" aria-hidden />
          <span className="truncate flex-1">{i.searchCommands}</span>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-ink-15 bg-cream text-[10px] text-ink-35 font-mono shrink-0">
            {modifierPlusKLabel()}
          </kbd>
        </button>
      </div>
    </div>
  );
}
