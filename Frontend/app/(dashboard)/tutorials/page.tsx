"use client";

import { useState, useEffect, useCallback } from "react";
import {
  GraduationCap,
  Clock,
  ChevronRight,
  ChevronLeft,
  X,
  Lightbulb,
  CheckCircle2,
  Check,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TutorialStep {
  step: number;
  title: string;
  content: string;
}

interface Tutorial {
  id: number;
  category: string;
  color: string;
  title: string;
  desc: string;
  time: string;
  difficulty: "Iniciante" | "Intermediário" | "Avançado";
  steps: TutorialStep[];
  tip: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TUTORIALS: Tutorial[] = [
  {
    id: 1,
    category: "Iniciante",
    color: "#b8965a",
    title: "Seu primeiro website em 5 minutos",
    desc: "Aprenda a criar um site completo a partir de uma simples descrição de texto.",
    time: "5 min",
    difficulty: "Iniciante",
    steps: [
      {
        step: 1,
        title: "Acesse o Gerador",
        content:
          'Clique em "+ Novo Projeto" no dashboard e escolha o tipo "Website".',
      },
      {
        step: 2,
        title: "Descreva seu projeto",
        content:
          'Digite uma descrição detalhada: "Site para restaurante italiano com cardápio, reservas e localização".',
      },
      {
        step: 3,
        title: "Aguarde a geração",
        content:
          "A IA irá gerar todo o código HTML, CSS e JavaScript em cerca de 30 segundos.",
      },
      {
        step: 4,
        title: "Visualize e exporte",
        content:
          "Veja o preview em tempo real e exporte o ZIP com todos os arquivos prontos para uso.",
      },
    ],
    tip: "Quanto mais detalhada a descrição, melhor o resultado!",
  },
  {
    id: 2,
    category: "Marketing",
    color: "#d4b07a",
    title: "Landing pages que convertem",
    desc: "Crie landing pages otimizadas para conversão com CTA, depoimentos e formulários.",
    time: "8 min",
    difficulty: "Iniciante",
    steps: [
      {
        step: 1,
        title: "Escolha o tipo Landing Page",
        content:
          'No gerador, selecione "Landing Page" como tipo de projeto.',
      },
      {
        step: 2,
        title: "Inclua elementos de conversão",
        content:
          'Na descrição mencione: "Com seção de hero, benefícios, depoimentos, FAQ e CTA".',
      },
      {
        step: 3,
        title: "Defina cores e estilo",
        content:
          'Adicione: "Paleta de cores azul e branco, estilo minimalista e profissional".',
      },
      {
        step: 4,
        title: "Refine com o Chat",
        content:
          'Use a aba "Refinar com IA" para ajustar textos, cores e seções específicas.',
      },
    ],
    tip: "Mencione o público-alvo para obter textos mais persuasivos!",
  },
  {
    id: 3,
    category: "Frontend",
    color: "#8b7355",
    title: "Dashboard analítico completo",
    desc: "Gere dashboards com gráficos, tabelas e KPIs para visualização de dados.",
    time: "10 min",
    difficulty: "Intermediário",
    steps: [
      {
        step: 1,
        title: "Selecione Dashboard",
        content:
          'Escolha o tipo "Dashboard" e descreva os dados que deseja visualizar.',
      },
      {
        step: 2,
        title: "Especifique os componentes",
        content:
          'Mencione: "Com gráficos de linha, pizza, cards de KPI e tabela de usuários".',
      },
      {
        step: 3,
        title: "Defina a stack",
        content:
          'Adicione preferência de tecnologia: "React com Recharts e Tailwind CSS".',
      },
      {
        step: 4,
        title: "Personalize os dados",
        content:
          "Use o Chat para ajustar cores dos gráficos e adicionar dados de exemplo realistas.",
      },
    ],
    tip: "Dashboards ficam melhores com dados de exemplo realistas na descrição!",
  },
  {
    id: 4,
    category: "Backend",
    color: "#6b5a3e",
    title: "API REST segura e documentada",
    desc: "Crie APIs completas com autenticação, validação e documentação Swagger.",
    time: "12 min",
    difficulty: "Avançado",
    steps: [
      {
        step: 1,
        title: "Tipo API REST",
        content: "Selecione \"API\" e descreva os endpoints necessários.",
      },
      {
        step: 2,
        title: "Defina recursos e operações",
        content:
          'Ex: "API de e-commerce com produtos, pedidos e usuários. CRUD completo com autenticação JWT".',
      },
      {
        step: 3,
        title: "Solicite segurança",
        content:
          'Adicione: "Com validação de dados, rate limiting e documentação Swagger".',
      },
      {
        step: 4,
        title: "Revise a estrutura",
        content:
          "No Code Viewer, verifique models, routes e middleware gerados.",
      },
    ],
    tip: "Descreva as relações entre entidades para um schema de banco mais preciso!",
  },
  {
    id: 5,
    category: "Iniciante",
    color: "#c4a882",
    title: "Personalizando o código gerado",
    desc: "Aprenda a usar o chat de IA para refinar e personalizar qualquer aspecto do código.",
    time: "6 min",
    difficulty: "Iniciante",
    steps: [
      {
        step: 1,
        title: "Abra o projeto gerado",
        content: 'Clique no projeto e vá para a aba "Refinar com IA".',
      },
      {
        step: 2,
        title: "Faça pedidos específicos",
        content:
          'Ex: "Mude a cor primária para #3B82F6 e adicione animações suaves nas transições".',
      },
      {
        step: 3,
        title: "Itere rapidamente",
        content:
          "Cada mensagem gera uma nova versão do código preservando o histórico.",
      },
      {
        step: 4,
        title: "Salve versões",
        content:
          'Use "Histórico" para comparar versões e voltar a uma anterior se necessário.',
      },
    ],
    tip: "Seja específico nos pedidos: mencione o elemento, a mudança e o motivo!",
  },
  {
    id: 6,
    category: "SaaS",
    color: "#5a3d5a",
    title: "SaaS completo do zero ao deploy",
    desc: "Construa uma aplicação SaaS com auth, pagamentos e painel admin em um projeto.",
    time: "15 min",
    difficulty: "Avançado",
    steps: [
      {
        step: 1,
        title: "Selecione SaaS App",
        content:
          "Escolha \"SaaS\" e descreva sua ideia de produto detalhadamente.",
      },
      {
        step: 2,
        title: "Inclua funcionalidades core",
        content:
          '"Com autenticação de usuários, planos de assinatura Stripe, painel admin e API REST".',
      },
      {
        step: 3,
        title: "Defina a arquitetura",
        content:
          '"Stack: Next.js + Supabase + Stripe + Tailwind. Include schema SQL e migrations".',
      },
      {
        step: 4,
        title: "Configure e faça deploy",
        content:
          "Siga o README gerado para configurar variáveis de ambiente e fazer deploy na Vercel.",
      },
    ],
    tip: "Peça ao gerador para incluir um README completo com instruções de setup!",
  },
  {
    id: 7,
    category: "Mobile",
    color: "#3d5a3e",
    title: "App mobile com React Native",
    desc: "Gere aplicativos mobile completos com navegação, estado e componentes nativos.",
    time: "12 min",
    difficulty: "Avançado",
    steps: [
      {
        step: 1,
        title: "Tipo Mobile",
        content:
          'Selecione "Mobile App" e descreva as telas e funcionalidades.',
      },
      {
        step: 2,
        title: "Liste as telas principais",
        content:
          '"App de fitness com telas: Login, Home, Treinos, Progresso e Perfil".',
      },
      {
        step: 3,
        title: "Especifique navegação",
        content:
          '"Com tab navigator inferior, stack navigator para detalhes e drawer menu".',
      },
      {
        step: 4,
        title: "Ajuste para a plataforma",
        content:
          "Use o Chat para adaptar componentes para iOS ou Android especificamente.",
      },
    ],
    tip: "Mencione se é Expo ou React Native CLI para código mais preciso!",
  },
  {
    id: 8,
    category: "Backend",
    color: "#3d3d5a",
    title: "Automação com scripts e bots",
    desc: "Crie scripts de automação, bots e pipelines de dados para tarefas repetitivas.",
    time: "8 min",
    difficulty: "Intermediário",
    steps: [
      {
        step: 1,
        title: "Tipo Automação",
        content: 'Selecione "Automation" e descreva a tarefa a automatizar.',
      },
      {
        step: 2,
        title: "Seja específico",
        content:
          '"Script Python que monitora um site a cada hora e envia email se mudar o preço".',
      },
      {
        step: 3,
        title: "Inclua integrações",
        content:
          'Mencione APIs externas: "Com integração Gmail API e notificação Slack".',
      },
      {
        step: 4,
        title: "Teste e adapte",
        content:
          "Revise o código gerado e use o Chat para adicionar tratamento de erros e logs.",
      },
    ],
    tip: "Inclua exemplos de input/output esperado para código mais preciso!",
  },
];

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES = [
  "Todos",
  "Iniciante",
  "Marketing",
  "Backend",
  "Frontend",
  "SaaS",
  "Mobile",
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_CHIP_COLORS: Record<Category, string> = {
  Todos: "bg-ink text-cream border-ink",
  Iniciante: "bg-yellow-500 text-white border-yellow-500",
  Marketing: "bg-amber-500 text-white border-amber-500",
  Backend: "bg-purple-600 text-white border-purple-600",
  Frontend: "bg-blue-500 text-white border-blue-500",
  SaaS: "bg-teal-600 text-white border-teal-600",
  Mobile: "bg-green-600 text-white border-green-600",
};

const DIFFICULTY_BADGE: Record<
  Tutorial["difficulty"],
  { label: string; classes: string }
> = {
  Iniciante: {
    label: "Iniciante",
    classes: "bg-green-50 border-green-200 text-green-700",
  },
  Intermediário: {
    label: "Intermediário",
    classes: "bg-blue-50 border-blue-200 text-blue-700",
  },
  Avançado: {
    label: "Avançado",
    classes: "bg-purple-50 border-purple-200 text-purple-700",
  },
};

const COMPLETED_KEY = "completed_tutorials";

// ─── Tutorial modal ───────────────────────────────────────────────────────────

function TutorialModal({
  tutorial,
  onClose,
  completed,
  onComplete,
}: {
  tutorial: Tutorial;
  onClose: () => void;
  completed: boolean;
  onComplete: (id: number) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = tutorial.steps.length;
  const step = tutorial.steps[currentStep];
  const isLast = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete(tutorial.id);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-cream border border-ink-15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-ink-15 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="text-xs px-2.5 py-0.5 rounded-full border font-medium text-white"
                style={{ backgroundColor: tutorial.color, borderColor: tutorial.color }}
              >
                {tutorial.category}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                  DIFFICULTY_BADGE[tutorial.difficulty].classes
                }`}
              >
                {DIFFICULTY_BADGE[tutorial.difficulty].label}
              </span>
              <span className="flex items-center gap-1 text-xs text-ink-35">
                <Clock className="w-3 h-3" />
                {tutorial.time}
              </span>
            </div>
            <h2 className="text-xl font-bold text-ink leading-tight">
              {tutorial.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-ink-15 flex items-center justify-center text-ink-35 hover:bg-cream-2 hover:text-ink transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step progress */}
        <div className="px-6 py-4 border-b border-ink-15 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-ink-35">
              Passo {currentStep + 1} de {totalSteps}
            </span>
            {completed && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Concluído
              </span>
            )}
          </div>
          <div className="flex gap-1.5">
            {tutorial.steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep
                    ? "flex-1 bg-ink"
                    : i < currentStep
                    ? "flex-1 bg-gold"
                    : "flex-1 bg-ink-15"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-ink text-cream text-sm font-bold flex items-center justify-center flex-shrink-0">
                {step.step}
              </div>
              <h3 className="text-lg font-bold text-ink">{step.title}</h3>
            </div>
            <p className="text-sm text-ink-35 leading-relaxed pl-11">
              {step.content}
            </p>
          </div>

          {/* Tip box (shown on last step) */}
          {isLast && (
            <div className="bg-gold/[0.08] border border-gold/30 rounded-xl p-4 flex items-start gap-3">
              <Lightbulb className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gold mb-1">
                  Dica do especialista
                </p>
                <p className="text-sm text-ink-35 leading-relaxed">
                  {tutorial.tip}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="p-5 border-t border-ink-15 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-2 border border-ink-15 rounded-xl px-4 py-2.5 text-sm text-ink-35 hover:bg-cream-2 hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <div className="flex-1" />

          {isLast ? (
            <Link
              href="/gerar"
              onClick={() => {
                onComplete(tutorial.id);
                onClose();
              }}
              className="inline-flex items-center gap-2 bg-ink text-cream rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-ink/80 transition-colors"
            >
              <Check className="w-4 h-4" />
              Começar Agora
            </Link>
          ) : (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 bg-ink text-cream rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-ink/80 transition-colors"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tutorial card ────────────────────────────────────────────────────────────

function TutorialCard({
  tutorial,
  completed,
  onClick,
}: {
  tutorial: Tutorial;
  completed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-2xl border border-ink-15 bg-cream hover:border-gold/40 hover:shadow-md transition-all overflow-hidden cursor-pointer"
    >
      {/* Top colored stripe */}
      <div
        className="h-2 w-full"
        style={{ backgroundColor: tutorial.color }}
      />

      <div className="p-5">
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="text-xs px-2.5 py-0.5 rounded-full border font-medium text-white"
            style={{
              backgroundColor: tutorial.color,
              borderColor: tutorial.color,
            }}
          >
            {tutorial.category}
          </span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
              DIFFICULTY_BADGE[tutorial.difficulty].classes
            }`}
          >
            {DIFFICULTY_BADGE[tutorial.difficulty].label}
          </span>
          {completed && (
            <span className="ml-auto inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 border border-green-200">
              <Check className="w-3 h-3 text-green-600" />
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-ink mb-1.5 leading-snug group-hover:text-gold transition-colors">
          {tutorial.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-ink-35 leading-relaxed line-clamp-2 mb-4">
          {tutorial.desc}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-ink-35">
            <Clock className="w-3.5 h-3.5" />
            {tutorial.time}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gold group-hover:gap-2 transition-all">
            Ver Tutorial
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TutorialsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("Todos");
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [completedIds, setCompletedIds] = useState<number[]>([]);

  // Load completed tutorials from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMPLETED_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as number[];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCompletedIds(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const markComplete = useCallback((id: number) => {
    setCompletedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(COMPLETED_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const filteredTutorials =
    activeCategory === "Todos"
      ? TUTORIALS
      : TUTORIALS.filter((t) => t.category === activeCategory);

  const progressPercent =
    TUTORIALS.length > 0
      ? Math.round((completedIds.length / TUTORIALS.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-4 py-8 md:px-8 space-y-8">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-gold" />
            </div>
            <h1 className="text-3xl font-bold text-ink">Centro de Aprendizado</h1>
          </div>
          <p className="text-sm text-ink-35 pl-0 md:pl-14">
            Domine a geração de código com IA em passos práticos
          </p>
        </div>

        {/* ── Progress banner ───────────────────────────────────────────── */}
        <div className="bg-cream border border-ink-15 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-ink">Seu progresso</p>
              <p className="text-xs text-ink-35">
                Você completou{" "}
                <span className="font-bold text-ink">{completedIds.length}</span>{" "}
                de{" "}
                <span className="font-bold text-ink">{TUTORIALS.length}</span>{" "}
                tutoriais
              </p>
            </div>
            <span className="text-2xl font-bold text-gold">{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full bg-cream-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {completedIds.length === TUTORIALS.length && TUTORIALS.length > 0 && (
            <p className="mt-3 text-xs text-green-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Parabéns! Você concluiu todos os tutoriais.
            </p>
          )}
        </div>

        {/* ── Category filter ───────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 py-2 bg-cream/95 backdrop-blur-sm -mx-4 px-4 md:-mx-8 md:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              const activeColor = CATEGORY_CHIP_COLORS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 text-sm px-4 py-2 rounded-xl border font-medium transition-all ${
                    isActive
                      ? activeColor
                      : "bg-cream-2 border-ink-15 text-ink-35 hover:bg-cream hover:text-ink"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tutorials grid ────────────────────────────────────────────── */}
        {filteredTutorials.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <GraduationCap className="w-10 h-10 text-ink-35" />
            <p className="text-sm text-ink-35">
              Nenhum tutorial encontrado para &quot;{activeCategory}&quot;
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTutorials.map((tutorial) => (
              <TutorialCard
                key={tutorial.id}
                tutorial={tutorial}
                completed={completedIds.includes(tutorial.id)}
                onClick={() => setActiveTutorial(tutorial)}
              />
            ))}
          </div>
        )}

        {/* ── Stats footer ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-ink-15">
          <div className="text-center">
            <p className="text-2xl font-bold text-ink">{TUTORIALS.length}</p>
            <p className="text-xs text-ink-35">Tutoriais disponíveis</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gold">{completedIds.length}</p>
            <p className="text-xs text-ink-35">Tutoriais concluídos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-ink">
              {TUTORIALS.reduce((acc, t) => acc + parseInt(t.time), 0)} min
            </p>
            <p className="text-xs text-ink-35">Tempo total de conteúdo</p>
          </div>
        </div>
      </div>

      {/* ── Tutorial modal ────────────────────────────────────────────── */}
      {activeTutorial && (
        <TutorialModal
          tutorial={activeTutorial}
          onClose={() => setActiveTutorial(null)}
          completed={completedIds.includes(activeTutorial.id)}
          onComplete={markComplete}
        />
      )}
    </div>
  );
}
