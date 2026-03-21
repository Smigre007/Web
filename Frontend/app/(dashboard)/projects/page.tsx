"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  ChevronDown,
  Globe,
  MoreHorizontal,
  Copy,
  Trash2,
  ExternalLink,
  Loader2,
  FolderOpen,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  SortAsc,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { formatRelativeTime, PROJECT_TYPE_LABELS, PROJECT_TYPE_ICONS } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────── */

interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  tech_stack: string[];
  created_at: string;
  updated_at: string;
}

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

/* ─── Constants ──────────────────────────────────────────── */

const TYPE_CHIPS = [
  { value: "all", label: "Todos" },
  { value: "website", label: "Website" },
  { value: "webapp", label: "Web App" },
  { value: "mobile", label: "Mobile" },
  { value: "saas", label: "SaaS" },
  { value: "landing", label: "Landing" },
  { value: "dashboard", label: "Dashboard" },
  { value: "api", label: "API" },
  { value: "automation", label: "Automation" },
  { value: "platform", label: "Platform" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Todos os status" },
  { value: "completed", label: "Concluído" },
  { value: "generating", label: "Gerando" },
  { value: "error", label: "Erro" },
  { value: "draft", label: "Rascunho" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
  { value: "name_asc", label: "Nome A-Z" },
  { value: "name_desc", label: "Nome Z-A" },
];

const TYPE_BADGE_COLORS: Record<string, string> = {
  website: "#b8965a",
  webapp: "#8b7355",
  saas: "#6b5a3e",
  landing: "#d4b07a",
  dashboard: "#c4a882",
  api: "#141210",
  mobile: "#3d5a3e",
  automation: "#5a3d3d",
  platform: "#3d3d5a",
};

const PAGE_SIZE = 12;

/* ─── Badge helpers ──────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium whitespace-nowrap">
          Concluído
        </span>
      );
    case "generating":
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium whitespace-nowrap">
          <Loader2 className="w-2.5 h-2.5 animate-spin" />
          Gerando
        </span>
      );
    case "error":
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-medium whitespace-nowrap">
          <AlertCircle className="w-2.5 h-2.5" />
          Erro
        </span>
      );
    default:
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200 font-medium whitespace-nowrap">
          Rascunho
        </span>
      );
  }
}

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_BADGE_COLORS[type] ?? "#8b7355";
  const label = PROJECT_TYPE_LABELS[type] ?? type;
  const icon = PROJECT_TYPE_ICONS[type] ?? "📁";
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
      style={{
        backgroundColor: `${color}18`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      <span className="text-[10px] leading-none">{icon}</span>
      {label}
    </span>
  );
}

/* ─── Sort helper ────────────────────────────────────────── */

function sortProjects(projects: Project[], sort: SortOption): Project[] {
  return [...projects].sort((a, b) => {
    switch (sort) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "name_asc":
        return a.name.localeCompare(b.name, "pt-BR");
      case "name_desc":
        return b.name.localeCompare(a.name, "pt-BR");
    }
  });
}

/* ─── Skeleton card ──────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-ink-15 bg-cream-2 p-5 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-5 w-20 bg-ink/[0.08] rounded-full" />
        <div className="h-5 w-16 bg-ink/[0.05] rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-ink/[0.08] rounded-lg mb-2" />
      <div className="h-3 w-full bg-ink/[0.05] rounded mb-1" />
      <div className="h-3 w-2/3 bg-ink/[0.05] rounded mb-4" />
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 w-12 bg-ink/[0.05] rounded-full" />
        <div className="h-5 w-16 bg-ink/[0.05] rounded-full" />
        <div className="h-5 w-10 bg-ink/[0.05] rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-ink-15">
        <div className="h-3 w-20 bg-ink/[0.05] rounded" />
        <div className="flex gap-1">
          <div className="h-7 w-7 bg-ink/[0.05] rounded-lg" />
          <div className="h-7 w-7 bg-ink/[0.05] rounded-lg" />
          <div className="h-7 w-7 bg-ink/[0.05] rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/* ─── ProjectCard (grid view) ────────────────────────────── */

function ProjectCard({
  project,
  onDelete,
  onDuplicate,
}: {
  project: Project;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="rounded-2xl border border-ink-15 bg-cream hover:border-gold/40 hover:shadow-md transition-all p-5 group cursor-pointer relative flex flex-col gap-3"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      {/* Top: type badge + status badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <TypeBadge type={project.type} />
        <StatusBadge status={project.status} />
      </div>

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-ink text-base leading-tight line-clamp-1 mb-1">
          {project.name}
        </h3>
        {project.description && (
          <p className="text-xs text-ink-35 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      {/* Tech stack pills */}
      {project.tech_stack && project.tech_stack.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {project.tech_stack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-ink/[0.04] text-ink-35 border border-ink-15"
            >
              {tech}
            </span>
          ))}
          {project.tech_stack.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-ink/[0.04] text-ink-35 border border-ink-15">
              +{project.tech_stack.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Bottom: date + actions */}
      <div className="flex items-center justify-between pt-2 border-t border-ink-15">
        <span className="text-xs text-ink-35">{formatRelativeTime(project.created_at)}</span>

        {/* Action buttons – visible on hover */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Link href={`/projects/${project.id}`}>
            <button
              title="Abrir projeto"
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-ink-15 text-ink-35 hover:text-ink hover:border-ink/30 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </Link>
          <button
            title="Duplicar projeto"
            onClick={() => onDuplicate(project.id)}
            className="h-7 w-7 flex items-center justify-center rounded-lg border border-ink-15 text-ink-35 hover:text-ink hover:border-ink/30 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <div className="relative">
            <button
              title="Mais opções"
              onClick={() => setMenuOpen((o) => !o)}
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-ink-15 text-ink-35 hover:text-ink hover:border-ink/30 transition-colors"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-1 w-40 bg-cream border border-ink-15 rounded-xl shadow-md z-20 overflow-hidden">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(project.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir projeto
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── ProjectRow (list view) ─────────────────────────────── */

function ProjectRow({
  project,
  onDelete,
  onDuplicate,
}: {
  project: Project;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-b border-ink-15 hover:bg-gold/[0.03] transition-colors cursor-pointer group"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base flex-shrink-0">{PROJECT_TYPE_ICONS[project.type] ?? "📁"}</span>
          <span className="font-semibold text-ink text-sm line-clamp-1">{project.name}</span>
        </div>
      </td>
      <td className="py-3 px-4 hidden sm:table-cell">
        <TypeBadge type={project.type} />
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={project.status} />
      </td>
      <td className="py-3 px-4 hidden md:table-cell">
        <div className="flex flex-wrap gap-1">
          {(project.tech_stack ?? []).slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-ink/[0.04] text-ink-35 border border-ink-15"
            >
              {t}
            </span>
          ))}
          {(project.tech_stack?.length ?? 0) > 3 && (
            <span className="text-[10px] text-ink-35 self-center">
              +{project.tech_stack.length - 3}
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-xs text-ink-35 whitespace-nowrap hidden sm:table-cell">
        {formatRelativeTime(project.created_at)}
      </td>
      <td
        className="py-3 px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
          <Link href={`/projects/${project.id}`}>
            <button
              title="Abrir"
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-ink-15 text-ink-35 hover:text-ink hover:border-ink/30 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </Link>
          <button
            title="Duplicar"
            onClick={() => onDuplicate(project.id)}
            className="h-7 w-7 flex items-center justify-center rounded-lg border border-ink-15 text-ink-35 hover:text-ink hover:border-ink/30 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            title="Excluir"
            onClick={() => onDelete(project.id)}
            className="h-7 w-7 flex items-center justify-center rounded-lg border border-ink-15 text-red-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

/* ─── Empty State ────────────────────────────────────────── */

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-ink/[0.04] border border-ink-15 flex items-center justify-center mb-6">
        <FolderOpen className="w-9 h-9 text-ink-35" />
      </div>
      <h3 className="font-bold text-ink text-lg mb-2">
        {filtered ? "Nenhum projeto encontrado" : "Nenhum projeto ainda"}
      </h3>
      <p className="text-sm text-ink-35 max-w-xs mb-6 leading-relaxed">
        {filtered
          ? "Tente ajustar seus filtros ou termos de busca."
          : "Comece criando seu primeiro projeto gerado com IA."}
      </p>
      {!filtered && (
        <Link href="/gerar">
          <Button variant="default" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Criar primeiro projeto
          </Button>
        </Link>
      )}
    </motion.div>
  );
}

/* ─── Dropdown ───────────────────────────────────────────── */

function Dropdown<T extends string>({
  options,
  value,
  onChange,
  icon: Icon,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  icon: React.ElementType;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-ink-15 bg-cream text-ink-35 hover:text-ink hover:border-ink/30 transition-all"
      >
        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="hidden sm:inline">{label ?? selected?.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 top-full mt-1 w-48 bg-cream border border-ink-15 rounded-xl shadow-md z-30 overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                  value === opt.value
                    ? "bg-ink text-cream font-medium"
                    : "text-ink-35 hover:bg-ink/[0.05] hover:text-ink"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : data.projects ?? []);
    } catch {
      toast.error("Erro ao carregar projetos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    const s = searchParams.get("status");
    if (s === "generating" || s === "completed" || s === "error" || s === "draft") {
      setStatusFilter(s);
    }
  }, [searchParams]);

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita."
      )
    )
      return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Projeto excluído");
    } catch {
      toast.error("Erro ao excluir projeto");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setDuplicatingId(id);
    try {
      const res = await fetch(`/api/projects/${id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error("duplicate failed");
      const copy = await res.json();
      setProjects((prev) => [copy, ...prev]);
      toast.success("Projeto duplicado!");
    } catch {
      toast.error("Erro ao duplicar projeto");
    } finally {
      setDuplicatingId(null);
    }
  };

  // Filter + sort
  const filtered = sortProjects(
    projects.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);
      const matchType = typeFilter === "all" || p.type === typeFilter;
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    }),
    sort
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltered = search !== "" || typeFilter !== "all" || statusFilter !== "all";

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, statusFilter, sort]);

  const isBusy = deletingId !== null || duplicatingId !== null;

  return (
    <div className="min-h-full">
      {/* ── Page header ── */}
      <div className="px-6 py-6 border-b border-ink-15 bg-cream/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-ink tracking-tight">Meus Projetos</h1>
            <p className="text-sm text-ink-35 mt-0.5 flex items-center gap-2">
              Todos os seus projetos gerados com IA
              {!loading && projects.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-ink/[0.05] border border-ink-15 text-ink-35">
                  {projects.length} {projects.length === 1 ? "projeto" : "projetos"}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={fetchProjects}
              disabled={loading}
              title="Atualizar lista"
              className="h-9 w-9 flex items-center justify-center rounded-xl border border-ink-15 text-ink-35 hover:text-ink hover:border-ink/30 disabled:opacity-40 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Link href="/gerar">
              <Button size="sm" variant="default" className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Projeto</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="px-6 pt-4 pb-3 space-y-3">
        {/* Row 1: search + dropdowns + view toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-35 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-ink-15 bg-cream-2 text-ink placeholder:text-ink-35 outline-none focus:border-gold/50 focus:bg-cream transition-all"
            />
          </div>

          {/* Status filter */}
          <Dropdown
            options={STATUS_OPTIONS as { value: string; label: string }[]}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            icon={Filter}
            label={STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}
          />

          {/* Sort */}
          <Dropdown
            options={SORT_OPTIONS}
            value={sort}
            onChange={(v) => setSort(v as SortOption)}
            icon={SortAsc}
            label={SORT_OPTIONS.find((o) => o.value === sort)?.label}
          />

          {/* View toggle */}
          <div className="flex items-center gap-1 ml-auto p-1 bg-cream-2 rounded-xl border border-ink-15">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-cream shadow-sm text-ink"
                  : "text-ink-35 hover:text-ink"
              }`}
              title="Grade"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-cream shadow-sm text-ink"
                  : "text-ink-35 hover:text-ink"
              }`}
              title="Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Type chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <Globe className="w-3.5 h-3.5 text-ink-35 flex-shrink-0" />
          {TYPE_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setTypeFilter(chip.value)}
              className={`text-xs px-3 py-1 rounded-full border transition-all font-medium ${
                typeFilter === chip.value
                  ? "bg-ink text-cream border-ink"
                  : "bg-cream-2 border-ink-15 text-ink-35 hover:border-ink/30 hover:text-ink"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results summary ── */}
      {!loading && isFiltered && (
        <div className="px-6 pb-1 text-xs text-ink-35">
          {filtered.length === 0
            ? "Nenhum projeto encontrado"
            : `${filtered.length} ${filtered.length === 1 ? "projeto encontrado" : "projetos encontrados"}`}
        </div>
      )}

      {/* ── Content ── */}
      <div className="px-6 pb-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filtered={isFiltered} />
        ) : viewMode === "grid" ? (
          <AnimatePresence mode="popLayout">
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          /* List view */
          <div className="rounded-2xl border border-ink-15 bg-cream overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-15 bg-cream-2/60">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-ink-35 uppercase tracking-wide">
                    Nome
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-ink-35 uppercase tracking-wide hidden sm:table-cell">
                    Tipo
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-ink-35 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-ink-35 uppercase tracking-wide hidden md:table-cell">
                    Tech Stack
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-ink-35 uppercase tracking-wide hidden sm:table-cell">
                    Criado
                  </th>
                  <th className="py-3 px-4 w-28" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {paginated.map((project) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      onDelete={handleDelete}
                      onDuplicate={handleDuplicate}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 flex items-center justify-center rounded-xl border border-ink-15 text-ink-35 hover:text-ink hover:border-ink/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                const isEllipsis = !show;
                if (isEllipsis) {
                  // show a single ellipsis per gap
                  if (i === 1 || i === totalPages - 2) {
                    return (
                      <span key={i} className="text-xs text-ink-35 px-1">
                        …
                      </span>
                    );
                  }
                  return null;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 flex items-center justify-center rounded-xl text-sm transition-all ${
                      page === p
                        ? "bg-ink text-cream font-semibold"
                        : "border border-ink-15 text-ink-35 hover:text-ink hover:border-ink/30"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded-xl border border-ink-15 text-ink-35 hover:text-ink hover:border-ink/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Busy overlay ── */}
      <AnimatePresence>
        {isBusy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/10 backdrop-blur-[2px] z-50 flex items-center justify-center"
          >
            <div className="bg-cream rounded-2xl border border-ink-15 px-6 py-4 flex items-center gap-3 shadow-xl">
              <Loader2 className="w-5 h-5 animate-spin text-gold" />
              <span className="text-sm font-medium text-ink">
                {deletingId ? "Excluindo projeto…" : "Duplicando projeto…"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
