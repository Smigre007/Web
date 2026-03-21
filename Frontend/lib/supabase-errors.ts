/**
 * Erros comuns do PostgREST/Supabase que indicam schema em falta no projeto.
 */

const SCHEMA_CACHE_PATTERNS =
  /schema cache|could not find the table|relation .* does not exist|PGRST205/i;

export function isMissingTableOrSchemaError(message: string | undefined): boolean {
  if (!message) return false;
  return SCHEMA_CACHE_PATTERNS.test(message);
}

/** Mensagem curta para APIs (JSON). */
export const SUPABASE_SETUP_REQUIRED_PT =
  "A tabela public.users não existe neste projeto Supabase. Abra o SQL Editor, execute o ficheiro NeuroCode-AI/Banco de dados/supabase/schema.sql (ou docs/supabase-setup.md) e recarregue a app.";
