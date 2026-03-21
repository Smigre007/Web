"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  LayoutDashboard,
  FolderCode,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CreditCard,
  BookOpen,
  Menu,
  X,
  Command,
  Crown,
  ShieldCheck,
  Gift,
  Plug,
  Home,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { modifierPlusKLabel } from "@/lib/keyboard-hint";
import { useLanguage } from "@/context/language-context";

interface Usage {
  plan: string;
  generations_used: number;
  generations_limit: number;
  percent: number;
  is_admin?: boolean;
}

function SidebarContent({
  collapsed,
  onClose,
}: {
  collapsed: boolean;
  onClose?: () => void;
}) {
  const [usage, setUsage] = useState<Usage | null>(null);
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const lang = (language as "pt" | "en" | "es" | "fr") ?? "pt";

  const ui = {
    pt: { integrations: "Integrações", backToSite: "Voltar ao site", quickSearch: "Busca rápida", generations: "Gerações", upgrade: "Upgrade", myAccount: "Minha Conta", openQuickSearch: "Abrir busca rápida", newProject: "Novo Projeto", upgradeNearLimit: "Limite próximo — Upgrade" },
    en: { integrations: "Integrations", backToSite: "Back to site", quickSearch: "Quick search", generations: "Generations", upgrade: "Upgrade", myAccount: "My Account", openQuickSearch: "Open quick search", newProject: "New Project", upgradeNearLimit: "Near limit — Upgrade" },
    es: { integrations: "Integraciones", backToSite: "Volver al sitio", quickSearch: "Búsqueda rápida", generations: "Generaciones", upgrade: "Mejorar plan", myAccount: "Mi Cuenta", openQuickSearch: "Abrir búsqueda rápida", newProject: "Nuevo Proyecto", upgradeNearLimit: "Cerca del límite — Mejorar" },
    fr: { integrations: "Intégrations", backToSite: "Retour au site", quickSearch: "Recherche rapide", generations: "Générations", upgrade: "Upgrade", myAccount: "Mon Compte", openQuickSearch: "Ouvrir la recherche rapide", newProject: "Nouveau Projet", upgradeNearLimit: "Limite proche — Upgrade" },
  }[lang];

  const isAdmin = usage?.is_admin ?? false;

  const NAV_ITEMS = [
    { icon: LayoutDashboard, label: t("sidebar", "dashboard"),  href: "/dashboard",             adminOnly: false },
    { icon: Sparkles,        label: t("sidebar", "generateIa"), href: "/gerar",                 adminOnly: false },
    { icon: MessageSquare,   label: t("sidebar", "chatIa"),      href: "/chat-ia",               adminOnly: false },
    { icon: FolderCode,      label: t("sidebar", "projects"),   href: "/projects",              adminOnly: false },
    { icon: BookOpen,        label: t("sidebar", "tutorials"),  href: "/tutorials",             adminOnly: false },
    { icon: Gift,            label: t("sidebar", "referrals"),  href: "/referrals",             adminOnly: false },
    { icon: Plug,            label: ui.integrations,             href: "/settings/integrations", adminOnly: false },
    { icon: CreditCard,      label: t("sidebar", "billing"),    href: "/settings/billing",      adminOnly: false },
    { icon: Settings,        label: t("sidebar", "settings"),   href: "/settings",              adminOnly: false },
    { icon: ShieldCheck,     label: t("sidebar", "admin"),      href: "/admin",                 adminOnly: true },
  ];

  useEffect(() => {
    let mounted = true;
    fetch("/api/user/usage")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (mounted && d) setUsage(d); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const pct = Math.min(usage?.percent ?? 0, 100);

  return (
    <div className="flex flex-col h-full">
      {/* ── Logo ── */}
      <div className={cn("flex items-center gap-3 px-5 py-5 flex-shrink-0", collapsed && "justify-center px-3")}>
        <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center flex-shrink-0">
          <Brain className="w-4 h-4 text-gold" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex-1 min-w-0">
            <span className="font-black text-sm text-cream tracking-tight">NeuroCode</span>
            <span className="font-black text-sm text-gold tracking-tight"> AI</span>
          </motion.div>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto flex-shrink-0 p-1.5 rounded-lg text-cream/55 hover:text-cream hover:bg-cream/[0.06] transition-all">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Back to site ── */}
      <div className={cn("px-3 pb-3 flex-shrink-0", collapsed && "flex justify-center")}>
        <Link
          href="/"
          onClick={onClose}
          title={ui.backToSite}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-cream/50 hover:text-cream/85 hover:bg-cream/[0.05] transition-all text-xs font-mono",
            collapsed ? "justify-center" : "w-full"
          )}
        >
          <Home className="w-3.5 h-3.5 flex-shrink-0" />
          {!collapsed && <span className="truncate">{ui.backToSite}</span>}
        </Link>
      </div>

      {/* ── New project CTA ── */}
      <div className={cn("px-3 pb-4 flex-shrink-0", collapsed && "flex justify-center")}>
        <Link href="/gerar" onClick={onClose} className={cn("flex items-center gap-2 rounded-lg bg-gold text-ink px-3 py-2 text-xs font-bold hover:bg-gold-lt transition-colors shadow-sm shadow-gold/20", collapsed ? "justify-center w-10 h-10 p-0 rounded-lg" : "w-full")}>
          <Plus className="w-3.5 h-3.5 flex-shrink-0" />
          {!collapsed && <span>{ui.newProject}</span>}
        </Link>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 border-t border-cream/[0.06] mb-3 flex-shrink-0" />

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <div
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group",
                  isActive
                    ? "text-cream bg-cream/[0.08]"
                    : "text-cream/60 hover:text-cream/90 hover:bg-cream/[0.04]",
                  collapsed && "justify-center px-2"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-gold" />
                )}
                <item.icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", isActive ? "text-gold" : "text-cream/55 group-hover:text-cream/85")} />
                {!collapsed && (
                  <span className="text-sm font-medium truncate flex-1 min-w-0">{item.label}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom section ── */}
      <div className="flex-shrink-0 mt-4">
        {/* Cmd+K */}
        {!collapsed && (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("neurocode:open-command-palette"))}
            aria-label={ui.openQuickSearch}
            className="mx-3 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg border border-cream/[0.06] bg-cream/[0.03] hover:border-cream/[0.1] hover:bg-cream/[0.06] transition-all group w-[calc(100%-1.5rem)]"
          >
            <Command className="w-3.5 h-3.5 text-cream/45 group-hover:text-cream/70" />
            <span className="text-xs text-cream/45 group-hover:text-cream/70 flex-1 text-left font-mono">{ui.quickSearch}</span>
            <kbd className="text-[10px] text-cream/45 font-mono">{modifierPlusKLabel()}</kbd>
          </button>
        )}

        {/* Usage bar */}
        {!collapsed && (
          <div className="mx-3 mb-3 p-3 rounded-lg border border-cream/[0.07] bg-cream/[0.03]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-gold/80" />
                <span className="text-[11px] text-cream/65 font-mono">{ui.generations}</span>
              </div>
              <span className="text-[11px] text-cream/55 font-mono tabular-nums">
                {usage ? `${usage.generations_used}/${usage.generations_limit}` : "–/–"}
              </span>
            </div>
            <div className="h-1 rounded-full bg-cream/[0.08] overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", pct >= 90 ? "bg-red-400" : pct >= 70 ? "bg-amber-400" : "bg-gold")}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[10px] text-cream/35 capitalize font-mono">{usage?.plan ?? "free"}</p>
              {usage && usage.percent >= 75 && (
                <Link href="/settings/billing" onClick={onClose} className="flex items-center gap-1 text-[10px] text-gold hover:text-gold-lt font-medium">
                  <Crown className="w-2.5 h-2.5" />
                  {ui.upgrade}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Collapsed upgrade dot */}
        {collapsed && usage && usage.percent >= 75 && (
          <Link href="/settings/billing" onClick={onClose} className="mx-auto mb-3 flex items-center justify-center w-10 h-10 rounded-lg border border-gold/25 bg-gold/[0.08] hover:bg-gold/[0.14] transition-all" title={ui.upgradeNearLimit}>
            <Crown className="w-4 h-4 text-gold" />
          </Link>
        )}

        {/* Divider */}
        <div className="mx-4 border-t border-cream/[0.06] mb-3" />

        {/* User */}
        <div className={cn("px-4 pb-4 flex items-center gap-3", collapsed && "justify-center")}>
          <UserButton appearance={{ elements: { avatarBox: "w-7 h-7 rounded-lg" } }} />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs text-cream/55 font-medium truncate">{ui.myAccount}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 border-b border-ink-15 bg-cream/95 backdrop-blur-sm">
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-ink-35 hover:text-ink hover:bg-ink/[0.05] transition-all">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-ink flex items-center justify-center">
            <Brain className="w-4 h-4 text-gold" />
          </div>
          <span className="font-black text-ink text-sm">NeuroCode <span className="text-gold">AI</span></span>
        </div>
        <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 rounded-lg" } }} />
      </div>

      <div className="md:hidden h-14 flex-shrink-0" />

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[60] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-64 z-[61] flex flex-col bg-ink md:hidden overflow-hidden"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <SidebarContent collapsed={false} onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ── */}
      <motion.aside
        initial={{ width: 220 }}
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="relative z-30 hidden md:flex h-screen sticky top-0 flex-shrink-0 flex-col bg-ink border-r border-cream/[0.06]"
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SidebarContent collapsed={collapsed} />
        </div>

        {/* Collapse toggle — fica metade fora da coluna; z-index + sem overflow no aside evita corte e overlap do main */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className="absolute top-1/2 right-0 z-40 flex h-8 w-8 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-cream/25 bg-ink shadow-md shadow-ink/40 hover:border-gold/50 hover:bg-gold/10 transition-all"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-cream/80" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 text-cream/80" />
          )}
        </button>
      </motion.aside>
    </>
  );
}
