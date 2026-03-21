import { describe, it, expect, vi, afterEach } from "vitest";
import { modifierPlusKLabel } from "@/lib/keyboard-hint";

describe("modifierPlusKLabel", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns ⌘K for Mac platform", () => {
    vi.stubGlobal("navigator", { platform: "MacIntel", userAgent: "" });
    expect(modifierPlusKLabel()).toBe("⌘K");
  });

  it("returns Ctrl+K for Windows", () => {
    vi.stubGlobal("navigator", { platform: "Win32", userAgent: "Mozilla/5.0" });
    expect(modifierPlusKLabel()).toBe("Ctrl+K");
  });

  it("detects Mac from user agent when platform missing", () => {
    vi.stubGlobal("navigator", { platform: "", userAgent: "Mac OS X" });
    expect(modifierPlusKLabel()).toBe("⌘K");
  });
});
