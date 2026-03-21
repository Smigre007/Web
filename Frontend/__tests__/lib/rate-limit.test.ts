import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock getSupabaseAdmin to force fallback to in-memory
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: () => { throw new Error("DB not available"); },
}));

describe("checkRateLimit (in-memory fallback)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("allows requests under the limit", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const result = await checkRateLimit("test-key-allow", 3, 60000);
    expect(result.limited).toBe(false);
    expect(result.remaining).toBeLessThanOrEqual(3);
  });

  it("blocks after limit is exceeded", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const key = `test-key-block-${Date.now()}`;
    // Make 4 requests with limit of 3
    await checkRateLimit(key, 3, 60000);
    await checkRateLimit(key, 3, 60000);
    await checkRateLimit(key, 3, 60000);
    const result = await checkRateLimit(key, 3, 60000);
    expect(result.limited).toBe(true);
  });

  it("resets after window expires", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const key = `test-key-reset-${Date.now()}`;
    // Exhaust limit
    await checkRateLimit(key, 1, 1); // 1ms window
    await checkRateLimit(key, 1, 1);
    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 10));
    const result = await checkRateLimit(key, 1, 60000);
    expect(result.limited).toBe(false);
  });

  it("returns resetAt as a Date", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const result = await checkRateLimit(`test-date-${Date.now()}`, 5, 60000);
    expect(result.resetAt).toBeInstanceOf(Date);
    expect(result.resetAt.getTime()).toBeGreaterThan(Date.now());
  });
});
