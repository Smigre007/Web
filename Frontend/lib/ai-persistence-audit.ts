/**
 * Mapa de persistência: saídas de IA → tabela `projects` (Supabase).
 * Útil para onboarding de devs e auditorias — não alterar comportamento em runtime.
 */
export const AI_PERSISTENCE_AUDIT = {
  generateStream: {
    route: "POST /api/ai/generate",
    persists: "Cliente (generator-panel): cria draft status generating antes do stream; ao concluir PATCH/POST com generated_code completed.",
  },
  chatStream: {
    route: "POST /api/ai/chat",
    persists:
      "Não grava sozinho. ai-chat: saveCodeToProject → PATCH /api/projects/[id] quando há projectId. Mensagens sem projeto: localStorage; botão guardar conversa cria projeto.",
  },
  exportZip: {
    route: "GET /api/projects/[id]/export",
    persists: "Lê projeto existente; não gera novo output de IA.",
  },
  duplicate: {
    route: "POST /api/projects/[id]/duplicate",
    persists: "Copia generated_code para novo projeto.",
  },
} as const;
