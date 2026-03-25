import { getMissingRequiredEnvVarNames, hasStripe } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export interface ReadinessState {
  envOk: boolean;
  dbOk: boolean;
  missingEnv: string[];
  stripeConfigured: boolean;
  anthropicKeyPresent: boolean;
}

export async function getReadinessState(): Promise<ReadinessState> {
  const missingEnv = getMissingRequiredEnvVarNames();
  let dbOk = false;
  try {
    const db = getSupabaseAdmin();
    const { error } = await db.from("users").select("id").limit(1);
    dbOk = !error;
  } catch {
    dbOk = false;
  }

  return {
    envOk: missingEnv.length === 0,
    dbOk,
    missingEnv,
    stripeConfigured: hasStripe(),
    anthropicKeyPresent: !!process.env.ANTHROPIC_API_KEY?.trim(),
  };
}

export function isReady(state: ReadinessState): boolean {
  return state.envOk && state.dbOk;
}
