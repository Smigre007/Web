"use client";

/** Mapa IA → projects: `lib/ai-persistence-audit.ts` */
import React, { useState, useRef, useEffect } from "react";
import {
  readLocalPrefsJson,
  DEFAULT_PROJECT_TYPE_EVENT,
} from "@/lib/neurocode-prefs-local";
import { DEFAULT_PROJECT_TYPE, isProjectTypeId } from "@/lib/project-types";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CodeViewer } from "@/components/ai/code-viewer";
import { PreviewPanel } from "@/components/ai/preview-panel";
import {
  Sparkles,
  Send,
  Globe,
  Smartphone,
  LayoutDashboard,
  ShoppingCart,
  Rocket,
  Code2,
  Zap,
  FileText,
  Eye,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Crown,
  Gem,
  ArrowRight,
} from "lucide-react";
import type { ProjectType, GeneratedCode } from "@/types";
import { useLanguage } from "@/context/language-context";
import { ProjectPicker } from "@/components/ai/project-picker";

interface Usage {
  plan: string;
  generations_used: number;
  generations_limit: number;
  percent: number;
}

const PROJECT_TYPES: { id: ProjectType; label: string; icon: React.ComponentType<{className?: string}>; description: string }[] = [
  { id: "website", label: "Site", icon: Globe, description: "Site completo multi-página" },
  { id: "landing", label: "Landing Page", icon: Rocket, description: "Página de alta conversão" },
  { id: "webapp", label: "App Web", icon: Code2, description: "Aplicação web interativa" },
  { id: "mobile", label: "Mobile", icon: Smartphone, description: "App React Native" },
  { id: "saas", label: "SaaS", icon: Zap, description: "Plataforma SaaS completa" },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Painel analítico" },
  { id: "api", label: "API", icon: Code2, description: "REST API documentada" },
  { id: "automation", label: "Automação", icon: ShoppingCart, description: "Fluxos automáticos" },
  { id: "platform", label: "Plataforma", icon: Sparkles, description: "Plataforma digital escalável" },
];

// Labels shown at approximate stream progress thresholds
const PROGRESS_LABELS: { threshold: number; label: string }[] = [
  { threshold: 0,  label: "Iniciando geração..." },
  { threshold: 5,  label: "Analisando sua ideia..." },
  { threshold: 20, label: "Projetando a arquitetura..." },
  { threshold: 40, label: "Gerando design e interface..." },
  { threshold: 60, label: "Escrevendo o código completo..." },
  { threshold: 80, label: "Adicionando funcionalidades..." },
  { threshold: 95, label: "Finalizando o projeto..." },
];

function getProgressLabel(
  percent: number,
  labels: { threshold: number; label: string }[] = PROGRESS_LABELS
): string {
  let label = labels[0]?.label ?? "";
  for (const entry of labels) {
    if (percent >= entry.threshold) label = entry.label;
  }
  return label;
}

// Estimated max chars for a full generation (used to calculate progress %)
const ESTIMATED_MAX_CHARS = 28000;

const EXAMPLE_PROMPTS = [
  "Um site para minha clínica de estética com agendamento online, galeria de antes/depois e cardápio de serviços",
  "Um app de controle financeiro pessoal com gráficos, categorias e metas de economia",
  "Uma landing page para vender meu curso online de marketing digital com depoimentos e área de membros",
  "Uma plataforma de delivery para meu restaurante com cardápio, pagamento e rastreamento de pedidos",
  "Um dashboard para gestão de projetos com kanban, cronograma e relatórios da equipe",
];

