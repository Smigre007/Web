import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockRpc } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: () => ({
    rpc: (...args: unknown[]) => mockRpc(...args),
  }),
}));

describe("checkRateLimit (fallback memória quando não é produção)", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv("NODE_ENV", "test");
    mockRpc.mockImplementation(() => {
      throw new Error("DB not available");
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    mockRpc.mockReset();
  });

  it("allows requests under the limit", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const result = await checkRateLimit("test-key-allow", 3, 60000);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.limited).toBe(false);
      expect(result.remaining).toBeLessThanOrEqual(3);
    }
  });

  it("blocks after limit is exceeded", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const key = `test-key-block-${Date.now()}`;
    await checkRateLimit(key, 3, 60000);
    await checkRateLimit(key, 3, 60000);
    await checkRateLimit(key, 3, 60000);
    const result = await checkRateLimit(key, 3, 60000);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.limited).toBe(true);
  });

  it("resets after window expires", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const key = `test-key-reset-${Date.now()}`;
    await checkRateLimit(key, 1, 1);
    await checkRateLimit(key, 1, 1);
    await new Promise((r) => setTimeout(r, 10));
    const result = await checkRateLimit(key, 1, 60000);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.limited).toBe(false);
  });

  it("returns resetAt as a Date", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const result = await checkRateLimit(`test-date-${Date.now()}`, 5, 60000);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.resetAt).toBeInstanceOf(Date);
      expect(result.resetAt.getTime()).toBeGreaterThan(Date.now());
    }
  });
});

describe("checkRateLimit (produção: RPC falha)", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv("NODE_ENV", "production");
    mockRpc.mockResolvedValue({ data: null, error: { message: "rpc failed" } });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    mockRpc.mockReset();
  });

  it("devolve backend_unavailable sem fallback memória", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const result = await checkRateLimit("prod-key", 5, 60_000);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("backend_unavailable");
  });
});
