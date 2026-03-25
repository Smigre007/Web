import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("smoke (público)", () => {
  test("home carrega com título esperado", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/NeuroCode/i);
  });

  test("pricing e contact respondem", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("body")).toBeVisible();
    await page.goto("/contact");
    await expect(page.locator("body")).toBeVisible();
  });

  test("API pública /api/public/stats (smoke)", async ({ request }) => {
    const res = await request.get("/api/public/stats");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json).toHaveProperty("types");
  });

  test("GET /api/health — liveness", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: "ok" });
  });

  test("GET /api/ready — readiness (pode ser 503 sem DB real no CI)", async ({ request }) => {
    const res = await request.get("/api/ready");
    expect([200, 503]).toContain(res.status());
  });

  test("homepage — axe (critical)", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toEqual([]);
  });

  test("pricing — axe (critical)", async ({ page }) => {
    await page.goto("/pricing");
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toEqual([]);
  });
});
