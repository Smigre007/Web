"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, Code2, Layers } from "lucide-react";
import { useLanguage } from "@/context/language-context";

type GeneratedCode = { files?: Array<{ path: string; language: string; content: string }>; features?: string[] } | null;
type ShowcaseProject = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  prompt: string;
  tech_stack: string[] | null;
  preview_html: string | null;
  created_at: string;
  generated_code?: GeneratedCode;
};

const TEXTS = {
  pt: { back: "Voltar ao Showcase", features: "Funcionalidades", promptUsed: "Prompt usado", useAsBase: "Usar como base", filesGenerated: "arquivos gerados", previewUnavailable: "Preview não disponível" },
  en: { back: "Back to Showcase", features: "Features", promptUsed: "Prompt used", useAsBase: "Use as template", filesGenerated: "generated files", previewUnavailable: "Preview unavailable" },
  es: { back: "Volver al Showcase", features: "Funcionalidades", promptUsed: "Prompt usado", useAsBase: "Usar como base", filesGenerated: "archivos generados", previewUnavailable: "Vista previa no disponible" },
  fr: { back: "Retour au Showcase", features: "Fonctionnalités", promptUsed: "Prompt utilisé", useAsBase: "Utiliser comme base", filesGenerated: "fichiers générés", previewUnavailable: "Aperçu indisponible" },
} as const;

export function ShowcaseDetailClient({ project, dashboardLink }: { project: ShowcaseProject; dashboardLink: string }) {
  const { language } = useLanguage();
  const lang = (language as "pt" | "en" | "es" | "fr") ?? "pt";
  const t = TEXTS[lang];
  const locale = lang === "en" ? "en-US" : lang === "es" ? "es-ES" : lang === "fr" ? "fr-FR" : "pt-BR";

  const generatedCode = project.generated_code ?? null;

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/showcase" className="inline-flex items-center gap-2 text-ink-35 hover:text-ink text-sm font-mono mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-400 mb-2">{project.type}</p>
              <h1 className="text-2xl font-serif font-light text-ink mb-2">{project.name}</h1>
              {project.description ? <p className="text-ink-60 text-sm font-serif leading-relaxed">{project.description}</p> : null}
            </div>

            <div className="space-y-2 text-sm text-ink-35">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{new Date(project.created_at).toLocaleDateString(locale)}</span>
              </div>
              {project.tech_stack?.length ? (
                <div className="flex items-start gap-2">
                  <Layers className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {project.tech_stack.map((tech) => (
                      <span key={tech} className="text-xs bg-ink/10 text-ink px-2 py-0.5 rounded font-mono">{tech}</span>
                    ))}
                  </div>
                </div>
              ) : null}
              {generatedCode?.files ? (
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  <span>{generatedCode.files.length} {t.filesGenerated}</span>
                </div>
              ) : null}
            </div>

            {generatedCode?.features?.length ? (
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-ink-35 mb-2">{t.features}</p>
                <ul className="space-y-1">
                  {generatedCode.features.slice(0, 6).map((feature) => (
                    <li key={feature} className="text-sm text-ink-60 flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>{feature}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-xl border border-ink-15 bg-cream-2/80 p-4">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-ink-35 mb-2">{t.promptUsed}</p>
              <p className="text-sm text-ink-60 font-serif italic leading-relaxed">&ldquo;{project.prompt}&rdquo;</p>
            </div>

            <Link href={dashboardLink} className="flex items-center justify-center gap-2 bg-ink text-cream px-5 py-3 text-xs font-mono uppercase tracking-[0.2em] hover:bg-gold transition-colors">
              {t.useAsBase}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-2">
            {project.preview_html ? (
              <div className="rounded-2xl overflow-hidden border border-ink-15" style={{ height: "600px" }}>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-ink/5 border-b border-ink-15">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-cream/80 rounded px-3 py-1 text-[10px] font-mono text-ink-35">{project.name.toLowerCase().replace(/\s+/g, "-")}.vercel.app</div>
                  </div>
                </div>
                <iframe srcDoc={project.preview_html} className="w-full border-0" style={{ height: "calc(100% - 40px)" }} sandbox="allow-scripts" title={`Preview: ${project.name}`} />
              </div>
            ) : (
              <div className="rounded-2xl border border-ink-15 bg-cream-2/60 h-[400px] flex items-center justify-center">
                <p className="text-ink-35 text-sm font-serif">{t.previewUnavailable}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
