"use client";

import { useEffect, useState, useCallback } from "react";
import { FolderOpen, Loader2 } from "lucide-react";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

export function buildProjectContextLabel(project: Project, typeLabel: string): string {
  return `Projeto: ${project.name}\nDescrição: ${project.description ?? ""}\nTipo: ${typeLabel}\nTech stack: ${(project.tech_stack ?? []).join(", ")}`;
}

type Lang = "pt" | "en" | "es" | "fr";

const COPY: Record<
  Lang,
  { label: string; none: string; loading: string; error: string; openProject: string }
> = {
  pt: {
    label: "Projeto (opcional)",
    none: "Nenhum projeto",
    loading: "A carregar…",
    error: "Não foi possível carregar projetos",
    openProject: "Abrir projeto",
  },
  en: {
    label: "Project (optional)",
    none: "No project",
    loading: "Loading…",
    error: "Could not load projects",
    openProject: "Open project",
  },
  es: {
    label: "Proyecto (opcional)",
    none: "Sin proyecto",
    loading: "Cargando…",
    error: "No se pudieron cargar los proyectos",
    openProject: "Abrir proyecto",
  },
  fr: {
    label: "Projet (optionnel)",
    none: "Aucun projet",
    loading: "Chargement…",
    error: "Impossible de charger les projets",
    openProject: "Ouvrir le projet",
  },
};

const TYPE_LABELS: Record<Lang, Record<string, string>> = {
  pt: {
    website: "Site",
    landing: "Landing",
    webapp: "App Web",
    mobile: "Mobile",
    saas: "SaaS",
    dashboard: "Dashboard",
    api: "API",
    automation: "Automação",
    platform: "Plataforma",
  },
  en: {
    website: "Website",
    landing: "Landing",
    webapp: "Web app",
    mobile: "Mobile",
    saas: "SaaS",
    dashboard: "Dashboard",
    api: "API",
    automation: "Automation",
    platform: "Platform",
  },
  es: {
    website: "Sitio",
    landing: "Landing",
    webapp: "App web",
    mobile: "Móvil",
    saas: "SaaS",
    dashboard: "Dashboard",
    api: "API",
    automation: "Automatización",
    platform: "Plataforma",
  },
  fr: {
    website: "Site",
    landing: "Landing",
    webapp: "App web",
    mobile: "Mobile",
    saas: "SaaS",
    dashboard: "Dashboard",
    api: "API",
    automation: "Automatisation",
    platform: "Plateforme",
  },
};

export interface ProjectPickerProps {
  lang: Lang;
  value: string | null;
  onChange: (projectId: string | null, context: string, project: Project | null) => void;
  className?: string;
  /** Compact single row */
  dense?: boolean;
}

export function ProjectPicker({ lang, value, onChange, className, dense }: ProjectPickerProps) {
  const t = COPY[lang] ?? COPY.pt;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/projects?limit=50");
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setFetchError(typeof j.error === "string" ? j.error : t.error);
        setProjects([]);
        return;
      }
      const data = (await res.json()) as Project[];
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setFetchError(t.error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [t.error]);

  useEffect(() => {
    load();
  }, [load]);

  const typeLabel = (p: Project) => TYPE_LABELS[lang]?.[p.type] ?? p.type;

  const handleSelect = (id: string) => {
    if (id === "") {
      onChange(null, "", null);
      return;
    }
    const p = projects.find((x) => x.id === id);
    if (!p) {
      onChange(null, "", null);
      return;
    }
    onChange(p.id, buildProjectContextLabel(p, typeLabel(p)), p);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 min-w-0",
        dense ? "sm:flex-row sm:items-center sm:gap-3" : "",
        className
      )}
    >
      <div className="flex items-center gap-2 text-ink-60 shrink-0">
        <FolderOpen className="w-4 h-4 text-ink-35" aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wide">{t.label}</span>
      </div>
      <div className="flex flex-1 min-w-0 items-center gap-2">
        {loading ? (
          <span className="inline-flex items-center gap-2 text-xs text-ink-35">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {t.loading}
          </span>
        ) : (
          <>
            <label htmlFor="ai-project-picker" className="sr-only">
              {t.label}
            </label>
            <select
              id="ai-project-picker"
              value={value ?? ""}
              onChange={(e) => handleSelect(e.target.value)}
              className={cn(
                "flex-1 min-w-0 rounded-xl border border-ink-15 bg-cream-2 px-3 py-2 text-sm text-ink outline-none",
                "focus-visible:ring-2 focus-visible:ring-gold/30",
                fetchError && "border-amber-500/40"
              )}
            >
              <option value="">{t.none}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {value && (
              <a
                href={`/projects/${value}`}
                className="shrink-0 text-xs font-medium text-gold hover:underline whitespace-nowrap"
              >
                {t.openProject}
              </a>
            )}
          </>
        )}
      </div>
      {fetchError && !loading && (
        <p className="text-[11px] text-amber-700/90">{fetchError}</p>
      )}
    </div>
  );
}
