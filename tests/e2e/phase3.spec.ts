import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  await request.post("/api/dev/reset-store");
});

async function loginClient(page: Page) {
  await page.goto("/login");
  await page.getByTestId("login-email").fill("client@dimers.com");
  await page.getByTestId("login-password").fill("client123");
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/admin/);
}

test("Step 1 — Operators: table + create (§9.4)", async ({ page }) => {
  await loginClient(page);
  await page.goto("/admin/operators");
  await expect(page.getByTestId("operators-table")).toBeVisible();

  await page.getByTestId("operator-new").click();
  await expect(page.getByTestId("operator-form")).toBeVisible();
  await page.getByTestId("operator-field-name").fill("BetTest");
  await page.getByTestId("operator-field-label").fill("Bet on BetTest");
  await page.getByTestId("operator-field-url").fill("https://bettest.example/aff?c=dimers");
  await page.getByTestId("operator-save").click();

  await expect(page.getByTestId("operators-table").getByText("BetTest", { exact: true })).toBeVisible();
});

test("Step 1 — invalid affiliate URL is rejected", async ({ page }) => {
  await loginClient(page);
  await page.goto("/admin/operators");
  await page.getByTestId("operator-new").click();
  await page.getByTestId("operator-field-name").fill("BadOp");
  await page.getByTestId("operator-field-label").fill("Bad");
  await page.getByTestId("operator-field-url").fill("not-a-url");
  await page.getByTestId("operator-save").click();
  await expect(page.getByTestId("operator-form-error")).toContainText("valid");
});

test("Step 3 — Edit Links: INHERITED/CUSTOM, multi-CTA rows, override + reset (§9.6)", async ({ page }) => {
  await loginClient(page);
  await page.goto("/admin/links?site=st_dimers_tt");

  // Multi-CTA odds table renders one row per active operator (data-driven).
  await expect(page.getByTestId("widget-block-wi_dimers_odds")).toBeVisible();

  // Seeded override → DraftKings is CUSTOM; FanDuel is INHERITED.
  await expect(page.getByTestId("override-state-wi_dimers_odds-op_dk")).toContainText("CUSTOM");
  await expect(page.getByTestId("override-state-wi_dimers_odds-op_fd")).toContainText("INHERITED");

  // Type a URL into FanDuel → becomes CUSTOM.
  const fd = page.getByTestId("override-input-wi_dimers_odds-op_fd");
  await fd.fill("https://fanduel.example/aff?c=dimers-custom");
  await fd.blur();
  await expect(page.getByTestId("override-state-wi_dimers_odds-op_fd")).toContainText("CUSTOM");

  // Reset DraftKings → back to INHERITED.
  await page.getByTestId("override-reset-wi_dimers_odds-op_dk").click();
  await expect(page.getByTestId("override-state-wi_dimers_odds-op_dk")).toContainText("INHERITED");
});

test("Step 4 — Embed: snippet carries configId + widget id, copy present (§9.7)", async ({ page }) => {
  await loginClient(page);
  await page.goto("/admin/embed?site=st_dimers_tt");
  const snippet = page.getByTestId("embed-snippet-wi_dimers_odds");
  await expect(snippet).toContainText("site_dimers_tt");
  await expect(snippet).toContainText("wi_dimers_odds");
  await expect(page.getByTestId("embed-copy-wi_dimers_odds")).toBeVisible();
});

test("Gallery — preview CTAs reflect active operators; kill-switch removes them (§9.8, §9.4)", async ({ page }) => {
  await loginClient(page);
  await page.goto("/admin/gallery");
  await expect(page.getByTestId("gallery-card-odds_comparison_table")).toBeVisible();
  expect(await page.getByTestId("preview-cta-pinnacle").count()).toBeGreaterThan(0);

  // Turn Pinnacle off in Step 1 (global kill switch).
  await page.goto("/admin/operators");
  await page.getByLabel("Toggle Pinnacle").click();
  await expect(page.getByText("Pinnacle turned off")).toBeVisible();

  // Gallery no longer renders any Pinnacle CTA.
  await page.goto("/admin/gallery");
  expect(await page.getByTestId("preview-cta-pinnacle").count()).toBe(0);
});

test("Performance — KPIs, breakdown, export (§9.9)", async ({ page }) => {
  await loginClient(page);
  await page.goto("/admin/performance");
  await expect(page.getByTestId("kpi-views")).toBeVisible();
  await expect(page.getByTestId("breakdown-table")).toContainText("DraftKings");
  await expect(page.getByTestId("export-csv")).toBeVisible();
});

test("Publish — diff dialog + publish goes live (§9.10)", async ({ page }) => {
  await loginClient(page);
  await page.goto("/admin/sites");
  await page.getByTestId("publish-open").click();
  await expect(page.getByTestId("publish-confirm")).toBeVisible();
  await page.getByTestId("publish-confirm").click();
  await expect(page.getByText("Published", { exact: false })).toBeVisible();
});

test("Phase 3 screenshots (1280 + 375)", async ({ page }) => {
  await loginClient(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/admin/operators");
  await page.screenshot({ path: "test-results/phase3-operators-1280.png", fullPage: true });
  await page.goto("/admin/sites");
  await page.screenshot({ path: "test-results/phase3-sites-1280.png", fullPage: true });
  await page.goto("/admin/links?site=st_dimers_tt");
  await page.screenshot({ path: "test-results/phase3-links-1280.png", fullPage: true });
  await page.goto("/admin/setup");
  await page.screenshot({ path: "test-results/phase3-setup-1280.png", fullPage: true });
  await page.goto("/admin/gallery");
  await page.screenshot({ path: "test-results/phase3-gallery-1280.png", fullPage: true });
  await page.goto("/admin/performance");
  await page.getByTestId("timeseries").waitFor();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "test-results/phase3-performance-1280.png", fullPage: true });
  await page.goto("/admin/embed?site=st_dimers_tt");
  await page.screenshot({ path: "test-results/phase3-embed-1280.png", fullPage: true });
  await page.setViewportSize({ width: 375, height: 760 });
  await page.goto("/admin/links?site=st_dimers_tt");
  await page.screenshot({ path: "test-results/phase3-links-375.png", fullPage: true });
});
