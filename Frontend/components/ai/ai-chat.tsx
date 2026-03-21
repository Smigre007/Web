"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Sparkles, Send, User, Copy, Check, Trash2,
  Lightbulb, Code2, Wand2, Save, Search, FileText,
  BarChart3, Bot, Globe, Square,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = "assistant" | "research" | "code" | "writing" | "analysis";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  prompt: string;
}

interface ModeConfig {
  id: Mode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  welcomeExtra: string;
  quickActions: QuickAction[];
}

// ─── Mode definitions ─────────────────────────────────────────────────────────
function getModes(lang: "pt" | "en" | "es" | "fr"): ModeConfig[] {
  const copy = {
    pt: {
      assistant: "Assistente", research: "Pesquisa", code: "Dev", writing: "Escrita", analysis: "Análise",
      pAssistant: "Pergunte qualquer coisa ou peça ajuda com qualquer tarefa...",
      pResearch: "Pesquise sobre qualquer tema, peça resumos, comparações e análises...",
      pCode: "Peça código, tire dúvidas de programação, refatore, debugue...",
      pWriting: "Crie textos, emails, posts, roteiros ou peça revisão de conteúdo...",
      pAnalysis: "Compartilhe dados ou situações para análise estratégica detalhada...",
      wAssistant: "Posso pesquisar, criar, analisar, ensinar, escrever, traduzir e muito mais. Qual é a sua necessidade?",
      wResearch: "Estou pronto para pesquisar qualquer assunto, criar resumos executivos, comparar tecnologias e analisar tendências.",
      wCode: "Especializado em web, mobile, APIs, banco de dados, arquitetura e boas práticas. Cole seu código ou descreva o que precisa.",
      wWriting: "Crio qualquer tipo de conteúdo: emails profissionais, artigos, posts, roteiros, relatórios. Também reviso e melhoro seus textos.",
      wAnalysis: "Analiso dados, métricas, decisões estratégicas e situações complexas. Quanto mais contexto você fornecer, mais precisa será a análise.",
    },
    en: {
      assistant: "Assistant", research: "Research", code: "Dev", writing: "Writing", analysis: "Analysis",
      pAssistant: "Ask anything or request help with any task...",
      pResearch: "Research any topic, request summaries, comparisons and analyses...",
      pCode: "Ask for code, debug help, refactors, architecture guidance...",
      pWriting: "Create emails, posts, scripts or ask for content review...",
      pAnalysis: "Share data or situations for strategic analysis...",
      wAssistant: "I can research, create, analyze, teach, write, translate and more. What do you need?",
      wResearch: "Ready to research any topic, build executive summaries and compare technologies.",
      wCode: "Specialized in web, mobile, APIs, databases, architecture and best practices.",
      wWriting: "I create high-quality content and can also review and improve your text.",
      wAnalysis: "I analyze data, metrics and decisions. More context gives better recommendations.",
    },
    es: {
      assistant: "Asistente", research: "Investigación", code: "Dev", writing: "Escritura", analysis: "Análisis",
      pAssistant: "Pregunta lo que quieras o pide ayuda con cualquier tarea...",
      pResearch: "Investiga cualquier tema, pide resúmenes, comparaciones y análisis...",
      pCode: "Pide código, ayuda de depuración, refactorización y arquitectura...",
      pWriting: "Crea emails, posts, guiones o pide revisión de contenido...",
      pAnalysis: "Comparte datos o situaciones para análisis estratégico...",
      wAssistant: "Puedo investigar, crear, analizar, enseñar, escribir, traducir y más. ¿Qué necesitas?",
      wResearch: "Listo para investigar cualquier tema, crear resúmenes y comparar tecnologías.",
      wCode: "Especializado en web, mobile, APIs, bases de datos, arquitectura y buenas prácticas.",
      wWriting: "Creo contenido de calidad y también puedo revisar y mejorar tus textos.",
      wAnalysis: "Analizo datos, métricas y decisiones. Más contexto = recomendaciones más precisas.",
    },
    fr: {
      assistant: "Assistant", research: "Recherche", code: "Dev", writing: "Rédaction", analysis: "Analyse",
      pAssistant: "Posez n'importe quelle question ou demandez de l'aide...",
      pResearch: "Recherchez n'importe quel sujet, demandez des résumés et comparaisons...",
      pCode: "Demandez du code, du debug, du refactoring et des conseils d'architecture...",
      pWriting: "Créez des emails, posts, scripts ou demandez une révision...",
      pAnalysis: "Partagez des données ou situations pour une analyse stratégique...",
      wAssistant: "Je peux rechercher, créer, analyser, enseigner, rédiger, traduire et plus. Que souhaitez-vous ?",
      wResearch: "Prêt à rechercher tout sujet, créer des synthèses et comparer des technologies.",
      wCode: "Spécialisé web, mobile, API, bases de données, architecture et bonnes pratiques.",
      wWriting: "Je crée du contenu de qualité et peux aussi améliorer vos textes.",
      wAnalysis: "J'analyse données, métriques et décisions. Plus de contexte = meilleure analyse.",
    },
  }[lang];

  const quick = {
    pt: {
      assistant: [
        { label: "Me ensine algo", prompt: "Qual conceito você pode me ensinar em 5 minutos, com exemplos simples e aplicáveis?" },
        { label: "Plano de negócios", prompt: "Me ajude a montar um plano de negócios enxuto para uma startup de tecnologia." },
        { label: "Brainstorm", prompt: "Me dê 10 ideias criativas para melhorar produtividade em trabalho remoto." },
        { label: "Resolver problema", prompt: "Vou descrever um problema real. Me ajude com diagnóstico e plano de ação prático." },
      ],
      research: [
        { label: "Tendências IA", prompt: "Quais são as principais tendências de IA em 2026? Resuma com impacto prático." },
        { label: "Comparar stacks", prompt: "Compare React, Vue e Angular para produto SaaS moderno, com critérios objetivos." },
        { label: "Explicar tema", prompt: "Explique computação quântica em linguagem simples e com analogias." },
        { label: "Mercado Brasil", prompt: "Analise o mercado de startups tech no Brasil: oportunidades, riscos e nichos." },
      ],
      code: [
        { label: "Revisão de código", prompt: "Vou colar código. Faça review focando segurança, performance e legibilidade." },
        { label: "Autenticação", prompt: "Como implementar autenticação segura com JWT + refresh token + RBAC?" },
        { label: "Performance Next.js", prompt: "Quais otimizações práticas devo aplicar em Next.js para produção?" },
        { label: "Arquitetura", prompt: "Me ajude a desenhar arquitetura escalável para app web com API e filas." },
      ],
      writing: [
        { label: "Email profissional", prompt: "Escreva um email profissional para propor parceria comercial." },
        { label: "Post LinkedIn", prompt: "Crie um post para LinkedIn sobre inovação digital com CTA forte." },
        { label: "Revisar texto", prompt: "Vou colar um texto. Melhore clareza, gramática e impacto mantendo meu tom." },
        { label: "Roteiro vídeo", prompt: "Crie roteiro de vídeo curto explicando IA para público leigo." },
      ],
      analysis: [
        { label: "KPIs SaaS", prompt: "Quais KPIs devo acompanhar em um SaaS B2B e como definir metas realistas?" },
        { label: "Análise SWOT", prompt: "Faça uma SWOT para uma startup entrando no mercado de e-commerce." },
        { label: "Decisão estratégica", prompt: "Contratar equipe ou automatizar processos primeiro? Estruture a decisão." },
        { label: "Métricas", prompt: "Como interpretar CAC, LTV e churn para avaliar saúde do negócio?" },
      ],
    },
    en: {
      assistant: [
        { label: "Teach me something", prompt: "Teach me one useful concept in 5 minutes with simple examples." },
        { label: "Business plan", prompt: "Help me create a lean business plan for a tech startup." },
        { label: "Brainstorm", prompt: "Give me 10 creative ideas to improve remote team productivity." },
        { label: "Solve a problem", prompt: "I will describe a real problem. Help me with diagnosis and an action plan." },
      ],
      research: [
        { label: "AI trends", prompt: "What are the top AI trends in 2026? Summarize practical impact." },
        { label: "Compare stacks", prompt: "Compare React, Vue and Angular for a modern SaaS product." },
        { label: "Explain topic", prompt: "Explain quantum computing in simple language with analogies." },
        { label: "Brazil market", prompt: "Analyze Brazil's tech startup market: opportunities, risks and niches." },
      ],
      code: [
        { label: "Code review", prompt: "I will paste code. Review it for security, performance and readability." },
        { label: "Authentication", prompt: "How to implement secure auth with JWT, refresh tokens and RBAC?" },
        { label: "Next.js performance", prompt: "What practical optimizations should I apply in Next.js production?" },
        { label: "Architecture", prompt: "Help me design a scalable architecture for web app + API + queues." },
      ],
      writing: [
        { label: "Professional email", prompt: "Write a professional email proposing a strategic partnership." },
        { label: "LinkedIn post", prompt: "Create a LinkedIn post about digital innovation with strong CTA." },
        { label: "Review text", prompt: "I will paste text. Improve grammar, clarity and impact." },
        { label: "Video script", prompt: "Create a short video script explaining AI for non-technical audience." },
      ],
      analysis: [
        { label: "SaaS KPIs", prompt: "Which KPIs should I track in B2B SaaS and how to set realistic goals?" },
        { label: "SWOT analysis", prompt: "Create a SWOT analysis for a startup entering e-commerce market." },
        { label: "Strategic decision", prompt: "Hire more people or automate first? Structure the decision." },
        { label: "Metrics", prompt: "How to interpret CAC, LTV and churn to evaluate business health?" },
      ],
    },
    es: {
      assistant: [
        { label: "Enséñame algo", prompt: "Enséñame un concepto útil en 5 minutos con ejemplos simples." },
        { label: "Plan de negocio", prompt: "Ayúdame a crear un plan de negocio lean para una startup tech." },
        { label: "Lluvia de ideas", prompt: "Dame 10 ideas creativas para mejorar productividad remota." },
        { label: "Resolver problema", prompt: "Te describo un problema real. Ayúdame con diagnóstico y plan de acción." },
      ],
      research: [
        { label: "Tendencias IA", prompt: "¿Cuáles son las principales tendencias de IA en 2026?" },
        { label: "Comparar stacks", prompt: "Compara React, Vue y Angular para un SaaS moderno." },
        { label: "Explicar tema", prompt: "Explica computación cuántica con lenguaje simple y analogías." },
        { label: "Mercado Brasil", prompt: "Analiza el mercado de startups tech en Brasil." },
      ],
      code: [
        { label: "Revisión de código", prompt: "Voy a pegar código. Revísalo en seguridad, performance y legibilidad." },
        { label: "Autenticación", prompt: "¿Cómo implementar auth segura con JWT, refresh tokens y RBAC?" },
        { label: "Performance Next.js", prompt: "¿Qué optimizaciones prácticas aplicar en Next.js en producción?" },
        { label: "Arquitectura", prompt: "Ayúdame a diseñar arquitectura escalable para web app + API + colas." },
      ],
      writing: [
        { label: "Email profesional", prompt: "Escribe un email profesional para proponer una alianza comercial." },
        { label: "Post LinkedIn", prompt: "Crea un post para LinkedIn sobre innovación digital con CTA." },
        { label: "Revisar texto", prompt: "Voy a pegar un texto. Mejora gramática, claridad e impacto." },
        { label: "Guion de video", prompt: "Crea un guion corto explicando IA para público no técnico." },
      ],
      analysis: [
        { label: "KPIs SaaS", prompt: "¿Qué KPIs debo seguir en SaaS B2B y cómo definir metas realistas?" },
        { label: "Análisis SWOT", prompt: "Haz un SWOT para una startup que entra en e-commerce." },
        { label: "Decisión estratégica", prompt: "¿Contratar equipo o automatizar primero? Estructura la decisión." },
        { label: "Métricas", prompt: "¿Cómo interpretar CAC, LTV y churn para evaluar salud del negocio?" },
      ],
    },
    fr: {
      assistant: [
        { label: "Apprends-moi", prompt: "Apprends-moi un concept utile en 5 minutes avec exemples simples." },
        { label: "Plan business", prompt: "Aide-moi à créer un business plan lean pour startup tech." },
        { label: "Brainstorm", prompt: "Donne-moi 10 idées créatives pour améliorer productivité à distance." },
        { label: "Résoudre problème", prompt: "Je décris un problème réel. Donne diagnostic et plan d'action." },
      ],
      research: [
        { label: "Tendances IA", prompt: "Quelles sont les principales tendances IA en 2026 ?" },
        { label: "Comparer stacks", prompt: "Compare React, Vue et Angular pour un SaaS moderne." },
        { label: "Expliquer sujet", prompt: "Explique l'informatique quantique simplement avec analogies." },
        { label: "Marché Brésil", prompt: "Analyse le marché des startups tech au Brésil." },
      ],
      code: [
        { label: "Code review", prompt: "Je colle du code. Fais une review sécurité, performance, lisibilité." },
        { label: "Authentification", prompt: "Comment implémenter auth sécurisée avec JWT + refresh + RBAC ?" },
        { label: "Perf Next.js", prompt: "Quelles optimisations pratiques pour Next.js en production ?" },
        { label: "Architecture", prompt: "Aide-moi à concevoir une architecture scalable web app + API + files." },
      ],
      writing: [
        { label: "Email pro", prompt: "Rédige un email professionnel pour proposer un partenariat." },
        { label: "Post LinkedIn", prompt: "Crée un post LinkedIn sur innovation digitale avec CTA." },
        { label: "Réviser texte", prompt: "Je colle un texte. Améliore grammaire, clarté et impact." },
        { label: "Script vidéo", prompt: "Crée un script court expliquant l'IA à un public non technique." },
      ],
      analysis: [
        { label: "KPIs SaaS", prompt: "Quels KPIs suivre en SaaS B2B et comment fixer des objectifs réalistes ?" },
        { label: "Analyse SWOT", prompt: "Fais une SWOT pour startup entrant sur e-commerce." },
        { label: "Décision stratégique", prompt: "Recruter ou automatiser d'abord ? Structure la décision." },
        { label: "Métriques", prompt: "Comment interpréter CAC, LTV et churn pour la santé business ?" },
      ],
    },
  }[lang];
  return [
    { id: "assistant", label: copy.assistant, icon: Sparkles, placeholder: copy.pAssistant, welcomeExtra: copy.wAssistant, quickActions: quick.assistant.map((a, idx) => ({ icon: [Lightbulb, Globe, Bot, Wand2][idx], label: a.label, prompt: a.prompt })) },
    { id: "research", label: copy.research, icon: Search, placeholder: copy.pResearch, welcomeExtra: copy.wResearch, quickActions: quick.research.map((a, idx) => ({ icon: [Search, Globe, Lightbulb, BarChart3][idx], label: a.label, prompt: a.prompt })) },
    { id: "code", label: copy.code, icon: Code2, placeholder: copy.pCode, welcomeExtra: copy.wCode, quickActions: quick.code.map((a, idx) => ({ icon: [Wand2, Code2, Sparkles, Lightbulb][idx], label: a.label, prompt: a.prompt })) },
    { id: "writing", label: copy.writing, icon: FileText, placeholder: copy.pWriting, welcomeExtra: copy.wWriting, quickActions: quick.writing.map((a, idx) => ({ icon: [FileText, Globe, Wand2, Sparkles][idx], label: a.label, prompt: a.prompt })) },
    { id: "analysis", label: copy.analysis, icon: BarChart3, placeholder: copy.pAnalysis, welcomeExtra: copy.wAnalysis, quickActions: quick.analysis.map((a, idx) => ({ icon: [BarChart3, Lightbulb, Globe, Sparkles][idx], label: a.label, prompt: a.prompt })) },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMessage(content: string) {
  const codeBlocks: string[] = [];
  const withPlaceholders = content.replace(/```(?:\w+)?\n([\s\S]*?)```/g, (_match, code) => {
    codeBlocks.push(code);
    return `\x00CODE${codeBlocks.length - 1}\x00`;
  });

  const escaped = escapeHtml(withPlaceholders);

  const withCode = escaped.replace(/\x00CODE(\d+)\x00/g, (_match, idx) => {
    const code = escapeHtml(codeBlocks[parseInt(idx)] ?? "");
    return `<pre class="code-block bg-ink/[0.04] border border-ink-15 rounded-xl p-4 my-3 overflow-x-auto text-xs text-ink code-font">${code}</pre>`;
  });

  return withCode
    .replace(/`([^`]+)`/g, '<code class="bg-ink/[0.06] border border-ink-15 px-1.5 py-0.5 rounded text-gold text-xs code-font">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-ink font-semibold">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="text-ink-60 italic">$1</em>')
    .replace(/^### (.+)$/gm, '<h3 class="text-ink font-semibold text-sm mt-4 mb-1.5">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-ink font-semibold text-base mt-4 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-ink font-bold text-lg mt-4 mb-2">$1</h1>')
    .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 my-1 text-ink-60"><span class="text-gold/80 mt-1 shrink-0">·</span><span>$1</span></li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="flex items-start gap-2 my-1 text-ink-60"><span class="text-gold/80 font-mono text-xs mt-0.5 shrink-0">$1.</span><span>$2</span></li>')
    .replace(/\n\n/g, '</p><p class="mb-2 leading-relaxed text-ink-60">')
    .replace(/\n/g, "<br/>");
}

function extractCode(content: string): string | null {
  const matches = [...content.matchAll(/```(?:\w+)?\n([\s\S]*?)```/g)];
  if (!matches.length) return null;
  return matches.reduce((longest, m) => (m[1].length > longest.length ? m[1] : longest), "");
}

const WELCOME_ID = "welcome";

function buildWelcome(mode: ModeConfig, projectContext: string, lang: "pt" | "en" | "es" | "fr"): ChatMessage {
  const modeLabel = mode.label;
  const text = {
    pt: {
      hello: "Olá! Sou o **NeuroCode AI**, seu assistente de inteligência artificial.",
      currentMode: "Modo atual",
      withCtx: "Tenho o contexto do seu projeto carregado. Como posso ajudar?",
      noCtx: "Como posso te ajudar hoje?",
    },
    en: {
      hello: "Hi! I am **NeuroCode AI**, your AI assistant.",
      currentMode: "Current mode",
      withCtx: "I have your project context loaded. How can I help?",
      noCtx: "How can I help you today?",
    },
    es: {
      hello: "¡Hola! Soy **NeuroCode AI**, tu asistente de inteligencia artificial.",
      currentMode: "Modo actual",
      withCtx: "Tengo el contexto de tu proyecto cargado. ¿Cómo puedo ayudarte?",
      noCtx: "¿Cómo puedo ayudarte hoy?",
    },
    fr: {
      hello: "Bonjour ! Je suis **NeuroCode AI**, votre assistant IA.",
      currentMode: "Mode actuel",
      withCtx: "Le contexte de votre projet est chargé. Comment puis-je vous aider ?",
      noCtx: "Comment puis-je vous aider aujourd'hui ?",
    },
  }[lang];
  return {
    id: WELCOME_ID,
    role: "assistant",
    content: `${text.hello}

${text.currentMode}: **${modeLabel}**
${mode.welcomeExtra}

${projectContext ? text.withCtx : text.noCtx}`,
    timestamp: Date.now(),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AIChat({
  projectContext = "",
  projectId,
  variant = "default",
}: {
  projectContext?: string;
  projectId?: string;
  /** Compact chrome for dashboard dock / embedded panels */
  variant?: "default" | "minimal";
}) {
  const { language } = useLanguage();
  const lang = (language as "pt" | "en" | "es" | "fr") ?? "pt";
  const MODES = getModes(lang);
  const i18n = {
    pt: { clear: "Limpar conversa", copied: "Copiado", copy: "Copiar", saving: "Salvando...", saveProject: "Salvar no projeto", saveConversation: "Guardar no Dashboard", savingConversation: "A guardar…", savedConversation: "Conversa guardada em Meus projetos", saveConversationError: "Não foi possível guardar", saveConversationNeedMessages: "Envie pelo menos uma pergunta e uma resposta para guardar.", error: "Ocorreu um erro. Por favor, tente novamente.", suggestions: "Sugestões", enterHint: "Enter para enviar · Shift+Enter para nova linha", localHistory: " · Histórico salvo localmente", projectContext: "Contexto do projeto", responseError: "Erro na resposta", processError: "Erro ao processar mensagem", saved: "Código salvo no projeto!", saveError: "Erro ao salvar código", saveConnectionError: "Erro de conexão ao salvar código", stop: "Parar", retry: "Tentar novamente", cancelled: "Geração interrompida." },
    en: { clear: "Clear chat", copied: "Copied", copy: "Copy", saving: "Saving...", saveProject: "Save to project", saveConversation: "Save to Dashboard", savingConversation: "Saving…", savedConversation: "Conversation saved in My projects", saveConversationError: "Could not save", saveConversationNeedMessages: "Send at least one Q&A pair to save.", error: "An error occurred. Please try again.", suggestions: "Suggestions", enterHint: "Enter to send · Shift+Enter for new line", localHistory: " · History saved locally", responseError: "Response error", processError: "Processing error", projectContext: "Project context", saved: "Code saved to project!", saveError: "Failed to save code", saveConnectionError: "Connection error while saving code", stop: "Stop", retry: "Retry", cancelled: "Generation stopped." },
    es: { clear: "Limpiar conversación", copied: "Copiado", copy: "Copiar", saving: "Guardando...", saveProject: "Guardar en proyecto", saveConversation: "Guardar en el panel", savingConversation: "Guardando…", savedConversation: "Conversación guardada en Mis proyectos", saveConversationError: "No se pudo guardar", saveConversationNeedMessages: "Envía al menos una pregunta y una respuesta.", error: "Ocurrió un error. Inténtalo de nuevo.", suggestions: "Sugerencias", enterHint: "Enter para enviar · Shift+Enter para nueva línea", localHistory: " · Historial guardado localmente", responseError: "Error en la respuesta", processError: "Error al procesar", projectContext: "Contexto del proyecto", saved: "¡Código guardado en el proyecto!", saveError: "Error al guardar código", saveConnectionError: "Error de conexión al guardar código", stop: "Detener", retry: "Reintentar", cancelled: "Generación detenida." },
    fr: { clear: "Effacer la conversation", copied: "Copié", copy: "Copier", saving: "Enregistrement...", saveProject: "Enregistrer dans le projet", saveConversation: "Enregistrer dans le tableau de bord", savingConversation: "Enregistrement…", savedConversation: "Conversation enregistrée dans Mes projets", saveConversationError: "Impossible d'enregistrer", saveConversationNeedMessages: "Envoyez au moins une question et une réponse.", error: "Une erreur est survenue. Veuillez réessayer.", suggestions: "Suggestions", enterHint: "Entrée pour envoyer · Shift+Entrée pour nouvelle ligne", localHistory: " · Historique enregistré localement", responseError: "Erreur de réponse", processError: "Erreur de traitement", projectContext: "Contexte du projet", saved: "Code enregistré dans le projet !", saveError: "Erreur lors de l'enregistrement du code", saveConnectionError: "Erreur de connexion lors de l'enregistrement", stop: "Arrêter", retry: "Réessayer", cancelled: "Génération interrompue." },
  }[lang];
  const storageKey = projectId ? `ai-chat-${projectId}` : "ai-chat-general";
  const storedModeKey = `ai-chat-mode-${projectId ?? "general"}`;

  const [activeMode, setActiveMode] = useState<Mode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(storedModeKey) as Mode) ?? "assistant";
    }
    return "assistant";
  });

  const mode = MODES.find((m) => m.id === activeMode) ?? MODES[0];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed: ChatMessage[] = JSON.parse(saved);
          if (parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [buildWelcome(mode, projectContext, lang)];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingConversation, setSavingConversation] = useState(false);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserTextRef = useRef<string>("");
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Persist messages
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(messages)); } catch {}
  }, [messages, storageKey]);

  // Persist mode
  useEffect(() => {
    try { localStorage.setItem(storedModeKey, activeMode); } catch {}
  }, [activeMode, storedModeKey]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const switchMode = useCallback((newMode: Mode) => {
    setActiveMode(newMode);
    const newModeConfig = MODES.find((m) => m.id === newMode) ?? MODES[0];
    setMessages([buildWelcome(newModeConfig, projectContext, lang)]);
    try { localStorage.removeItem(storageKey); } catch {}
  }, [projectContext, storageKey, MODES, lang]);

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(async (overridePrompt?: string) => {
    const messageText = overridePrompt ?? input.trim();
    if (!messageText || isLoading) return;

    abortControllerRef.current?.abort();
    const ac = new AbortController();
    abortControllerRef.current = ac;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      timestamp: Date.now(),
    };

    lastUserTextRef.current = messageText;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", timestamp: Date.now() },
    ]);

    const historyPayload = [
      ...(projectContext
        ? [{ role: "user" as const, content: `${i18n.projectContext}: ${projectContext}` }]
        : []),
      ...messagesRef.current
        .filter((m) => m.id !== WELCOME_ID)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: messageText },
    ];

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ac.signal,
        body: JSON.stringify({
          mode: activeMode,
          language: lang,
          messages: historyPayload,
        }),
      });

      if (!response.ok) throw new Error(i18n.responseError);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      const STREAM_ERROR_PREFIX = "\x00__ERR__:";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        if (chunk.includes(STREAM_ERROR_PREFIX)) {
          throw new Error(chunk.split(STREAM_ERROR_PREFIX)[1]?.trim() ?? i18n.processError);
        }
        fullText += chunk;
        if (isMounted.current) {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: fullText } : m))
          );
        }
      }
    } catch (e) {
      const err = e as Error;
      if (err.name === "AbortError") {
        if (isMounted.current) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: m.content.trim()
                      ? `${m.content}\n\n${i18n.cancelled}`
                      : i18n.cancelled,
                  }
                : m
            )
          );
        }
      } else if (isMounted.current) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: i18n.error } : m
          )
        );
      }
    } finally {
      abortControllerRef.current = null;
      if (isMounted.current) {
        setIsLoading(false);
        textareaRef.current?.focus();
      }
    }
    // i18n.* muda referência a cada render; mensagens vêm do mesmo bloco lang
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps estáveis: input, isLoading, projectContext, activeMode, lang
  }, [input, isLoading, projectContext, activeMode, lang]);

  const retryLast = useCallback(() => {
    const t = lastUserTextRef.current;
    if (!t.trim() || isLoading) return;
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last?.role === "assistant" && last.content === i18n.error) {
        next.pop();
      }
      const u = next[next.length - 1];
      if (u?.role === "user" && u.content === t) {
        next.pop();
      }
      return next;
    });
    setTimeout(() => sendMessage(t), 0);
  }, [isLoading, i18n.error, sendMessage]);

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const saveCodeToProject = async (messageId: string, content: string) => {
    if (!projectId) return;
    const code = extractCode(content);
    if (!code) return;
    setSavingId(messageId);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generated_code: { refined: true, content: code }, status: "completed" }),
      });
      if (res.ok) toast.success(i18n.saved);
      else toast.error(i18n.saveError);
    } catch {
      toast.error(i18n.saveConnectionError);
    } finally {
      setSavingId(null);
    }
  };

  const clearChat = () => {
    const fresh = [buildWelcome(mode, projectContext, lang)];
    setMessages(fresh);
    try { localStorage.removeItem(storageKey); } catch {}
  };

  const saveConversationAsProject = useCallback(async () => {
    const substantive = messages.filter((m) => m.id !== WELCOME_ID);
    const userMsgs = substantive.filter((m) => m.role === "user" && m.content.trim());
    const asstMsgs = substantive.filter((m) => m.role === "assistant" && m.content.trim());
    if (userMsgs.length < 1 || asstMsgs.length < 1) {
      toast.error(i18n.saveConversationNeedMessages);
      return;
    }
    const md = substantive
      .map((m) => `## ${m.role === "user" ? "User" : "Assistant"}\n\n${m.content}`)
      .join("\n\n---\n\n");
    const firstUser = userMsgs[0]?.content ?? "Chat NeuroCode";
    const name =
      firstUser.length > 120 ? `${firstUser.slice(0, 117)}...` : firstUser;
    setSavingConversation(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: "Conversa guardada do Chat IA",
          type: "webapp",
          prompt: firstUser.slice(0, 5000),
          status: "completed",
          code_data: {
            summary: "Transcrição do Chat IA",
            files: [
              {
                path: "conversa.md",
                language: "markdown",
                content: md,
              },
            ],
          },
        }),
      });
      if (!res.ok) {
        toast.error(i18n.saveConversationError);
        return;
      }
      const data = (await res.json()) as { id?: string };
      toast.success(i18n.savedConversation);
      window.dispatchEvent(new Event("neurocode:dashboard-refresh"));
      if (data.id) {
        router.push(`/projects/${data.id}`);
      }
    } catch {
      toast.error(i18n.saveConversationError);
    } finally {
      setSavingConversation(false);
    }
  }, [messages, i18n, router]);

  const showQuickActions = variant !== "minimal" && messages.length <= 2 && !isLoading;
  const isMinimal = variant === "minimal";

  return (
    <div
      className={`flex flex-col h-full min-h-0 overflow-hidden rounded-2xl border border-ink-15 bg-cream-2/95 shadow-sm shadow-ink/[0.04] ${
        isMinimal ? "rounded-xl" : ""
      }`}
    >

      {/* ── Header ── */}
      <div className={`flex items-center justify-between border-b border-ink-15 bg-cream/80 ${isMinimal ? "px-3 py-2" : "px-4 py-3"}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className={`rounded-lg bg-ink flex items-center justify-center shrink-0 ${isMinimal ? "w-6 h-6" : "w-7 h-7"}`}>
            <Sparkles className={isMinimal ? "w-3 h-3 text-gold" : "w-3.5 h-3.5 text-gold"} />
          </div>
          <div className="min-w-0">
            <p className={`font-semibold text-ink leading-none truncate ${isMinimal ? "text-xs" : "text-sm"}`}>NeuroCode AI</p>
            {!isMinimal && (
              <p className="text-[10px] text-ink-35 mt-0.5 truncate">{mode.label}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!projectId && (
            <button
              type="button"
              onClick={() => void saveConversationAsProject()}
              disabled={savingConversation}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium text-gold hover:bg-gold/10 border border-gold/25 disabled:opacity-50"
              title={i18n.saveConversation}
            >
              {savingConversation ? (
                <span className="text-ink-35">{i18n.savingConversation}</span>
              ) : (
                <>
                  <FileText className={isMinimal ? "w-3 h-3" : "w-3.5 h-3.5"} />
                  <span className="hidden sm:inline">{i18n.saveConversation}</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-ink-35 hover:text-ink hover:bg-ink/[0.05] transition-all shrink-0"
            title={i18n.clear}
            type="button"
          >
            <Trash2 className={isMinimal ? "w-3 h-3" : "w-3.5 h-3.5"} />
          </button>
        </div>
      </div>

      {/* ── Mode selector ── */}
      {isMinimal ? (
        <div className="px-3 py-2 border-b border-ink-15 flex items-center gap-2">
          <label htmlFor="ai-chat-mode" className="sr-only">Mode</label>
          <select
            id="ai-chat-mode"
            value={activeMode}
            onChange={(e) => switchMode(e.target.value as Mode)}
            className="flex-1 min-w-0 text-xs bg-cream-2 border border-ink-15 rounded-lg px-2 py-1.5 text-ink outline-none focus:ring-2 focus:ring-gold/30"
          >
            {MODES.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="flex items-center gap-1 px-3 py-2 border-b border-ink-15 overflow-x-auto scrollbar-none bg-cream/50">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isActive = m.id === activeMode;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => switchMode(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-gold/[0.12] text-ink border border-gold/30"
                    : "text-ink-35 hover:text-ink hover:bg-ink/[0.04]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Messages ── */}
      <div className={`flex-1 min-h-0 overflow-y-auto space-y-5 scroll-smooth ${isMinimal ? "px-3 py-3" : "px-4 py-4"}`}>
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const hasCode = message.role === "assistant" && extractCode(message.content) !== null;
            const isUser = message.role === "user";

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 group ${isUser ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isUser ? "bg-gold/20 border border-gold/25" : "bg-ink border border-ink-15"
                }`}>
                  {isUser
                    ? <User className="w-3.5 h-3.5 text-ink" />
                    : <Sparkles className="w-3.5 h-3.5 text-gold" />
                  }
                </div>

                {/* Bubble */}
                <div className={`flex-1 min-w-0 max-w-[88%] ${isUser ? "flex flex-col items-end" : ""}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? "bg-gold/15 text-ink border border-gold/25 rounded-tr-sm"
                      : "bg-cream border border-ink-15 text-ink-60 rounded-tl-sm"
                  }`}>
                    {isUser ? (
                      <span className="whitespace-pre-wrap text-ink">{message.content}</span>
                    ) : message.content === "" ? (
                      <div className="flex gap-1 py-0.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-gold/60"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="prose-ai text-ink-60" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatMessage(message.content), { USE_PROFILES: { html: true } }) }} />
                    )}
                  </div>

                  {/* Actions */}
                  {message.content && (
                    <div className={`flex flex-wrap items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? "justify-end" : ""}`}>
                      <button
                        type="button"
                        onClick={() => copyMessage(message.id, message.content)}
                        className="flex items-center gap-1 text-[11px] text-ink-35 hover:text-ink"
                      >
                        {copiedId === message.id
                          ? <><Check className="w-3 h-3 text-emerald-600" /> {i18n.copied}</>
                          : <><Copy className="w-3 h-3" /> {i18n.copy}</>
                        }
                      </button>
                      {message.role === "assistant" && message.content === i18n.error && (
                        <button
                          type="button"
                          onClick={retryLast}
                          className="flex items-center gap-1 text-[11px] font-medium text-gold hover:underline"
                        >
                          {i18n.retry}
                        </button>
                      )}
                      {hasCode && projectId && (
                        <button
                          type="button"
                          onClick={() => saveCodeToProject(message.id, message.content)}
                          disabled={savingId === message.id}
                          className="flex items-center gap-1 text-[11px] text-gold hover:text-ink transition-colors disabled:opacity-40"
                        >
                          <Save className="w-3 h-3" />
                          {savingId === message.id ? i18n.saving : i18n.saveProject}
                        </button>
                      )}
                      <span className="text-[10px] text-ink-35">
                        {new Date(message.timestamp).toLocaleTimeString(lang === "en" ? "en-US" : lang === "es" ? "es-ES" : lang === "fr" ? "fr-FR" : "pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick actions (fixed strip above composer, scrolls internally if needed) ── */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="shrink-0 max-h-[7.5rem] overflow-y-auto border-t border-ink-15 bg-cream/90 px-3 py-2"
          >
            <p className="text-[10px] text-ink-35 uppercase tracking-wider mb-1.5 font-mono">{i18n.suggestions}</p>
            <div className={`grid gap-1.5 ${isMinimal ? "grid-cols-1" : "grid-cols-2"}`}>
              {mode.quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => sendMessage(action.prompt)}
                    className="flex items-start gap-2 p-2 rounded-xl border border-ink-15 bg-cream-2 hover:bg-ink/[0.03] hover:border-gold/20 text-left transition-all group"
                  >
                    <Icon className="w-3.5 h-3.5 text-ink-35 group-hover:text-gold transition-colors shrink-0 mt-0.5" />
                    <span className="text-xs text-ink-60 group-hover:text-ink transition-colors leading-tight">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input ── */}
      <div className={`shrink-0 border-t border-ink-15 bg-cream/95 backdrop-blur-sm ${isMinimal ? "px-3 pb-3 pt-2" : "px-4 pb-4 pt-3"}`}>
        <div className={`flex items-end ${isMinimal ? "gap-2" : "gap-2.5"}`}>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={mode.placeholder}
            className={`flex-1 resize-none text-sm text-ink bg-cream-2 border-ink-15 rounded-xl placeholder:text-ink-35 ${
              isMinimal ? "min-h-[40px] max-h-[100px] py-2 text-xs" : "min-h-[44px] max-h-[140px] py-3"
            }`}
            rows={1}
          />
          {isLoading ? (
            <Button
              type="button"
              onClick={stopGeneration}
              size="icon"
              variant="outline"
              className={`shrink-0 border-ink-15 ${isMinimal ? "h-9 w-9" : "h-11 w-11"}`}
              title={i18n.stop}
            >
              <Square className={isMinimal ? "w-3 h-3 fill-current" : "w-4 h-4 fill-current"} />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              size="icon"
              className={`shrink-0 bg-ink hover:bg-ink/90 text-cream disabled:opacity-30 ${isMinimal ? "h-9 w-9" : "h-11 w-11"}`}
            >
              <Send className={isMinimal ? "w-3.5 h-3.5" : "w-4 h-4"} />
            </Button>
          )}
        </div>
        {!isMinimal && (
          <p className="text-[10px] text-ink-35 mt-2 text-center">
            {i18n.enterHint}
            {projectId && i18n.localHistory}
          </p>
        )}
      </div>
    </div>
  );
}
