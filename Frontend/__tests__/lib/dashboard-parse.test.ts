import { describe, it, expect } from "vitest";
import {
  parseDashboardStats,
  parseDashboardUsage,
  normalizeDashboardProjectsPayload,
  isDashboardSection,
} from "@/lib/dashboard-parse";

describe("dashboard-parse", () => {
  it("isDashboardSection accepts valid tabs", () => {
    expect(isDashboardSection("overview")).toBe(true);
    expect(isDashboardSection("projects")).toBe(true);
    expect(isDashboardSection("tasks")).toBe(true);
    expect(isDashboardSection("calendar")).toBe(true);
    expect(isDashboardSection("goals")).toBe(true);
    expect(isDashboardSection("invalid")).toBe(false);
    expect(isDashboardSection(null)).toBe(false);
  });

  it("parseDashboardStats returns null for invalid input", () => {
    expect(parseDashboardStats(null)).toBeNull();
    expect(parseDashboardStats([])).toBeNull();
    expect(parseDashboardStats({})).toBeNull();
  });

  it("parseDashboardStats parses API-shaped object", () => {
    const parsed = parseDashboardStats({
      total: 3,
      completed: 1,
      thisMonth: 2,
      topType: "website",
    });
    expect(parsed).toEqual({
      total: 3,
      completed: 1,
      thisMonth: 2,
      topType: "website",
    });
  });

  it("parseDashboardStats defaults missing numeric fields", () => {
    const parsed = parseDashboardStats({ total: 1 });
    expect(parsed).toEqual({
      total: 1,
      completed: 0,
      thisMonth: 0,
      topType: "",
    });
  });

  it("parseDashboardUsage returns null when generations missing", () => {
    expect(parseDashboardUsage({})).toBeNull();
  });

  it("parseDashboardUsage parses usage", () => {
    expect(
      parseDashboardUsage({
        generations_used: 2,
        generations_limit: 10,
        percent: 20,
        plan: "pro",
      })
    ).toEqual({
      generations_used: 2,
      generations_limit: 10,
      percent: 20,
      plan: "pro",
    });
  });

  it("normalizeDashboardProjectsPayload filters invalid rows", () => {
    expect(normalizeDashboardProjectsPayload(null)).toEqual([]);
    expect(
      normalizeDashboardProjectsPayload([
        { id: "a", name: "N", type: "website", status: "draft", created_at: "2024-01-01" },
        { foo: "bar" },
      ])
    ).toHaveLength(1);
    expect(normalizeDashboardProjectsPayload([{ id: "x" }])[0]?.name).toBe("—");
  });
});
