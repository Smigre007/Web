/**
 * Verifica se as tabelas core existem e são acessíveis com a service role.
 * CI/local: define SKIP_DB_SCHEMA_CHECK=1 para ignorar (sem credenciais reais).
 */
const { createClient } = require("@supabase/supabase-js");

const TABLES = ["users", "projects", "rate_limits", "contact_requests"];

async function main() {
  if (process.env.SKIP_DB_SCHEMA_CHECK === "1") {
    console.log("[db:check] SKIP_DB_SCHEMA_CHECK=1 — ignorado.");
    process.exit(0);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url?.trim() || !key?.trim()) {
    console.log("[db:check] SKIP — NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY em falta.");
    process.exit(0);
  }

  const db = createClient(url, key);

  for (const table of TABLES) {
    const { error } = await db.from(table).select("id").limit(1);
    if (error) {
      console.error(`[db:check] Falha em public.${table}:`, error.message);
      process.exit(1);
    }
  }

  const { error: rpcErr } = await db.rpc("upsert_rate_limit", {
    p_key: "__schema_check__",
    p_window_ms: 1000,
    p_now: new Date().toISOString(),
    p_reset_at: new Date(Date.now() + 1000).toISOString(),
  });

  if (rpcErr) {
    console.error("[db:check] RPC upsert_rate_limit:", rpcErr.message);
    process.exit(1);
  }

  await db.from("rate_limits").delete().eq("id", "__schema_check__");

  console.log("[db:check] OK — tabelas e RPC acessíveis.");
  process.exit(0);
}

main().catch((err) => {
  console.error("[db:check]", err);
  process.exit(1);
});
