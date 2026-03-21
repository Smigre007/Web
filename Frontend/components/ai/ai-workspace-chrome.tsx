"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Brain, LayoutDashboard, MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

/**
 * Navegação mínima para páginas de IA — interface separada do Dashboard (dados).
 */
export function AiWorkspaceChrome() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const linkClass =
    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors border";
  const inactive =
    "text-ink-60 border-transparent hover:text-ink hover:bg-ink/[0.04] hover:border-ink-15";
  const active = "text-ink bg-cream-2 border-ink-15 shadow-sm";

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-ink-15 bg-cream/90 backdrop-blur-md">
      <div className="h-12 sm:h-14 px-3 sm:px-5 flex items-center gap-2 sm:gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-ink hover:text-gold transition-colors shrink-0"
          title={t("sidebar", "dashboard")}
        >
          <LayoutDashboard className="w-4 h-4 opacity-70" aria-hidden />
          <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">
            {t("sidebar", "dashboard")}
          </span>
        </Link>

        <div className="h-6 w-px bg-ink-15 shrink-0" aria-hidden />

        <Link href="/" className="flex items-center gap-2 shrink-0 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 text-cream" />
          </div>
          <span className="font-black text-sm text-ink tracking-tight truncate hidden sm:inline">
            NeuroCode AI
          </span>
        </Link>

        <nav
          className="flex items-center gap-1 sm:gap-2 ml-auto sm:ml-4 flex-1 sm:flex-initial justify-end sm:justify-start min-w-0"
          aria-label="IA"
        >
          <Link
            href="/gerar"
            className={cn(linkClass, pathname === "/gerar" ? active : inactive)}
          >
            <Sparkles className="w-4 h-4 shrink-0" aria-hidden />
            <span className="truncate max-w-[9rem] sm:max-w-none">{t("sidebar", "generateIa")}</span>
          </Link>
          <Link
            href="/chat-ia"
            className={cn(linkClass, pathname === "/chat-ia" ? active : inactive)}
          >
            <MessageSquare className="w-4 h-4 shrink-0" aria-hidden />
            <span className="truncate max-w-[7rem] sm:max-w-none">{t("sidebar", "chatIa")}</span>
          </Link>
        </nav>

        <div className="flex items-center gap-2 shrink-0 ml-1 sm:ml-2">
          <LanguageSwitcher />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
