import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, Zap } from "lucide-react";

interface Props {
  params: Promise<{ tipo: string }>;
}

const SEO_PAGES: Record<string, {
  title: string;
  headline: string;
  description: string;
  keywords: string[];
  features: string[];
  examples: string[];
  previewEmoji: string;
  projectType: string;
  templatePrompt: string;
}> = {
  "site-para-restaurante": {
    title: "Criar Site para Restaurante com IA — Grátis | NeuroCode AI",
    headline: "Crie o site do seu restaurante com IA em 10 minutos",
    description: "Sem programar. Descreva seu restaurante e o NeuroCode AI gera um site completo com cardápio, reservas online, galeria de fotos e muito mais.",
    keywords: ["criar site restaurante", "site restaurante gratuito", "site delivery", "site para bar", "site para pizzaria"],
    features: [
      "Cardápio digital interativo",
      "Sistema de reservas online",
      "Galeria de fotos dos pratos",
      "Mapa e localização integrado",
      "WhatsApp para pedidos",
      "Design responsivo para celular",
      "SEO otimizado para Google",
    ],
    examples: ["Pizzaria Bella Napoli", "Churrascaria Gaúcha", "Restaurante Japonês Sakura", "Hamburgueria Artesanal"],
    previewEmoji: "🍽️",
    projectType: "landing",
    templatePrompt: "Crie um site profissional para restaurante com cardápio digital, sistema de reservas, galeria de fotos e localização no mapa",
  },
  "site-para-academia": {
    title: "Criar Site para Academia com IA | NeuroCode AI",
    headline: "Site profissional para academia em minutos",
    description: "Gere um site completo para sua academia ou personal trainer com IA. Planos, galeria, depoimentos e agendamento de aulas.",
    keywords: ["criar site academia", "site personal trainer", "site crossfit", "site pilates", "landing page academia"],
    features: [
      "Apresentação dos planos e preços",
      "Galeria de fotos da academia",
      "Agendamento de aula experimental",
      "Depoimentos de alunos",
      "Horários das modalidades",
      "Formulário de contato",
      "Integração com WhatsApp",
    ],
    examples: ["Academia FitLife", "CrossFit Zona Norte", "Studio Pilates Zen", "Personal Trainer SP"],
    previewEmoji: "💪",
    projectType: "landing",
    templatePrompt: "Crie um site profissional para academia com planos, galeria de fotos, horários de modalidades, depoimentos de alunos e agendamento de aula grátis",
  },
  "app-delivery": {
    title: "Criar App de Delivery com IA | NeuroCode AI",
    headline: "Crie seu app de delivery sem programar",
    description: "Sistema completo de delivery com cardápio online, carrinho de compras, pagamento e rastreio de pedidos — gerado por IA.",
    keywords: ["criar app delivery", "sistema delivery", "app pedidos online", "cardápio digital", "plataforma delivery"],
    features: [
      "Cardápio digital com categorias",
      "Carrinho de compras",
      "Pagamento integrado (Pix + cartão)",
      "Rastreio de pedido em tempo real",
      "Painel administrativo",
      "Notificações push",
      "Gestão de estoque",
    ],
    examples: ["iFood clone", "Delivery de marmita", "Sistema de sushi delivery", "App de lanches"],
    previewEmoji: "🛵",
    projectType: "webapp",
    templatePrompt: "Crie um sistema de delivery completo com cardápio digital, carrinho de compras, checkout com Pix e cartão, rastreio de pedido e painel admin",
  },
  "landing-page": {
    title: "Criar Landing Page com IA | NeuroCode AI",
    headline: "Landing page de alta conversão em minutos",
    description: "Descreva seu produto e o NeuroCode AI gera uma landing page otimizada para converter visitantes em clientes. Sem programar.",
    keywords: ["criar landing page", "landing page gratuita", "página de vendas", "landing page conversão", "site de vendas"],
    features: [
      "Hero section com CTA impactante",
      "Seção de benefícios e funcionalidades",
      "Prova social e depoimentos",
      "Preços e planos",
      "FAQ automático",
      "Formulário de captura de leads",
      "Integração com Google Analytics",
    ],
    examples: ["SaaS B2B", "Curso online", "Produto físico", "Serviço de consultoria"],
    previewEmoji: "🎯",
    projectType: "landing",
    templatePrompt: "Crie uma landing page de alta conversão com hero section, benefícios, depoimentos, preços, FAQ e formulário de captura",
  },
  "sistema-saas": {
    title: "Criar Sistema SaaS com IA | NeuroCode AI",
    headline: "Construa seu SaaS com IA — do zero ao MVP",
    description: "Gere um sistema SaaS completo com autenticação, dashboard, planos de assinatura e billing. Arquitetura production-ready em minutos.",
    keywords: ["criar saas", "sistema saas", "desenvolver saas", "plataforma saas", "mvp saas"],
    features: [
      "Autenticação e controle de acesso",
      "Dashboard com métricas",
      "Planos de assinatura (Stripe)",
      "Gerenciamento de usuários",
      "API REST documentada",
      "Sistema de notificações",
      "Multi-tenant architecture",
    ],
    examples: ["CRM para pequenas empresas", "Plataforma de RH", "Sistema de gestão escolar", "Ferramenta de marketing"],
    previewEmoji: "🚀",
    projectType: "saas",
    templatePrompt: "Crie um sistema SaaS completo com autenticação, dashboard de métricas, planos de assinatura com Stripe, gerenciamento de usuários e API REST",
  },
  "dashboard-analytics": {
    title: "Criar Dashboard de Analytics com IA | NeuroCode AI",
    headline: "Dashboard profissional de analytics em horas",
    description: "Gere dashboards interativos com gráficos, KPIs e relatórios usando IA. Conecte suas fontes de dados e visualize tudo em um lugar.",
    keywords: ["criar dashboard", "dashboard analytics", "painel de controle", "dashboard react", "dashboard kpi"],
    features: [
      "Gráficos de linha, barra e pizza",
      "KPIs em tempo real",
      "Filtros por período",
      "Tabelas com paginação",
      "Exportação para PDF/Excel",
      "Dark mode nativo",
      "Responsivo para mobile",
    ],
    examples: ["Analytics de e-commerce", "Dashboard financeiro", "Métricas de marketing", "KPIs de vendas"],
    previewEmoji: "📊",
    projectType: "dashboard",
    templatePrompt: "Crie um dashboard de analytics completo com gráficos de linha e barra, KPIs em tempo real, tabelas filtráveis e exportação de relatórios",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tipo } = await params;
  const page = SEO_PAGES[tipo];
  if (!page) return { title: "NeuroCode AI" };
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords.join(", "),
  };
}

