import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs info as JSON with level and timestamp", () => {
    logger.info("test message");
    expect(console.log).toHaveBeenCalledOnce();
    const arg = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const parsed = JSON.parse(arg);
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("test message");
    expect(parsed.timestamp).toBeDefined();
  });

  it("redacts sensitive keys in context", () => {
    logger.info("event", { apiKey: "sk_live_secret123", userId: "user_abc" });
    const arg = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const parsed = JSON.parse(arg);
    expect(parsed.context.apiKey).toBe("[REDACTED]");
    expect(parsed.context.userId).toBe("user_abc");
  });

  it("redacts Stripe secret key patterns in strings", () => {
    logger.error("error", { message: "key is sk_live_abc123xyz" });
    const arg = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(arg).not.toContain("sk_live_abc123xyz");
    expect(arg).toContain("[REDACTED]");
  });

  it("sanitizes Error objects", () => {
    logger.error("something failed", { error: new Error("connection refused") });
    const arg = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const parsed = JSON.parse(arg);
    expect(parsed.context.error.message).toBe("connection refused");
    expect(parsed.context.error.name).toBe("Error");
  });

  it("uses console.warn for warn level", () => {
    logger.warn("heads up");
    expect(console.warn).toHaveBeenCalledOnce();
  });

  it("uses console.error for error level", () => {
    logger.error("broke");
    expect(console.error).toHaveBeenCalledOnce();
  });
});