const EXAMPLE_PROMPTS_I18N: Record<"pt" | "en" | "es" | "fr", string[]> = {
  pt: EXAMPLE_PROMPTS,
  en: [
    "A website for my clinic with online booking, before/after gallery and services page",
    "A personal finance app with charts, categories and savings goals",
    "A high-converting landing page for my online course with testimonials and CTA",
    "A food delivery platform for my restaurant with menu, checkout and tracking",
    "A project management dashboard with kanban, timeline and team reports",
  ],
  es: [
    "Un sitio para mi clínica con agendamiento online, galería y servicios",
    "Una app de finanzas personales con gráficos, categorías y metas",
    "Una landing page de alta conversión para vender mi curso online",
    "Una plataforma de delivery para mi restaurante con pagos y seguimiento",
    "Un dashboard de gestión de proyectos con kanban y reportes",
  ],
  fr: [
    "Un site pour ma clinique avec réservation en ligne, galerie et services",
    "Une app de finances personnelles avec graphiques, catégories et objectifs",
    "Une landing page à forte conversion pour vendre mon cours en ligne",
    "Une plateforme de livraison pour mon restaurant avec paiement et suivi",
    "Un dashboard de gestion de projet avec kanban et rapports",
  ],
};

const PLAN_LIMITS: Record<string, { next: string; nextLabel: string; gens: number }> = {
  free:    { next: "starter", nextLabel: "Starter", gens: 30 },
  starter: { next: "pro",     nextLabel: "Pro",     gens: 200 },
  pro:     { next: "pro",     nextLabel: "Pro",     gens: 200 },
};

function LimitReachedCard({ used, limit, plan }: { used: number; limit: number; plan: string }) {
  const { language } = useLanguage();
  const lang = (language as "pt" | "en" | "es" | "fr") ?? "pt";
  const t = {
    pt: { title: "Suas gerações acabaram por este mês", used: "de", used2: "gerações usadas no plano", descA: "Não se preocupe — seu trabalho está salvo e você pode continuar criando projetos incríveis.", descB: "Faça upgrade agora e tenha acesso a", monthly: "gerações mensais", upgradeTo: "Fazer upgrade para", viewProjects: "Ver meus projetos", reset: "Suas gerações reiniciam automaticamente no início do próximo mês." },
    en: { title: "Your monthly generations are finished", used: "of", used2: "generations used on", descA: "No worries — your work is saved and you can keep building.", descB: "Upgrade now and get access to", monthly: "monthly generations", upgradeTo: "Upgrade to", viewProjects: "View my projects", reset: "Your generations reset at the start of next month." },
    es: { title: "Tus generaciones mensuales se agotaron", used: "de", used2: "generaciones usadas en el plan", descA: "No te preocupes: tu trabajo está guardado.", descB: "Mejora ahora y obtén", monthly: "generaciones mensuales", upgradeTo: "Mejorar a", viewProjects: "Ver mis proyectos", reset: "Tus generaciones se reinician al inicio del próximo mes." },
    fr: { title: "Vos générations mensuelles sont épuisées", used: "sur", used2: "générations utilisées sur le plan", descA: "Pas d'inquiétude : votre travail est sauvegardé.", descB: "Passez au niveau supérieur et obtenez", monthly: "générations mensuelles", upgradeTo: "Passer au plan", viewProjects: "Voir mes projets", reset: "Les générations se réinitialisent au début du mois prochain." },
  }[lang];
  const upgrade = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gold/25 overflow-hidden bg-gold/[0.04]"
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4">
        <div className="w-11 h-11 rounded-xl bg-gold/15 border border-gold/25 flex items-center justify-center flex-shrink-0">
          <Gem className="w-5 h-5 text-gold" />
        </div>
        <div>
          <p className="font-bold text-ink text-base leading-tight">
            {t.title}
          </p>
          <p className="text-gold text-sm mt-0.5">
            {used} {t.used} {limit} {t.used2} {planLabel}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 pb-4">
        <div className="h-1.5 rounded-full bg-ink-15 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 w-full" />
        </div>
      </div>

      <div className="px-6 pb-5 space-y-3">
        <p className="text-sm text-ink-60 leading-relaxed">
          {t.descA} {t.descB}{" "}
          <span className="text-ink font-medium">{upgrade.gens} {t.monthly}</span> no plano{" "}
          <span className="text-gold font-semibold">{upgrade.nextLabel}</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Link href="/settings/billing" className="flex-1">
            <Button variant="glow" size="lg" className="w-full gap-2">
              <Crown className="w-4 h-4" />
              {t.upgradeTo} {upgrade.nextLabel}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/projects" className="sm:flex-shrink-0">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              {t.viewProjects}
            </Button>
          </Link>
        </div>

        <p className="text-xs text-ink-35 text-center pt-1">
          {t.reset}
        </p>
      </div>
    </motion.div>
  );
}

