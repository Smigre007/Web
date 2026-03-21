"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Eye,
  Code2,
  MessageSquare,
  Download,
  Share2,
  Sparkles,
  Clock,
  CheckCircle2,
  Check,
  Loader2,
  AlertTriangle,
  FileCode2,
  Pencil,
  X,
  History,
  Trash2,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Copy,
  File,
  FileJson,
  FileType,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, PROJECT_TYPE_LABELS, PROJECT_TYPE_ICONS } from "@/lib/utils";
import { VersionHistory } from "@/components/dashboard/version-history";

/* ─── Dynamic imports ────────────────────────────────────── */

const AIChat = dynamic(
  () => import("@/components/ai/ai-chat").then((m) => m.AIChat),
  { ssr: false }
);

/* ─── Types ──────────────────────────────────────────────── */

interface ProjectFile {
  path: string;
  language: string;
  description?: string;
  content: string;
}

interface GeneratedCode {
  files?: ProjectFile[];
  preview_html?: string;
  summary?: string;
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  tech_stack?: string[];
  created_at: string;
  updated_at?: string;
  generated_code?: GeneratedCode;
}

type TabId = "preview" | "code" | "chat" | "history";
type DeviceMode = "desktop" | "tablet" | "mobile";

/* ─── Constants ──────────────────────────────────────────── */

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

/* ─── File icon helper ────────────────────────────────────── */

function FileIcon({ path }: { path: string }) {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const classes = "w-3.5 h-3.5 flex-shrink-0";
  if (["ts", "tsx", "js", "jsx"].includes(ext))
    return <FileCode2 className={`${classes} text-blue-400`} />;
  if (["json"].includes(ext)) return <FileJson className={`${classes} text-yellow-400`} />;
  if (["css", "scss", "sass"].includes(ext))
    return <FileType className={`${classes} text-pink-400`} />;
  if (["html"].includes(ext)) return <FileCode2 className={`${classes} text-orange-400`} />;
  if (path.includes("/") && !ext) return <Folder className={`${classes} text-gold`} />;
  return <File className={`${classes} text-ink-35`} />;
}

/* ─── Status badge ───────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
          <CheckCircle2 className="w-3 h-3" />
          Concluído
        </span>
      );
    case "generating":
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
          <Loader2 className="w-3 h-3 animate-spin" />
          Gerando
        </span>
      );
    case "error":
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-medium">
          <AlertTriangle className="w-3 h-3" />
          Erro
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200 font-medium">
          <Clock className="w-3 h-3" />
          Rascunho
        </span>
      );
  }
}

/* ─── Preview Tab ────────────────────────────────────────── */

