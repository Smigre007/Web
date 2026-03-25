/**
 * Persistent rate limiter backed by Supabase RPC `upsert_rate_limit`.
 *
 * In production, if the RPC fails, we do **not** fall back to in-memory storage
 * (unreliable across serverless instances). Callers should return 503.
 *
 * In development and test, in-memory fallback keeps local DX when DB is absent.
 *
 * Requires `rate_limits` table and `upsert_rate_limit` — see
 * `Banco de dados/supabase/schema.sql`.
 */

import { isProduction } from "@/lib/env";

export type RateLimitOutcome =
  | { ok: true; limited: boolean; remaining: number; resetAt: Date }
  | { ok: false; reason: "backend_unavailable" };

// In-memory fallback (single process only — dev/test)
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function allowInMemoryFallback(): boolean {
  return !isProduction();
}

/**
 * Check and increment a rate limit counter.
 * @param key     Unique key, e.g. "contact:1.2.3.4"
 * @param limit   Max requests allowed in the window
 * @param windowMs  Window size in milliseconds
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitOutcome> {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/server");
    const db = getSupabaseAdmin();
    const now = new Date();
    const resetAt = new Date(now.getTime() + windowMs);

    const { data, error } = await db.rpc("upsert_rate_limit", {
      p_key: key,
      p_window_ms: windowMs,
      p_now: now.toISOString(),
      p_reset_at: resetAt.toISOString(),
    });

    if (!error && data !== null) {
      const count = data as number;
      return {
        ok: true,
        limited: count > limit,
        remaining: Math.max(0, limit - count),
        resetAt,
      };
    }
  } catch {
    // fall through
  }

  if (!allowInMemoryFallback()) {
    return { ok: false, reason: "backend_unavailable" };
  }

  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      ok: true,
      limited: false,
      remaining: limit - 1,
      resetAt: new Date(now + windowMs),
    };
  }

  entry.count++;

  return {
    ok: true,
    limited: entry.count > limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: new Date(entry.resetAt),
  };
}
