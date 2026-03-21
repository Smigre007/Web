import { describe, it, expect } from "vitest";
import {
  DASHBOARD_I18N,
  dashboardStatusBadge,
  dashboardStatusLabel,
} from "@/components/dashboard/dashboard-copy";

describe("dashboard-copy helpers", () => {
  const i = DASHBOARD_I18N.pt;

  it("dashboardStatusBadge returns classes for known status", () => {
    expect(dashboardStatusBadge("completed")).toContain("bg-gold");
    expect(dashboardStatusBadge("unknown")).toBe(dashboardStatusBadge("draft"));
  });

  it("dashboardStatusLabel maps status to copy", () => {
    expect(dashboardStatusLabel("completed", i)).toBe(i.completed);
    expect(dashboardStatusLabel("generating", i)).toBe(i.generating);
    expect(dashboardStatusLabel("custom", i)).toBe("custom");
  });
});
