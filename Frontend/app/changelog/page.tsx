import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";

export const metadata: Metadata = {
  title: "Changelog — NeuroCode AI",
  description: "Acompanhe as últimas atualizações, melhorias e novidades do NeuroCode AI.",
};

type ChangeType = "feature" | "improvement" | "fix" | "security";

interface ChangelogEntry {
  version: string;
  date: string;
  changes: Array<{
    type: ChangeType;
    title: string;
    description: string;
  }>;
}

const TYPE_CONFIG: Record<ChangeType, { label: string; className: string }> = {
  feature:     { label: "Nova funcionalidade", className: "bg-gold/[0.12] text-gold border-gold/25" },
  improvement: { label: "Melhoria",            className: "bg-ink/[0.06] text-ink-60 border-ink-15" },
  fix:         { label: "Correção",            className: "bg-gold/[0.08] text-gold border-gold/20" },
  security:    { label: "Segurança",           className: "bg-[#b91c1c]/10 text-[#b91c1c] border-[#b91c1c]/20" },
};

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2.5.0",
    date: "17 mar 2026",
    changes: [
      {
        type: "feature",
        title: "GitHub Integration",
        description: "Envie seus projetos gerados diretamente para repositórios no GitHub com um clique. Requer plano Starter ou superior.",
      },
      {
        type: "feature",
        title: "Histórico de Versões",
        description: "Cada regeneração agora salva automaticamente uma versão anterior. Restaure qualquer versão com um clique. Free: 1 versão, Starter: 5, Pro: ilimitado.",
      },
      {
        type: "feature",
        title: "Programa de Indicações",
        description: "Indique amigos e ganhe 20% de comissão em cada assinatura convertida. Saques via Pix mensalmente.",
      },
      {
        type: "improvement",
        title: "Hero com Demo Interativa",
        description: "A landing page agora exibe uma demonstração ao vivo do NeuroCode AI funcionando — prompt digitando em tempo real, código sendo gerado e preview ao vivo.",
      },
      {
        type: "improvement",
        title: "Preview Real no Demo",
        description: "A aba Preview da demonstração agora renderiza um site real gerado por IA dentro de um iframe — não mais um mockup estático com emojis.",
      },
    ],
  },
  {
    version: "2.4.0",
    date: "3 mar 2026",
    changes: [
      {
        type: "feature",
        title: "NeuroCode AI Engine v2",
        description: "Nova versão do motor de IA proprietário do NeuroCode. Código gerado com melhor qualidade, arquitetura mais robusta e comentários mais detalhados.",
      },
      {
        type: "improvement",
        title: "Streaming mais rápido",
        description: "A geração de código agora tem latência 40% menor. O primeiro token aparece em menos de 2 segundos.",
      },
      {
        type: "fix",
        title: "Exportação ZIP",
        description: "Corrigido bug onde arquivos com caracteres especiais no nome quebravam o ZIP gerado.",
      },
    ],
  },
  {
    version: "2.3.0",
    date: "18 fev 2026",
    changes: [
      {
        type: "feature",
        title: "9 tipos de projeto",
        description: "Adicionados novos tipos: API, Automação e Plataforma. Cada tipo tem prompts otimizados para gerar código mais relevante.",
      },
      {
        type: "feature",
        title: "Command Palette",
        description: "Pressione ⌘K para acessar qualquer funcionalidade do dashboard rapidamente.",
      },
      {
        type: "improvement",
        title: "Dashboard redesenhado",
        description: "Interface do dashboard completamente repaginada com melhor organização de projetos e acesso rápido às ações principais.",
      },
    ],
  },
  {
    version: "2.2.0",
    date: "5 fev 2026",
    changes: [
      {
        type: "feature",
        title: "Chat de refinamento",
        description: "Após gerar um projeto, use o chat de IA para pedir modificações em linguagem natural. 'Muda a cor para azul' ou 'Adiciona autenticação' — a IA entende.",
      },
      {
        type: "security",
        title: "Verificação de webhook reforçada",
        description: "Todos os webhooks do Stripe e Clerk agora usam HMAC-SHA256 com validação de timestamp para prevenir replay attacks.",
      },
    ],
  },
  {
    version: "2.1.0",
    date: "22 jan 2026",
    changes: [
      {
        type: "feature",
        title: "Plano Enterprise",
        description: "Lançamento do plano Enterprise com gerações ilimitadas, white-label e SLA garantido de 99.9%.",
      },
      {
        type: "improvement",
        title: "Limites mensais automáticos",
        description: "Cron job reseta automaticamente o contador de gerações no primeiro dia de cada mês para todos os usuários.",
      },
    ],
  },
  {
    version: "2.0.0",
    date: "10 jan 2026",
    changes: [
      {
        type: "feature",
        title: "Lançamento do NeuroCode AI 2.0",
        description: "Plataforma completamente reescrita com Next.js 16, React 19 e Tailwind 4. Interface editorial premium, animações fluidas e arquitetura serverless.",
      },
      {
        type: "feature",
        title: "Preview em tempo real",
        description: "Veja seu projeto sendo renderizado em um iframe ao lado do código sendo gerado. Nenhuma ferramenta no mercado faz isso.",
      },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto py-16 px-6 pt-28">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-gold mb-3">
            Atualizações do produto
          </p>
          <h1 className="text-4xl font-bold text-ink mb-3">Changelog</h1>
          <p className="text-ink-60">
            Cada semana o NeuroCode AI fica melhor. Aqui você acompanha cada melhoria.
          </p>
        </div>

        {/* Entries */}
        <div className="space-y-12">
          {CHANGELOG.map((entry, i) => (
            <div key={entry.version} className="relative">
              {i < CHANGELOG.length - 1 && (
                <div className="absolute left-[11px] top-10 bottom-0 w-px bg-ink-15" />
              )}

              <div className="flex items-start gap-5">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                    i === 0
                      ? "border-gold bg-gold/[0.12]"
                      : "border-ink-15 bg-ink/[0.03]"
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-ink font-bold text-lg">{entry.version}</span>
                    {i === 0 && (
                      <span className="text-[10px] font-mono bg-gold/[0.10] text-gold px-2 py-0.5 rounded-full border border-gold/20">
                        Mais recente
                      </span>
                    )}
                    <span className="text-ink-35 text-sm font-mono ml-auto">{entry.date}</span>
                  </div>

                  <div className="space-y-4">
                    {entry.changes.map((change, j) => (
                      <div
                        key={j}
                        className="rounded-xl border border-ink-15 bg-ink/[0.02] p-4 hover:border-gold/20 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border flex-shrink-0 mt-0.5 ${
                              TYPE_CONFIG[change.type].className
                            }`}
                          >
                            {TYPE_CONFIG[change.type].label}
                          </span>
                          <div>
                            <p className="text-ink font-semibold text-sm mb-1">{change.title}</p>
                            <p className="text-ink-60 text-sm leading-relaxed">{change.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-ink-15 text-center">
          <p className="text-ink-35 text-sm font-mono">
            Tem uma sugestão? Acesse o{" "}
            <Link href="/roadmap" className="text-gold hover:text-gold-lt transition-colors">
              roadmap público
            </Link>{" "}
            e vote nas próximas funcionalidades.
          </p>
        </div>
      </div>
    </div>
  );
}
