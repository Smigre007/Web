"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/language-context";

interface ShowcaseProject {
  id: string;
  name: string;
  description: string | null;
  type: string;
  prompt: string;
  tech_stack: string[] | null;
  showcase_slug: string;
  showcase_screenshot_url: string | null;
  created_at: string;
}

const TYPE_LABELS: Record<string, Record<string, string>> = {
  pt: { website: "Site", webapp: "Web App", mobile: "Mobile", saas: "SaaS", landing: "Landing Page", dashboard: "Dashboard", api: "API", automation: "Automação", platform: "Plataforma" },
  en: { website: "Website", webapp: "Web App", mobile: "Mobile", saas: "SaaS", landing: "Landing Page", dashboard: "Dashboard", api: "API", automation: "Automation", platform: "Platform" },
  es: { website: "Sitio", webapp: "Web App", mobile: "Mobile", saas: "SaaS", landing: "Landing Page", dashboard: "Dashboard", api: "API", automation: "Automatización", platform: "Plataforma" },
  fr: { website: "Site", webapp: "Web App", mobile: "Mobile", saas: "SaaS", landing: "Landing Page", dashboard: "Dashboard", api: "API", automation: "Automatisation", platform: "Plateforme" },
};

const TEXTS = {
  pt: {
    back: "Voltar para o início",
    badge: "Criado com NeuroCode AI",
    title: "Showcase de Projetos",
    subtitle: "Projetos reais criados por usuários do NeuroCode AI.",
    publicProjects: "projetos públicos",
    emptyTitle: "Seja o primeiro a publicar",
    emptyBody: "Crie um projeto incrível e compartilhe com a comunidade NeuroCode.",
    startNow: "Começar Agora",
    ctaTitle: "Crie seu projeto e apareça aqui",
    ctaBody: "Compartilhe com a comunidade e inspire outros criadores.",
    ctaButton: "Começar Gratuitamente",
  },
  en: {
    back: "Back to home",
    badge: "Built with NeuroCode AI",
    title: "Project Showcase",
    subtitle: "Real projects created by NeuroCode AI users.",
    publicProjects: "public projects",
    emptyTitle: "Be the first to publish",
    emptyBody: "Create an amazing project and share it with the NeuroCode community.",
    startNow: "Start Now",
    ctaTitle: "Build your project and appear here",
    ctaBody: "Share with the community and inspire other creators.",
    ctaButton: "Start for Free",
  },
  es: {
    back: "Volver al inicio",
    badge: "Creado con NeuroCode AI",
    title: "Showcase de Proyectos",
    subtitle: "Proyectos reales creados por usuarios de NeuroCode AI.",
    publicProjects: "proyectos públicos",
    emptyTitle: "Sé el primero en publicar",
    emptyBody: "Crea un proyecto increíble y compártelo con la comunidad NeuroCode.",
    startNow: "Empezar Ahora",
    ctaTitle: "Crea tu proyecto y aparece aquí",
    ctaBody: "Comparte con la comunidad e inspira a otros creadores.",
    ctaButton: "Empezar Gratis",
  },
  fr: {
    back: "Retour à l'accueil",
    badge: "Créé avec NeuroCode AI",
    title: "Showcase des Projets",
    subtitle: "Projets réels créés par les utilisateurs de NeuroCode AI.",
    publicProjects: "projets publics",
    emptyTitle: "Soyez le premier à publier",
    emptyBody: "Créez un projet incroyable et partagez-le avec la communauté NeuroCode.",
    startNow: "Commencer",
    ctaTitle: "Créez votre projet et apparaissez ici",
    ctaBody: "Partagez avec la communauté et inspirez d'autres créateurs.",
    ctaButton: "Commencer Gratuitement",
  },
} as const;

export function ShowcaseListClient({ projects }: { projects: ShowcaseProject[] }) {
  const { language } = useLanguage();
  const lang = (language as "pt" | "en" | "es" | "fr") ?? "pt";
  const t = TEXTS[lang];
  const labels = TYPE_LABELS[lang];

  return (
    <div className="min-h-screen bg-cream py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-ink-35 hover:text-ink text-sm font-mono mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </Link>

        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 mb-3">{t.badge}</p>
          <h1 className="text-4xl md:text-5xl font-serif font-light text-ink mb-4">{t.title}</h1>
          <p className="text-ink-60 font-serif font-light text-lg leading-relaxed">{t.subtitle}</p>
        </div>

        <div className="flex gap-8 mb-12 pb-8 border-b border-ink-15">
          <div>
            <p className="text-2xl font-black text-ink">{projects.length}+</p>
            <p className="text-sm text-ink-35">{t.publicProjects}</p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-ink-15 rounded-3xl">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-xl font-serif font-light text-ink mb-2">{t.emptyTitle}</h2>
            <p className="text-ink-60 text-sm mb-6 max-w-sm mx-auto">{t.emptyBody}</p>
            <Link href="/sign-up" className="inline-flex items-center gap-2 bg-ink text-cream px-6 py-2.5 text-xs font-mono uppercase tracking-[0.25em] hover:bg-gold transition-colors">
              {t.startNow}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/showcase/${project.showcase_slug}`} className="group block rounded-2xl border border-ink-15 bg-cream-2/80 overflow-hidden hover:border-gold/30 hover:shadow-lg transition-all duration-300">
                <div className="aspect-[16/10] bg-gradient-to-br from-ink/5 to-ink/10 relative overflow-hidden">
                  {project.showcase_screenshot_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.showcase_screenshot_url} alt={project.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-ink-35 text-xs font-mono">{labels[project.type] ?? project.type}</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-cream/95 rounded-full p-2 shadow-md">
                      <ExternalLink className="w-4 h-4 text-ink" />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-ink text-sm leading-tight">{project.name}</h3>
                    <span className="text-[9px] font-mono bg-ink/10 text-ink-60 px-2 py-0.5 rounded">{labels[project.type] ?? project.type}</span>
                  </div>
                  {project.description ? <p className="text-ink-60 text-xs leading-relaxed mb-3 line-clamp-2 font-serif">{project.description}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-16 text-center p-8 rounded-3xl border border-ink-15 bg-cream-2/80">
          <h2 className="text-2xl font-serif font-light text-ink mb-3">{t.ctaTitle}</h2>
          <p className="text-ink-60 text-sm mb-6 font-serif">{t.ctaBody}</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-ink text-cream px-8 py-3 text-xs font-mono uppercase tracking-[0.25em] hover:bg-gold transition-colors">
            {t.ctaButton}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
