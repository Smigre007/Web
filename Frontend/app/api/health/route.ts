import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ANTHROPIC_API_KEY",
  "CLERK_SECRET_KEY",
];

export async function GET() {
  const checks = { db: false, env: false };

  // Check required env vars
  checks.env = REQUIRED_ENV.every((key) => !!process.env[key]);

  // Check Supabase connectivity
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
    { status, checks, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 503 }
  );
}
