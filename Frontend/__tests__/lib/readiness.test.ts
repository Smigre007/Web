import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: () => ({
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

describe("getReadinessState", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFrom.mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "sr";
    process.env.ANTHROPIC_API_KEY = "sk-ant";
    process.env.CLERK_SECRET_KEY = "sk";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk";
  });

  it("dbOk true quando a query a users não falha", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        limit: () => Promise.resolve({ error: null }),
      }),
    });
    const { getReadinessState } = await import("@/lib/readiness");
    const state = await getReadinessState();
    expect(state.dbOk).toBe(true);
    expect(state.envOk).toBe(true);
  });

  it("dbOk false quando há erro na query", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        limit: () => Promise.resolve({ error: { message: "fail" } }),
      }),
    });
    const { getReadinessState } = await import("@/lib/readiness");
    const state = await getReadinessState();
    expect(state.dbOk).toBe(false);
  });
});
