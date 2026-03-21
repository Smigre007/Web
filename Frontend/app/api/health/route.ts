import { NextResponse } from "next/server";
import { getMissingRequiredEnvVarNames } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const missingEnv = getMissingRequiredEnvVarNames();
  const checks = { db: false, env: missingEnv.length === 0 };

  try {
    const db = getSupabaseAdmin();
    const { error } = await db.from("users").select("id").limit(1);
    checks.db = !error;
  } catch {
    checks.db = false;
  }

  const allOk = checks.db && checks.env;
  const status = allOk ? "ok" : "degraded";

  return NextResponse.json(
    {
      status,
      checks,
      /** Presente quando env está incompleto — copie estes nomes para a Vercel (Environment Variables). */
      missingEnv: missingEnv.length > 0 ? missingEnv : undefined,
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 }
  );
}