function PreviewTab({ html }: { html: string }) {
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [key, setKey] = useState(0);

  const devices: { id: DeviceMode; label: string; icon: React.ElementType }[] = [
    { id: "desktop", label: "Desktop", icon: Monitor },
    { id: "tablet", label: "Tablet", icon: Tablet },
    { id: "mobile", label: "Mobile", icon: Smartphone },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-ink-15 flex-shrink-0">
        <div className="flex items-center gap-1 p-1 bg-cream-2 rounded-xl border border-ink-15">
          {devices.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setDevice(id)}
              title={label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                device === id
                  ? "bg-cream shadow-sm text-ink"
                  : "text-ink-35 hover:text-ink"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setKey((k) => k + 1)}
          title="Recarregar preview"
          className="h-8 w-8 flex items-center justify-center rounded-xl border border-ink-15 text-ink-35 hover:text-ink hover:border-ink/30 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* iframe area */}
      <div className="flex-1 overflow-auto bg-[#e8e4dd] flex items-start justify-center p-6">
        <div
          className="bg-cream border border-ink-15 rounded-2xl shadow-md overflow-hidden transition-all duration-300"
          style={{ width: DEVICE_WIDTHS[device], minHeight: "100%" }}
        >
          <iframe
            key={key}
            srcDoc={html}
            className="w-full border-0"
            style={{ height: "calc(100vh - 280px)", minHeight: "400px" }}
            sandbox="allow-scripts allow-same-origin"
            title="Project preview"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Code Tab (editável) ───────────────────────────────── */

function CodeTab({
  files,
  selectedIndex,
  onSelectIndex,
  onChangeContent,
  onSave,
  saving,
  dirty,
}: {
  files: ProjectFile[];
  selectedIndex: number;
  onSelectIndex: (i: number) => void;
  onChangeContent: (index: number, content: string) => void;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const selected = files[selectedIndex];

  const handleCopy = useCallback(async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.content);
    setCopied(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopied(false), 2000);
  }, [selected]);

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-ink-35">
        <FileCode2 className="w-12 h-12 mb-3 opacity-40" />
        <p>Nenhum arquivo de código disponível</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center justify-end gap-2 px-4 pt-2 pb-1 shrink-0">
        <Button
          type="button"
          size="sm"
          variant={dirty ? "default" : "outline"}
          disabled={!dirty || saving}
          onClick={onSave}
          className="gap-1.5"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pencil className="w-3.5 h-3.5" />}
          {saving ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
      <div className="h-full flex gap-4 p-4 pt-1 min-h-0">
        {/* File tree */}
        <div className="w-1/3 min-w-[180px] max-w-[260px] flex flex-col bg-cream-2 rounded-xl border border-ink-15 overflow-hidden shrink-0">
          <div className="px-3 py-2 border-b border-ink-15 flex-shrink-0">
            <span className="text-xs font-semibold text-ink-35 uppercase tracking-wide">
              Arquivos ({files.length})
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {files.map((file, i) => (
              <button
                key={`${file.path}-${i}`}
                type="button"
                onClick={() => onSelectIndex(i)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${
                  selectedIndex === i
                    ? "bg-ink text-cream"
                    : "text-ink-35 hover:bg-ink/[0.06] hover:text-ink"
                }`}
              >
                <FileIcon path={file.path} />
                <span className="text-xs font-mono truncate">{file.path.split("/").pop()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-w-0 flex flex-col rounded-xl overflow-hidden border border-ink-15 min-h-0">
          <div className="flex items-center justify-between px-4 py-2 bg-[#1a1712] border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <FileIcon path={selected?.path ?? ""} />
              <span className="text-xs font-mono text-cream/70 truncate">{selected?.path}</span>
              {selected?.language && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-cream/50 uppercase tracking-wide shrink-0">
                  {selected.language}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-cream/50 hover:text-cream/80 hover:bg-white/10 transition-colors shrink-0"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <textarea
            value={selected?.content ?? ""}
            onChange={(e) => onChangeContent(selectedIndex, e.target.value)}
            spellCheck={false}
            className="flex-1 min-h-[200px] w-full resize-none p-4 font-mono text-sm text-cream/90 bg-[#1a1712] leading-relaxed focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── ProjectEditor (main client component) ──────────────── */

export function ProjectEditor({ project: initialProject }: { project: ProjectData }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectData>(initialProject);
  const [activeTab, setActiveTab] = useState<TabId>("preview");
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(project.name);
  const [savingName, setSavingName] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [codeTabIndex, setCodeTabIndex] = useState(0);
  const [editedFiles, setEditedFiles] = useState<ProjectFile[]>(() =>
    (initialProject.generated_code?.files ?? []).map((f) => ({
      ...f,
      description: f.description ?? "",
    }))
  );
  const [codeDirty, setCodeDirty] = useState(false);
  const [savingCode, setSavingCode] = useState(false);

  useEffect(() => {
    setEditedFiles(
      (project.generated_code?.files ?? []).map((f) => ({
        ...f,
        description: f.description ?? "",
      }))
    );
    setCodeTabIndex(0);
    setCodeDirty(false);
    // Sincronizar após guardar/restaurar (updated_at); não incluir .files para não sobrescrever edições locais
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ver comentário acima
  }, [project.id, project.updated_at]);

  const files = editedFiles;
  const previewHtml = project.generated_code?.preview_html ?? "";
  const typeIcon = PROJECT_TYPE_ICONS[project.type] ?? "📁";
  const typeLabel = PROJECT_TYPE_LABELS[project.type] ?? project.type;

  /* ── Name editing ── */

  const startEditName = () => {
    setNameValue(project.name);
    setEditingName(true);
  };

  const saveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === project.name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        setProject((p) => ({ ...p, name: trimmed }));
        toast.success("Nome atualizado");
      } else {
        toast.error("Erro ao renomear projeto");
      }
    } catch {
      toast.error("Erro ao renomear projeto");
    } finally {
      setSavingName(false);
      setEditingName(false);
    }
  };

  /* ── Export ZIP ── */

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/export`);
      if (!res.ok) throw new Error("export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="(.+?)"/);
      a.download = match?.[1] ?? `projeto-${project.id}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Projeto exportado como ZIP!");
    } catch {
      toast.error("Erro ao exportar projeto");
    } finally {
      setExporting(false);
    }
  };

  /* ── Share ── */

  const handleShare = () => {
    const url = `${window.location.origin}/p/${project.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Delete ── */

  const handleFileContentChange = useCallback((index: number, content: string) => {
    setEditedFiles((prev) => {
      const next = [...prev];
      if (next[index]) next[index] = { ...next[index], content };
      return next;
    });
    setCodeDirty(true);
  }, []);

  const handleSaveCode = useCallback(async () => {
    setSavingCode(true);
    try {
      const prev = project.generated_code ?? {};
      const nextGenerated = {
        ...prev,
        files: editedFiles,
      };
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generated_code: nextGenerated as Record<string, unknown>,
          status: "completed",
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as ProjectData;
        setProject(data);
        setCodeDirty(false);
        toast.success("Alterações salvas");
        window.dispatchEvent(new Event("neurocode:dashboard-refresh"));
      } else {
        toast.error("Erro ao salvar alterações");
      }
    } catch {
      toast.error("Erro ao salvar alterações");
    } finally {
      setSavingCode(false);
    }
  }, [project.generated_code, project.id, editedFiles]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Tem certeza que deseja excluir "${project.name}"? Esta ação não pode ser desfeita.`
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      toast.success("Projeto excluído");
      router.push("/projects");
    } catch {
      toast.error("Erro ao excluir projeto");
      setDeleting(false);
    }
  };

  /* ── Tabs config ── */

  const tabs: {
    id: TabId;
    label: string;
    icon: React.ElementType;
    disabled?: boolean;
    count?: number;
  }[] = [
    {
      id: "preview",
      label: "Preview",
      icon: Eye,
      disabled: !previewHtml,
    },
    {
      id: "code",
      label: "Código",
      icon: Code2,
      disabled: files.length === 0,
      count: files.length > 0 ? files.length : undefined,
    },
    {
      id: "chat",
      label: "Refinar com IA",
      icon: MessageSquare,
    },
    {
      id: "history",
      label: "Histórico",
      icon: History,
    },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-cream/30">
      {/* ── Sticky header ── */}
      <header className="bg-cream border-b border-ink-15 px-6 py-4 sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          {/* Left: back + name + badges */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="gap-1.5 text-ink-35 hover:text-ink flex-shrink-0">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Projetos</span>
              </Button>
            </Link>
            <div className="h-5 w-px bg-ink-15 flex-shrink-0" />

            {/* Editable name */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl flex-shrink-0">{typeIcon}</span>
              {editingName ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                    onBlur={saveName}
                    className="font-black text-ink text-lg bg-ink/[0.05] border border-gold/50 rounded-lg px-2 py-0.5 outline-none focus:border-gold min-w-0 max-w-[200px] sm:max-w-[320px]"
                  />
                  <button
                    onMouseDown={(e) => { e.preventDefault(); saveName(); }}
                    disabled={savingName}
                    className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition-colors flex-shrink-0"
                  >
                    {savingName ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); setEditingName(false); }}
                    className="p-1 rounded text-ink-35 hover:text-ink hover:bg-ink/[0.05] transition-colors flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={startEditName}
                  title="Clique para renomear"
                  className="group flex items-center gap-1.5 text-left min-w-0"
                >
                  <h1 className="font-black text-ink text-lg truncate max-w-[180px] sm:max-w-[300px]">
                    {project.name}
                  </h1>
                  <Pencil className="w-3.5 h-3.5 text-transparent group-hover:text-ink-35 transition-colors flex-shrink-0" />
                </button>
              )}
            </div>

            {/* Badges + meta */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={project.status} />
              <span className="text-xs text-ink-35 bg-ink/[0.04] border border-ink-15 px-2 py-0.5 rounded-full">
                {typeLabel}
              </span>
              <span className="text-xs text-ink-35 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(project.created_at)}
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Tech stack pills (hidden on small) */}
            <div className="hidden lg:flex items-center gap-1 mr-2">
              {(project.tech_stack ?? []).slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded-full bg-ink/[0.04] text-ink-35 border border-ink-15"
                >
                  {t}
                </span>
              ))}
            </div>

            <button
              onClick={handleShare}
              title="Copiar link"
              className="h-8 px-3 flex items-center gap-1.5 rounded-xl border border-ink-15 text-xs text-ink-35 hover:text-ink hover:border-ink/30 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? "Copiado!" : "Compartilhar"}</span>
            </button>

            <button
              onClick={handleExport}
              disabled={exporting}
              title="Exportar ZIP"
              className="h-8 px-3 flex items-center gap-1.5 rounded-xl border border-ink-15 text-xs text-ink-35 hover:text-ink hover:border-ink/30 disabled:opacity-50 transition-colors"
            >
              {exporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{exporting ? "Exportando…" : "Exportar ZIP"}</span>
            </button>

            <Link href="/gerar" className="hidden md:block">
              <Button size="sm" variant="default" className="gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Novo
              </Button>
            </Link>

            <button
              onClick={handleDelete}
              disabled={deleting}
              title="Excluir projeto"
              className="h-8 w-8 flex items-center justify-center rounded-xl border border-ink-15 text-red-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 p-1 bg-cream-2 rounded-xl mt-4 w-fit border border-ink-15">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-cream text-ink shadow-sm"
                  : tab.disabled
                  ? "text-ink-15 cursor-not-allowed"
                  : "text-ink-35 hover:text-ink hover:bg-cream-2"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? "bg-ink/[0.08] text-ink"
                      : "bg-ink/[0.05] text-ink-35"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {previewHtml ? (
                <PreviewTab html={previewHtml} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-ink-35">
                    <Eye className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Preview não disponível para este projeto</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full overflow-hidden"
            >
              {project.description && files.length > 0 && (
                <div className="mx-4 mt-4 mb-0 p-3 rounded-xl border border-ink-15 bg-ink/[0.03] flex-shrink-0">
                  <p className="text-sm text-ink-35 line-clamp-2">{project.description}</p>
                </div>
              )}
              <div className="h-full min-h-0" style={project.description && files.length > 0 ? { paddingTop: "4px" } : undefined}>
                <CodeTab
                  files={files}
                  selectedIndex={Math.min(codeTabIndex, Math.max(0, files.length - 1))}
                  onSelectIndex={setCodeTabIndex}
                  onChangeContent={handleFileContentChange}
                  onSave={handleSaveCode}
                  saving={savingCode}
                  dirty={codeDirty}
                />
              </div>
            </motion.div>
          )}

          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex h-full min-h-0 flex-col p-4"
            >
              <AIChat
                projectContext={`Projeto: ${project.name}\nDescrição: ${project.description}\nTipo: ${typeLabel}\nTech stack: ${(project.tech_stack ?? []).join(", ")}`}
                projectId={project.id}
              />
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full overflow-auto p-6"
            >
              <VersionHistory
                projectId={project.id}
                onRestored={() => {
                  fetch(`/api/projects/${project.id}`)
                    .then((r) => r.json())
                    .then((data: ProjectData) => setProject(data))
                    .catch(() => {});
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
