import { z } from "zod";

export type RoadmapStatus = "done" | "building" | "planned";

export interface RoadmapItem {
  key: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  emoji: string;
}

/** Single source of truth for roadmap cards and API allowlist */
export const ROADMAP_ITEMS: readonly RoadmapItem[] = [
  { key: "neurocode-engine", title: "NeuroCode AI Engine", description: "Motor de IA proprietário com 32k tokens de contexto e geração otimizada para software", status: "done", emoji: "🤖" },
  { key: "stripe-billing", title: "Billing com Stripe", description: "Planos mensais e anuais, cancele quando quiser", status: "done", emoji: "💳" },
  { key: "realtime-preview", title: "Preview em Tempo Real", description: "Veja seu projeto sendo renderizado enquanto o código é gerado", status: "done", emoji: "👁️" },
  { key: "export-zip", title: "Export ZIP", description: "Baixe todo o projeto em um arquivo ZIP organizado", status: "done", emoji: "📦" },
  { key: "ai-chat", title: "Chat de Refinamento", description: "Peça melhorias em linguagem natural após gerar", status: "done", emoji: "💬" },
  { key: "github-integration", title: "GitHub Integration", description: "Push direto para repositórios do GitHub com um clique", status: "building", emoji: "🐙" },
  { key: "version-history", title: "Histórico de Versões", description: "Salve e restaure versões anteriores dos seus projetos", status: "building", emoji: "🕐" },
  { key: "referral-program", title: "Programa de Indicações", description: "Ganhe comissões indicando amigos para o NeuroCode", status: "building", emoji: "🎁" },
  { key: "vercel-deploy", title: "Deploy no Vercel", description: "Publique seu projeto online com um clique após o push no GitHub", status: "planned", emoji: "▲" },
  { key: "team-workspace", title: "Workspace de Times", description: "Colabore com sua equipe em projetos compartilhados", status: "planned", emoji: "👥" },
  { key: "api-access", title: "API Pública", description: "Integre o NeuroCode AI nas suas próprias aplicações via API", status: "planned", emoji: "🔌" },
  { key: "template-marketplace", title: "Marketplace de Templates", description: "Biblioteca de templates prontos para os mais comuns tipos de negócio", status: "planned", emoji: "🗂️" },
  { key: "mobile-app", title: "App Mobile", description: "NeuroCode AI no seu celular — iOS e Android", status: "planned", emoji: "📱" },
  { key: "white-label", title: "White-Label", description: "Rode o NeuroCode sob sua própria marca para sua empresa ou agência", status: "planned", emoji: "🏷️" },
  { key: "figma-import", title: "Importar do Figma", description: "Converta designs do Figma diretamente em código funcional", status: "planned", emoji: "🎨" },
  { key: "multi-model", title: "Multi-Model", description: "Múltiplos motores de IA especializados por tipo de projeto", status: "planned", emoji: "🧠" },
];

const keysTuple = ROADMAP_ITEMS.map((i) => i.key) as [string, ...string[]];

export const roadmapFeatureKeySchema = z.enum(keysTuple);

export type RoadmapFeatureKey = z.infer<typeof roadmapFeatureKeySchema>;