export default async function CriarTipoPage({ params }: Props) {
  const { tipo } = await params;
  const page = SEO_PAGES[tipo];
  if (!page) notFound();

  const dashboardLink = `/sign-up?templatePrompt=${encodeURIComponent(page.templatePrompt)}&templateType=${page.projectType}`;

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="text-6xl mb-6">{page.previewEmoji}</div>
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-400 mb-4">
            NeuroCode AI · Motor de IA Proprietário
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-ink leading-tight mb-6">
            {page.headline}
          </h1>
          <p className="text-ink-60 text-lg font-serif font-light leading-relaxed mb-10 max-w-2xl mx-auto">
            {page.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={dashboardLink}
              className="inline-flex items-center justify-center gap-3 bg-ink text-cream px-8 py-4 font-mono text-[10px] uppercase tracking-[0.3em] hover:bg-gold transition-colors"
            >
              <Zap className="w-4 h-4" />
              Criar Agora — Grátis
            </Link>
            <Link
              href="/showcase"
              className="inline-flex items-center justify-center gap-2 text-[10px] text-ink-60 hover:text-ink font-mono uppercase tracking-[0.25em] transition-colors border-b border-ink-15 pb-0.5 hover:border-ink-35"
            >
              Ver exemplos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="text-center mb-10">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-ink-35 mb-3">
            O que será gerado
          </p>
          <h2 className="text-2xl font-serif font-light text-ink">
            Funcionalidades incluídas
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {page.features.map((f) => (
            <div
              key={f}
              className="flex items-center gap-3 p-4 rounded-xl border border-ink-15 bg-cream-2/80"
            >
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-ink-60">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Examples */}
      <div className="bg-ink/5 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-ink-35 mb-4">
            Exemplos do que você pode criar
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {page.examples.map((ex) => (
              <span
                key={ex}
                className="px-4 py-2 rounded-full border border-ink-15 bg-cream-2/80 text-sm text-ink-60 font-serif"
              >
                {ex}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-serif font-light text-ink">Como funciona</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { num: "01", title: "Descreva sua ideia", text: "Escreva em português o que você quer criar. Quanto mais detalhes, melhor o resultado." },
            { num: "02", title: "IA gera o código", text: "O NeuroCode AI Engine gera o código completo em segundos — você vê em tempo real enquanto é criado." },
            { num: "03", title: "Baixe ou publique", text: "Exporte como ZIP, faça push para GitHub ou publique direto no Vercel — tudo com um clique." },
          ].map((step) => (
            <div key={step.num} className="text-center">
              <div className="text-4xl font-black text-ink/10 mb-3">{step.num}</div>
              <h3 className="font-semibold text-ink mb-2">{step.title}</h3>
              <p className="text-sm text-ink-35 font-serif leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-ink py-16 px-6 text-center">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-cream/40 mb-4">Comece agora</p>
        <h2 className="text-3xl font-serif font-light text-cream mb-4">
          {page.headline}
        </h2>
        <p className="text-cream/50 mb-8 font-serif max-w-md mx-auto">
          3 projetos gratuitos por mês. Sem cartão de crédito. Sem instalar nada.
        </p>
        <Link
          href={dashboardLink}
          className="inline-flex items-center gap-3 bg-gold text-ink px-8 py-4 font-mono text-[10px] uppercase tracking-[0.3em] hover:bg-gold-lt transition-colors"
        >
          <Zap className="w-4 h-4" />
          Criar gratuitamente
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return Object.keys(SEO_PAGES).map((tipo) => ({ tipo }));
}
