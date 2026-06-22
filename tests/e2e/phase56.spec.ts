import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  await request.post("/api/dev/reset-store");
});

async function login(page: Page, email: string, password: string) {
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/admin/);
}

test("Presentation: product page, integrations, platform, status, docs render", async ({ page }) => {
  await login(page, "client@dimers.com", "client123");

  await page.goto("/products/vnx-terminal");
  await expect(page.getByRole("heading", { name: "VNX-Terminal" })).toBeVisible();
  await expect(page.getByTestId("execution-posture")).toContainText("Read-only");
  await expect(page.getByTestId("integration-grid").first()).toBeVisible();

  await page.goto("/integrations");
  await expect(page.getByTestId("integration-grid").first()).toBeVisible();

  await page.goto("/platform");
  await expect(page.getByText("signal-and-calibration")).toBeVisible();

  await page.goto("/status");
  await expect(page.getByTestId("status-vnx-bot")).toBeVisible();
  await expect(page.getByTestId("health-bar").first()).toBeVisible();

  await page.goto("/docs");
  await expect(page.getByTestId("doc-calibration")).toBeVisible();
  await page.getByTestId("doc-calibration").click();
  await expect(page.getByRole("heading", { name: "Calibration explained" })).toBeVisible();
});

test("internalOnly module hidden from client, shown to internal (§9.2)", async ({ page }) => {
  await login(page, "client@dimers.com", "client123");
  await page.goto("/products/tt-bot");
  await expect(page.getByText("Venue operational handling")).toHaveCount(0);

  await login(page, "super@aithreus.internal", "super123");
  await page.goto("/products/tt-bot");
  await expect(page.getByText("Venue operational handling")).toBeVisible();
});

test("Content panel: editing a product reflects on the live page + audit (§B1)", async ({ page }) => {
  await login(page, "editor@aithreus.internal", "editor123");
  await page.goto("/admin/content");
  await page.getByTestId("content-edit-vnx-terminal").click();
  await expect(page.getByTestId("product-edit-form")).toBeVisible();
  await page.getByTestId("product-field-tagline").fill("EDITED-BY-TEST tagline");
  await page.getByTestId("product-save").click();

  await page.goto("/products/vnx-terminal");
  await expect(page.getByText("EDITED-BY-TEST tagline")).toBeVisible();

  await page.goto("/admin/audit");
  await expect(page.getByTestId("audit-table")).toContainText("Updated VNX-Terminal");
});

test("Content panel is internal-only — client gets 403", async ({ page }) => {
  await login(page, "client@dimers.com", "client123");
  await page.goto("/admin/content");
  await expect(page.getByText("don't have access", { exact: false })).toBeVisible();
});

test("Phase 5/6 screenshots", async ({ page }) => {
  await login(page, "super@aithreus.internal", "super123");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/products/vnx-bot");
  await page.screenshot({ path: "test-results/phase5-product-1280.png", fullPage: true });
  await page.goto("/integrations");
  await page.screenshot({ path: "test-results/phase5-integrations-1280.png", fullPage: true });
  await page.goto("/status");
  await page.screenshot({ path: "test-results/phase5-status-1280.png", fullPage: true });
  await page.goto("/admin/content");
  await page.screenshot({ path: "test-results/phase6-content-1280.png", fullPage: true });
  await page.goto("/admin/audit");
  await page.screenshot({ path: "test-results/phase6-audit-1280.png", fullPage: true });
});
