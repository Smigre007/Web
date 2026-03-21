import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("getSupabaseAdmin", () => {
  const origUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const origKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = origUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = origKey;
  });

  it("throws when env vars are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { getSupabaseAdmin } = await import("@/lib/supabase/server");
    expect(() => getSupabaseAdmin()).toThrow(
      "Supabase environment variables not configured"
    );
  });

  it("returns a client when env vars are set", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";

    const { getSupabaseAdmin } = await import("@/lib/supabase/server");
    const client = getSupabaseAdmin();
    expect(client).toBeDefined();
    expect(typeof client.from).toBe("function");
  });
});
