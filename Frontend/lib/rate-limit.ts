/**
 * Persistent rate limiter backed by Supabase.
 * Falls back to in-memory if DB is unavailable.
 *
 * Requires the `rate_limits` table in Supabase (see schema.sql migration below).
 *
 * SQL migration:
 *   create table if not exists public.rate_limits (
 *     id         text primary key,       -- e.g. "contact:1.2.3.4"
 *     count      integer not null default 1,
 *     reset_at   timestamptz not null,
 *     created_at timestamptz not null default now()
 *   );
 *   create index if not exists rate_limits_reset_idx on public.rate_limits (reset_at);
 *   alter table public.rate_limits enable row level security;
 */

interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetAt: Date;
}

// In-memory fallback (single worker only)
const memoryStore = new Map<string, { count: number; resetAt: number }>();

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
): Promise<RateLimitResult> {
  // Try Supabase first
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/server");
    const db = getSupabaseAdmin();
    const now = new Date();
    const resetAt = new Date(now.getTime() + windowMs);

    // Upsert: increment count if key exists and not expired, otherwise reset
    const { data, error } = await db.rpc("upsert_rate_limit", {
      p_key: key,
      p_window_ms: windowMs,
      p_now: now.toISOString(),
      p_reset_at: resetAt.toISOString(),
    });

    if (!error && data !== null) {
      const count = data as number;
      return {
        limited: count > limit,
        remaining: Math.max(0, limit - count),
        resetAt,
      };
    }
  } catch {
    // Fall through to in-memory fallback
  }

  // In-memory fallback
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: limit - 1, resetAt: new Date(now + windowMs) };
  }

  entry.count++;

  return {
    limited: entry.count > limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: new Date(entry.resetAt),
  };
}
