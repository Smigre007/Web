import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("validateEnv", () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    // Restore env before each test
    process.env = { ...origEnv };
  });

  afterEach(() => {
    process.env = origEnv;
  });

  it("throws when required env vars are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.CLERK_SECRET_KEY;

    const { validateEnv } = await import("@/lib/env");
    expect(() => validateEnv()).toThrow("Missing required environment variables");
  });

  it("does not throw when all required vars are set", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
    process.env.ANTHROPIC_API_KEY = "sk-ant-key";
    process.env.CLERK_SECRET_KEY = "clerk-key";

    const { validateEnv } = await import("@/lib/env");
    expect(() => validateEnv()).not.toThrow();
  });

  it("hasStripe returns false when Stripe is not configured", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const { hasStripe } = await import("@/lib/env");
    expect(hasStripe()).toBe(false);
  });

  it("hasStripe returns true when Stripe is configured", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_xxx";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_xxx";

    const { hasStripe } = await import("@/lib/env");
    expect(hasStripe()).toBe(true);
  });

  it("throws when NEXT_PUBLIC_SUPABASE_URL is not a valid URL", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "not-a-url";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
    process.env.ANTHROPIC_API_KEY = "sk-ant-key";
    process.env.CLERK_SECRET_KEY = "clerk-key";

    const { validateEnv } = await import("@/lib/env");
    expect(() => validateEnv()).toThrow("Invalid URL for NEXT_PUBLIC_SUPABASE_URL");
  });
});