interface GeneratorPanelProps {
  initialPrompt?: string;
  initialType?: string;
  onTemplateConsumed?: () => void;
}

export function GeneratorPanel({ initialPrompt, initialType, onTemplateConsumed }: GeneratorPanelProps = {}) {
  const { language } = useLanguage();
  const lang = (language as "pt" | "en" | "es" | "fr") ?? "pt";
  const i18n = {
    pt: { generatedSuccess: "Projeto gerado com sucesso!", filesCreated: "arquivos criados", generateError: "Erro ao gerar projeto", stop: "Parar Geração", generate: "Gerar com IA", loadingOutput: "Saída ao vivo", successTitle: "Projeto gerado com sucesso!", download: "Baixar", summary: "Resumo", preview: "Preview", code: "Código", features: "Funcionalidades incluídas", nextSteps: "Próximos passos sugeridos", viewSaved: "Ver projeto salvo em Meus Projetos", projectType: "Tipo de projeto", promptPlaceholder: "Descreva sua ideia em detalhes. Quanto mais detalhes, melhor o resultado.", examples: "Exemplos", chars: "caracteres", ctrlEnter: "Ctrl+Enter para gerar", used: "gerações usadas", nearlyLimit: "Quase no limite", limitReached: "Limite atingido", upgrade: "Fazer upgrade", powered: "Powered by NeuroCode AI", waiting: "aguardando..." },
    en: { generatedSuccess: "Project generated successfully!", filesCreated: "files created", generateError: "Error generating project", stop: "Stop Generation", generate: "Generate with AI", loadingOutput: "Live output", successTitle: "Project generated successfully!", download: "Download", summary: "Summary", preview: "Preview", code: "Code", features: "Included features", nextSteps: "Suggested next steps", viewSaved: "View saved project in My Projects", projectType: "Project type", promptPlaceholder: "Describe your idea in detail. The more detail, the better the result.", examples: "Examples", chars: "chars", ctrlEnter: "Ctrl+Enter to generate", used: "generations used", nearlyLimit: "Near limit", limitReached: "Limit reached", upgrade: "Upgrade", powered: "Powered by NeuroCode AI", waiting: "waiting..." },
    es: { generatedSuccess: "Proyecto generado con éxito!", filesCreated: "archivos creados", generateError: "Error al generar proyecto", stop: "Detener generación", generate: "Generar con IA", loadingOutput: "Salida en vivo", successTitle: "Proyecto generado con éxito!", download: "Descargar", summary: "Resumen", preview: "Vista previa", code: "Código", features: "Funcionalidades incluidas", nextSteps: "Próximos pasos sugeridos", viewSaved: "Ver proyecto guardado en Mis Proyectos", projectType: "Tipo de proyecto", promptPlaceholder: "Describe tu idea en detalle. Cuantos más detalles, mejor resultado.", examples: "Ejemplos", chars: "caracteres", ctrlEnter: "Ctrl+Enter para generar", used: "generaciones usadas", nearlyLimit: "Cerca del límite", limitReached: "Límite alcanzado", upgrade: "Mejorar plan", powered: "Powered by NeuroCode AI", waiting: "esperando..." },
    fr: { generatedSuccess: "Projet généré avec succès !", filesCreated: "fichiers créés", generateError: "Erreur de génération du projet", stop: "Arrêter la génération", generate: "Générer avec IA", loadingOutput: "Sortie en direct", successTitle: "Projet généré avec succès !", download: "Télécharger", summary: "Résumé", preview: "Aperçu", code: "Code", features: "Fonctionnalités incluses", nextSteps: "Prochaines étapes suggérées", viewSaved: "Voir le projet enregistré dans Mes Projets", projectType: "Type de projet", promptPlaceholder: "Décrivez votre idée en détail. Plus de détails = meilleur résultat.", examples: "Exemples", chars: "caractères", ctrlEnter: "Ctrl+Entrée pour générer", used: "générations utilisées", nearlyLimit: "Presque à la limite", limitReached: "Limite atteinte", upgrade: "Upgrade", powered: "Powered by NeuroCode AI", waiting: "en attente..." },
  }[lang];
  const localizedExamples = EXAMPLE_PROMPTS_I18N[lang];
  const localizedProgress = lang === "en"
    ? [
        { threshold: 0, label: "Starting generation..." },
        { threshold: 5, label: "Analyzing your idea..." },
        { threshold: 20, label: "Designing architecture..." },
        { threshold: 40, label: "Generating design and UI..." },
        { threshold: 60, label: "Writing complete code..." },
        { threshold: 80, label: "Adding features..." },
        { threshold: 95, label: "Finalizing project..." },
      ]
    : lang === "es"
      ? [
          { threshold: 0, label: "Iniciando generación..." },
          { threshold: 5, label: "Analizando tu idea..." },
          { threshold: 20, label: "Diseñando arquitectura..." },
          { threshold: 40, label: "Generando diseño e interfaz..." },
          { threshold: 60, label: "Escribiendo código completo..." },
          { threshold: 80, label: "Agregando funcionalidades..." },
          { threshold: 95, label: "Finalizando proyecto..." },
        ]
      : lang === "fr"
        ? [
            { threshold: 0, label: "Démarrage de la génération..." },
            { threshold: 5, label: "Analyse de votre idée..." },
            { threshold: 20, label: "Conception de l'architecture..." },
            { threshold: 40, label: "Génération du design et de l'interface..." },
            { threshold: 60, label: "Écriture du code complet..." },
            { threshold: 80, label: "Ajout des fonctionnalités..." },
            { threshold: 95, label: "Finalisation du projet..." },
          ]
        : PROGRESS_LABELS;
  const [prompt, setPrompt] = useState(initialPrompt ?? "");
  const [projectType, setProjectType] = useState<ProjectType>(() => {
    if (initialType) return initialType as ProjectType;
    try {
      const saved = localStorage.getItem("neurocode-prefs");
      if (saved) {
        const p = JSON.parse(saved) as { defaultProjectType?: string };
        let t = p.defaultProjectType;
        if (t === "game") t = "platform";
        if (t && PROJECT_TYPES.some((x) => x.id === t)) return t as ProjectType;
      }
    } catch {}
    return DEFAULT_PROJECT_TYPE;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamProgress, setStreamProgress] = useState(0);
  const [generatedProject, setGeneratedProject] = useState<GeneratedCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState<{ used: number; limit: number; plan: string } | null>(null);
  const [activeView, setActiveView] = useState<"code" | "preview">("preview");
  const [streamingText, setStreamingText] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [linkedProjectId, setLinkedProjectId] = useState<string | null>(null);
  const [draftProjectId, setDraftProjectId] = useState<string | null>(null);
  const draftProjectIdRef = useRef<string | null>(null);
  useEffect(() => {
    draftProjectIdRef.current = draftProjectId;
  }, [draftProjectId]);
  const abortRef = useRef<AbortController | null>(null);
  const savedRef = useRef(false);
  const generationAlertShownRef = useRef(false);
  const onTemplateConsumedRef = useRef(onTemplateConsumed);
  onTemplateConsumedRef.current = onTemplateConsumed;
  const initialTypeRef = useRef(initialType);
  useEffect(() => {
    initialTypeRef.current = initialType;
  }, [initialType]);

  // Sync template prompt when parent injects one
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      if (initialType) setProjectType(initialType as ProjectType);
      onTemplateConsumedRef.current?.();
      // Scroll into view
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [initialPrompt, initialType]);

  // Fetch usage on mount
  useEffect(() => {
    fetch("/api/user/usage")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setUsage(d))
      .catch(() => {});
  }, []);

  // Tipo de projeto padrão a partir do servidor (quando não há ?type= na URL)
  useEffect(() => {
    if (initialType) return;
    fetch("/api/user/preferences")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { preferences?: { defaultProjectType?: string } } | null) => {
        let t = data?.preferences?.defaultProjectType;
        if (t === "game") t = "platform";
        if (!t) return;
        if (isProjectTypeId(t)) setProjectType(t);
      })
      .catch(() => {});
  }, [initialType]);

  // Mesmo separador: Configurações altera prefs → evento (como tema do editor)
  useEffect(() => {
    const onDefaultProjectType = (e: Event) => {
      if (initialTypeRef.current) return;
      const d = (e as CustomEvent<unknown>).detail;
      let t = d;
      if (t === "game") t = "platform";
      if (isProjectTypeId(t)) setProjectType(t);
    };
    window.addEventListener(DEFAULT_PROJECT_TYPE_EVENT, onDefaultProjectType);
    return () =>
      window.removeEventListener(DEFAULT_PROJECT_TYPE_EVENT, onDefaultProjectType);
  }, []);

  // Alerta de limite (preferência generationAlerts + toast in-app)
  useEffect(() => {
    if (!usage || generationAlertShownRef.current) return;
    const prefs = readLocalPrefsJson();
    const alertsOn = prefs.generationAlerts !== false;
    if (!alertsOn) return;
    if (usage.percent >= 85 && usage.generations_used < usage.generations_limit) {
      generationAlertShownRef.current = true;
      toast.warning("Quase no limite de gerações", {
        description: `Usou ${usage.percent}% do plano. Considere fazer upgrade para não interromper.`,
      });
    }
  }, [usage]);

  // Auto-save to Supabase after successful generation (PATCH draft/linked, or POST fallback)
  useEffect(() => {
    if (!generatedProject || savedRef.current) return;

    let isMounted = true;
    const name = prompt.length > 50 ? prompt.slice(0, 47) + "..." : prompt;
    const description = generatedProject.summary || generatedProject.architecture || prompt;
    const patchBody = {
      name,
      description,
      type: projectType,
      prompt,
      generated_code: generatedProject as unknown as Record<string, unknown>,
      tech_stack: generatedProject.tech_stack,
      status: "completed" as const,
    };

    const finish = (id: string) => {
      if (isMounted && id) {
        savedRef.current = true;
        setSavedProjectId(id);
        window.dispatchEvent(new Event("neurocode:dashboard-refresh"));
      }
    };

    const targetId = linkedProjectId ?? draftProjectId;

    if (targetId) {
      fetch(`/api/projects/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchBody),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((saved) => {
          if (saved?.id) finish(saved.id as string);
        })
        .catch(() => {});
    } else {
      fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          type: projectType,
          tech_stack: generatedProject.tech_stack,
          status: "completed",
          code_data: generatedProject,
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((saved) => {
          if (saved?.id) finish(saved.id as string);
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedProject, linkedProjectId, draftProjectId]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedProject(null);
    setError(null);
    setLimitReached(null);
    setStreamingText("");
    setStreamProgress(0);
    setSavedProjectId(null);
    savedRef.current = false;
    setDraftProjectId(null);
    draftProjectIdRef.current = null;

    const markGenerationFailed = async () => {
      const pid = linkedProjectId ?? draftProjectIdRef.current;
      if (!pid) return;
      try {
        await fetch(`/api/projects/${pid}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "error" }),
        });
        window.dispatchEvent(new Event("neurocode:dashboard-refresh"));
      } catch {
        /* ignore */
      }
    };

    // Retry helper: retries on network errors (not 4xx/5xx)
    const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 2): Promise<Response> => {
      let lastError: Error | null = null;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await fetch(url, options);
        } catch (err) {
          if ((err as Error).name === "AbortError") throw err;
          lastError = err as Error;
          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
          }
        }
      }
      throw lastError ?? new Error("Network error");
    };

    try {
      abortRef.current = new AbortController();

      try {
        if (linkedProjectId) {
          await fetch(`/api/projects/${linkedProjectId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "generating", prompt }),
          });
        } else {
          const draftName =
            prompt.trim().length > 80 ? `${prompt.trim().slice(0, 77)}...` : prompt.trim() || "Gerando…";
          const res = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: draftName,
              description: "",
              type: projectType,
              prompt,
              status: "generating",
            }),
          });
          if (res.ok) {
            const j = (await res.json()) as { id?: string };
            if (j.id) {
              setDraftProjectId(j.id);
              draftProjectIdRef.current = j.id;
              window.dispatchEvent(new Event("neurocode:dashboard-refresh"));
            }
          }
        }
      } catch {
        /* geração continua mesmo sem rascunho persistido */
      }

      const response = await fetchWithRetry("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, projectType, language: lang }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        if (response.status === 429 && err.limitReached) {
          setLimitReached({ used: err.used, limit: err.limit, plan: err.plan ?? "free" });
          void markGenerationFailed();
          return; // Don't set generic error — show friendly card instead
        }
        throw new Error(err.error || i18n.generateError);
      }

      // Stream response — track real progress based on chars received
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      const STREAM_ERROR_PREFIX = "\x00__ERR__:";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        // Detect in-band error sentinel from the server — avoids browser NetworkError
        if (chunk.includes(STREAM_ERROR_PREFIX)) {
          const errMsg = chunk.split(STREAM_ERROR_PREFIX)[1] ?? i18n.generateError;
          throw new Error(errMsg.trim());
        }
        fullText += chunk;
        setStreamingText(fullText);
        // Update progress based on chars received vs estimated total
        const percent = Math.min(97, Math.round((fullText.length / ESTIMATED_MAX_CHARS) * 100));
        setStreamProgress(percent);
      }
      setStreamProgress(100);

      // Parse final JSON
      try {
        const parsed = JSON.parse(fullText);
        setGeneratedProject(parsed);
        toast.success(i18n.generatedSuccess, { description: `${parsed.files?.length || 0} ${i18n.filesCreated}` });
        // Refresh usage counter
        fetch("/api/user/usage").then((r) => r.ok ? r.json() : null).then((d) => d && setUsage(d)).catch(() => {});
      } catch {
        // Try to extract JSON from the text
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setGeneratedProject(parsed);
          toast.success(i18n.generatedSuccess, { description: `${parsed.files?.length || 0} ${i18n.filesCreated}` });
          // Refresh usage counter
          fetch("/api/user/usage").then((r) => r.ok ? r.json() : null).then((d) => d && setUsage(d)).catch(() => {});
        } else {
          throw new Error(
            lang === "en" ? "Could not process AI response"
              : lang === "es" ? "No fue posible procesar la respuesta de la IA"
              : lang === "fr" ? "Impossible de traiter la réponse de l'IA"
              : "Não foi possível processar a resposta da IA"
          );
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        const msg = (err as Error).message;
        setError(msg);
        toast.error(i18n.generateError, { description: msg });
        void markGenerationFailed();
      } else {
        void markGenerationFailed();
      }
    } finally {
      setIsGenerating(false);
      setStreamProgress(0);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsGenerating(false);
    setStreamProgress(0);
    const pid = linkedProjectId ?? draftProjectIdRef.current;
    if (pid) {
      void fetch(`/api/projects/${pid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "error" }),
      }).then(() => window.dispatchEvent(new Event("neurocode:dashboard-refresh")));
    }
  };

  const handleDownload = async () => {
    if (!generatedProject) return;

    // If we have a saved project ID, use the ZIP export API
    if (savedProjectId) {
      try {
        const res = await fetch(`/api/projects/${savedProjectId}/export`);
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          const cd = res.headers.get("Content-Disposition") ?? "";
          const match = cd.match(/filename="(.+?)"/);
          a.download = match?.[1] ?? "projeto.zip";
          a.click();
          URL.revokeObjectURL(url);
          toast.success(
            lang === "en" ? "ZIP exported!" : lang === "es" ? "¡ZIP exportado!" : lang === "fr" ? "ZIP exporté !" : "ZIP exportado!",
            { description: lang === "en" ? "All project files downloaded" : lang === "es" ? "Todos los archivos del proyecto descargados" : lang === "fr" ? "Tous les fichiers du projet ont été téléchargés" : "Todos os arquivos do projeto baixados" }
          );
          return;
        }
      } catch {
        // fall through to JSON fallback
      }
    }

    // Fallback: download as JSON
    const dataStr = JSON.stringify(generatedProject, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projeto.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(
      lang === "en" ? "Project exported!" : lang === "es" ? "¡Proyecto exportado!" : lang === "fr" ? "Projet exporté !" : "Projeto exportado!",
      { description: lang === "en" ? "JSON file saved successfully" : lang === "es" ? "Archivo JSON guardado con éxito" : lang === "fr" ? "Fichier JSON enregistré avec succès" : "Arquivo JSON salvo com sucesso" }
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-1 sm:px-2 pb-2 space-y-4">
        {!generatedProject && !isGenerating && !error && !limitReached && (
          <div className="rounded-xl border border-dashed border-ink-15 bg-cream/50 px-4 py-8 text-center">
            <Sparkles className="w-8 h-8 text-gold/60 mx-auto mb-3" aria-hidden />
            <p className="text-sm text-ink-35 max-w-md mx-auto leading-relaxed">
              {lang === "en"
                ? "Describe what you want to build. Results appear here."
                : lang === "es"
                  ? "Describe lo que quieres crear. El resultado aparece aquí."
                  : lang === "fr"
                    ? "Décrivez ce que vous voulez créer. Le résultat apparaît ici."
                    : "Descreva o que quer criar. O resultado aparece aqui — o prompt fixo fica abaixo."}
            </p>
          </div>
        )}

      {/* Generation progress */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-amber-500/30 bg-amber-950/30 backdrop-blur-sm overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {getProgressLabel(streamProgress, localizedProgress)}
                  </p>
                  <p className="text-sm text-white/50">
                    {i18n.powered}
                  </p>
                </div>
              </div>
              <Progress
                value={streamProgress || 5}
                className="mb-2"
              />
              <p className="text-xs text-white/40 text-right">
                {streamProgress > 0 ? `${streamProgress}%` : i18n.waiting}
              </p>
            </div>

            {/* Live streaming output */}
            {streamingText && (
              <div className="border-t border-amber-500/20 bg-black/30">
                <div className="px-4 py-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs text-white/30 font-medium">{i18n.loadingOutput}</span>
                </div>
                <pre
                  className="px-4 pb-4 text-xs text-amber-300/70 leading-relaxed overflow-auto max-h-[160px] code-font"
                  style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
                >
                  {streamingText.length > 1200
                    ? "..." + streamingText.slice(-1000)
                    : streamingText}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && !limitReached && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-950/30"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated project */}
      <AnimatePresence>
        {generatedProject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Success header */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-gold/25 bg-gold/[0.05]">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-gold" />
                <div>
                  <p className="font-semibold text-ink">
                    {i18n.successTitle}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {generatedProject.tech_stack?.slice(0, 4).map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4" />
                  {i18n.download}
                </Button>
              </div>
            </div>

            {/* Summary */}
            {generatedProject.architecture && (
              <div className="p-4 rounded-xl border border-ink-15 bg-cream-2">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gold" />
                  <span className="text-sm font-medium text-ink">{i18n.summary}</span>
                </div>
                <p className="text-sm text-ink-60 leading-relaxed">
                  {generatedProject.architecture}
                </p>
              </div>
            )}

            {/* View tabs */}
            <div className="flex gap-2 border-b border-ink-15 pb-0">
              {[
                { id: "preview", label: i18n.preview, icon: Eye },
                { id: "code", label: i18n.code, icon: Code2 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as typeof activeView)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${
                    activeView === tab.id
                      ? "border-gold text-gold"
                      : "border-transparent text-ink-35 hover:text-ink"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content view */}
            {activeView === "preview" && (
              <PreviewPanel html={generatedProject.preview_html || ""} />
            )}
            {activeView === "code" && (
              <CodeViewer files={generatedProject.files || []} />
            )}

            {/* Features + next steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedProject.features && generatedProject.features.length > 0 && (
                <div className="p-4 rounded-xl border border-ink-15 bg-cream-2">
                  <p className="text-sm font-medium text-ink mb-3">
                    ✨ {i18n.features}:
                  </p>
                  <ul className="space-y-1">
                    {generatedProject.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-ink-60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {generatedProject.next_steps && generatedProject.next_steps.length > 0 && (
                <div className="p-4 rounded-xl border border-gold/20 bg-gold/[0.04]">
                  <p className="text-sm font-medium text-gold mb-3">
                    🚀 {i18n.nextSteps}:
                  </p>
                  <ul className="space-y-1">
                    {generatedProject.next_steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink-60">
                        <span className="text-gold font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* View in Projects link */}
            {savedProjectId && (
              <div className="flex justify-center pt-2">
                <a
                  href={`/projects/${savedProjectId}`}
                  className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {i18n.viewSaved} →
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      <div className="shrink-0 border-t border-ink-15 bg-cream/95 px-3 py-3 sm:px-4 backdrop-blur-md space-y-3 rounded-b-2xl pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <ProjectPicker
          lang={lang}
          value={linkedProjectId}
          onChange={(id) => setLinkedProjectId(id)}
          dense
        />

        <div>
          <p className="text-xs text-ink-35 mb-2 font-medium uppercase tracking-wide">{i18n.projectType}</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {PROJECT_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setProjectType(type.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  projectType === type.id
                    ? "bg-gold/15 border-gold/40 text-gold"
                    : "border-ink-15 bg-cream-2 text-ink-35 hover:text-ink hover:border-ink/20"
                }`}
              >
                <type.icon className="w-3.5 h-3.5" />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={i18n.promptPlaceholder}
            className="min-h-[100px] max-h-[220px] text-sm text-ink leading-relaxed resize-none border-ink-15 bg-cream-2 pr-4 placeholder:text-ink-35"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleGenerate();
              }
            }}
          />
          <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
            <div className="flex gap-2 flex-wrap min-w-0">
              <span className="text-[10px] text-ink-35 shrink-0">{i18n.examples}:</span>
              {localizedExamples.slice(0, 2).map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setPrompt(example)}
                  className="text-[10px] text-gold/80 hover:text-gold transition-colors truncate max-w-[180px] text-left"
                >
                  {example.substring(0, 48)}…
                </button>
              ))}
            </div>
            <span className="text-[10px] text-ink-35 shrink-0">
              {prompt.length} {i18n.chars} · {i18n.ctrlEnter}
            </span>
          </div>
        </div>

        {usage && (
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-ink-35 min-w-0">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {usage.generations_used}/{usage.generations_limit} {i18n.used}
              </span>
              {usage.percent >= 80 && usage.percent < 100 && (
                <span className="text-amber-600 font-medium shrink-0">⚠ {i18n.nearlyLimit}</span>
              )}
              {usage.percent === 100 && (
                <span className="text-red-500 font-medium shrink-0">{i18n.limitReached}</span>
              )}
            </div>
            {usage.percent >= 80 && (
              <a
                href="/settings/billing"
                className="flex items-center gap-1 text-gold hover:text-ink transition-colors font-medium shrink-0"
              >
                <Crown className="w-3 h-3" />
                {i18n.upgrade}
              </a>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isGenerating ? (
            <Button onClick={handleStop} variant="outline" size="lg" className="w-full">
              <RefreshCw className="w-5 h-5 animate-spin" />
              {i18n.stop}
            </Button>
          ) : (usage && usage.percent === 100) || limitReached ? (
            <LimitReachedCard
              used={limitReached?.used ?? usage?.generations_used ?? 0}
              limit={limitReached?.limit ?? usage?.generations_limit ?? 0}
              plan={limitReached?.plan ?? usage?.plan ?? "free"}
            />
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              size="lg"
              variant="glow"
              className="w-full group"
            >
              <Sparkles className="w-5 h-5" />
              {i18n.generate}
              <Send className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
