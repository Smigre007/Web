import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { PROJECT_TYPE_LABELS, PROJECT_TYPE_ICONS } from "@/lib/utils";
import { Brain, ExternalLink, Sparkles } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  tech_stack?: string[];
  generated_code?: {
    preview_html?: string;
    summary?: string;
  };
}

async function getProject(id: string): Promise<Project | null> {
  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("projects")
      .select("id, name, description, type, status, tech_stack, generated_code")
      .eq("id", id)
      .eq("status", "completed")
      .single();

    if (error || !data) return null;
    return data as Project;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return { title: "Projeto não encontrado" };

  return {
    title: `${project.name} — NeuroCode AI`,
    description: project.description || `Projeto criado com NeuroCode AI`,
    openGraph: {
      title: project.name,
      description: project.description,
      type: "website",
    },
  };
}

export default async function PublicProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) notFound();

  const typeIcon = PROJECT_TYPE_ICONS[project.type] ?? "📁";
  const typeLabel = PROJECT_TYPE_LABELS[project.type] ?? project.type;
  const previewHtml = project.generated_code?.preview_html ?? "";

  return (
    <div className="min-h-screen bg-surface text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">NeuroCode AI</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-colors text-sm font-semibold text-white"
          >
            <Sparkles className="w-4 h-4" />
            Criar meu próprio
          </Link>
        </div>
      </header>

      {/* Project info bar */}
      <div className="border-b border-white/8 px-6 py-4 bg-black/20 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center gap-3 flex-wrap">
          <span className="text-xl">{typeIcon}</span>
          <h1 className="font-black text-white text-lg">{project.name}</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs border border-white/10 bg-white/5 text-white/40">
            {typeLabel}
          </span>
          {(project.tech_stack ?? []).slice(0, 4).map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full text-xs bg-white/8 text-white/40 border border-white/10"
            >
              {t}
            </span>
          ))}
        </div>
        {project.description && (
          <p className="max-w-6xl mx-auto mt-1.5 text-sm text-white/40 leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      {/* Preview */}
      <div className="flex-1 flex flex-col">
        {previewHtml ? (
          <iframe
            srcDoc={previewHtml}
            className="flex-1 w-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title={project.name}
            style={{ minHeight: "70vh" }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white/30 py-20">
            <span className="text-6xl">{typeIcon}</span>
            <p className="text-sm">Preview não disponível para este projeto</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <footer className="border-t border-white/10 px-6 py-8 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-white text-sm">Criado com NeuroCode AI</p>
            <p className="text-xs text-white/40 mt-0.5">
              Transforme sua ideia em software completo com Inteligência Artificial
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-colors text-sm font-semibold text-white"
          >
            <ExternalLink className="w-4 h-4" />
            Criar meu projeto grátis
          </Link>
        </div>
      </footer>
    </div>
  );
}
