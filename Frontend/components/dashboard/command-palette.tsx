"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  FolderCode,
  Settings,
  CreditCard,
  BookOpen,
  Wand2,
  MessageSquare,
  Plus,
  ArrowRight,
  Command,
  Globe,
  Smartphone,
  Zap,
  LayoutDashboard as DashIcon,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  group: string;
  keywords?: string;
}

export function CommandPalette() {
  const { language } = useLanguage();
  const lang = (language as "pt" | "en" | "es" | "fr") ?? "pt";
  const ui = {
    pt: { nav: "Navegação", create: "Criar projeto", actions: "Ações", placeholder: "Buscar ações, páginas, projetos...", noResults: "Nenhum resultado para", navigate: "navegar", open: "abrir", close: "fechar" },
    en: { nav: "Navigation", create: "Create project", actions: "Actions", placeholder: "Search actions, pages, projects...", noResults: "No results for", navigate: "navigate", open: "open", close: "close" },
    es: { nav: "Navegación", create: "Crear proyecto", actions: "Acciones", placeholder: "Buscar acciones, páginas, proyectos...", noResults: "Sin resultados para", navigate: "navegar", open: "abrir", close: "cerrar" },
    fr: { nav: "Navigation", create: "Créer projet", actions: "Actions", placeholder: "Rechercher actions, pages, projets...", noResults: "Aucun résultat pour", navigate: "naviguer", open: "ouvrir", close: "fermer" },
  }[lang];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(0);
  const flatListRef = useRef<CommandItem[]>([]);
  const router = useRouter();

  const nav = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
      setQuery("");
      setSelected(0);
    },
    [router]
  );

  const COMMANDS: CommandItem[] = [
    {
      id: "dash",
      label: "Dashboard",
      description: "Ir ao painel principal",
      icon: LayoutDashboard,
      action: () => nav("/dashboard"),
      group: ui.nav,
      keywords: "home início principal",
    },
    {
      id: "projects",
      label: "Meus Projetos",
      description: "Ver todos os projetos",
      icon: FolderCode,
      action: () => nav("/projects"),
      group: ui.nav,
      keywords: "lista projetos historico",
    },
    {
      id: "tutorials",
      label: "Tutoriais",
      description: "Aprenda a usar o NeuroCode",
      icon: BookOpen,
      action: () => nav("/tutorials"),
      group: ui.nav,
    },
    {
      id: "settings",
      label: "Configurações",
      description: "Perfil e preferências",
      icon: Settings,
      action: () => nav("/settings"),
      group: ui.nav,
      keywords: "perfil conta preferencias",
    },
    {
      id: "billing",
      label: "Assinatura",
      description: "Planos e pagamento",
      icon: CreditCard,
      action: () => nav("/settings/billing"),
      group: ui.nav,
      keywords: "plano pagamento upgrade premium",
    },
    {
      id: "new-site",
      label: "Criar Site",
      description: "Gerar um site completo com IA",
      icon: Globe,
      action: () => nav("/gerar?type=website"),
      group: ui.create,
      keywords: "site website web",
    },
    {
      id: "new-app",
      label: "Criar App Mobile",
      description: "Gerar app React Native",
      icon: Smartphone,
      action: () => nav("/gerar?type=mobile"),
      group: ui.create,
      keywords: "mobile aplicativo ios android",
    },
    {
      id: "new-saas",
      label: "Criar SaaS",
      description: "Plataforma SaaS completa",
      icon: Zap,
      action: () => nav("/gerar?type=saas"),
      group: ui.create,
      keywords: "saas plataforma software",
    },
    {
      id: "new-dash",
      label: "Criar Dashboard",
      description: "Painel analítico com gráficos",
      icon: DashIcon,
      action: () => nav("/gerar?type=dashboard"),
      group: ui.create,
      keywords: "dashboard analytics painel",
    },
    {
      id: "generate",
      label: "Gerar com IA",
      description: "Abrir o gerador de projetos",
      icon: Wand2,
      action: () => nav("/gerar"),
      group: ui.actions,
      keywords: "gerar criar ia inteligencia artificial",
    },
    {
      id: "chat",
      label: "Chat IA",
      description: "Conversar com o assistente",
      icon: MessageSquare,
      action: () => nav("/chat-ia"),
      group: ui.actions,
      keywords: "chat conversa assistente",
    },
    {
      id: "new-project",
      label: "Novo Projeto",
      description: "Iniciar um novo projeto",
      icon: Plus,
      action: () => nav("/gerar"),
      group: ui.actions,
      keywords: "novo criar adicionar",
    },
  ];

  const filtered = query.trim()
    ? COMMANDS.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.label.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.keywords?.toLowerCase().includes(q) ||
          c.group.toLowerCase().includes(q)
        );
      })
    : COMMANDS;

  // Group results
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    (acc[item.group] = acc[item.group] || []).push(item);
    return acc;
  }, {});

  // Flatten for keyboard nav
  const flatList = filtered;

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    flatListRef.current = flatList;
  }, [flatList]);

  useEffect(() => {
    const openFromDashboard = () => {
      setOpen(true);
      setQuery("");
      setSelected(0);
    };
    window.addEventListener("neurocode:open-command-palette", openFromDashboard);
    return () => window.removeEventListener("neurocode:open-command-palette", openFromDashboard);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
        setSelected(0);
      }
      if (!open) return;
      const panel = panelRef.current;
      if (e.key === "Tab" && panel) {
        const focusables = Array.from(
          panel.querySelectorAll<HTMLElement>("button, input, [href], select, textarea")
        ).filter((el) => !el.hasAttribute("disabled"));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey) {
          if (active === first) {
            e.preventDefault();
            last.focus();
          }
        } else if (active === last) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setSelected(0);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, Math.max(flatListRef.current.length - 1, 0)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const item = flatListRef.current[selectedRef.current];
        item?.action();
        setOpen(false);
        setQuery("");
        setSelected(0);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  return (
    <>
      {/* Trigger hint in sidebar (handled via keyboard only — shown in sidebar collapse button area) */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setOpen(false);
                setQuery("");
                setSelected(0);
              }}
            />

            <motion.div
              className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-xl z-[101] px-4"
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.18 }}
            >
              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={ui.placeholder}
                className="rounded-2xl border border-ink-15 overflow-hidden shadow-2xl shadow-ink/[0.10] bg-cream"
              >
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-ink-15">
                  <Search className="w-4 h-4 text-ink-35 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelected(0);
                    }}
                    placeholder={ui.placeholder}
                    className="flex-1 bg-transparent text-ink placeholder-ink-35 text-sm outline-none"
                  />
                  <kbd className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-ink/[0.05] border border-ink-15 text-ink-35 text-xs">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[360px] overflow-y-auto py-2">
                  {filtered.length === 0 ? (
                    <p className="text-center text-ink-35 text-sm py-8">
                      {ui.noResults} &ldquo;{query}&rdquo;
                    </p>
                  ) : (
                    Object.entries(grouped).map(([group, items]) => (
                      <div key={group}>
                        <p className="px-4 py-1.5 text-xs text-ink-35 font-medium uppercase tracking-wider">
                          {group}
                        </p>
                        {items.map((item) => {
                          const globalIdx = flatList.indexOf(item);
                          const isSelected = globalIdx === selected;
                          return (
                            <button
                              key={item.id}
                              onMouseEnter={() => setSelected(globalIdx)}
                              onClick={() => {
                                item.action();
                                setOpen(false);
                                setQuery("");
                                setSelected(0);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                isSelected
                                  ? "bg-gold/[0.10] text-ink"
                                  : "text-ink-60 hover:text-ink"
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  isSelected
                                    ? "bg-gold/[0.15] border border-gold/30"
                                    : "bg-ink/[0.04] border border-ink-15"
                                }`}
                              >
                                <item.icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-none">
                                  {item.label}
                                </p>
                                {item.description && (
                                  <p className="text-xs text-ink-35 mt-0.5 truncate">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {isSelected && (
                                <ArrowRight className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-ink-15 flex items-center gap-4 text-xs text-ink-35">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-ink/[0.05] border border-ink-15">↑↓</kbd>
                    {ui.navigate}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-ink/[0.05] border border-ink-15">↵</kbd>
                    {ui.open}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-ink/[0.05] border border-ink-15">
                      <Command className="w-2.5 h-2.5 inline" />K
                    </kbd>
                    {ui.close}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
