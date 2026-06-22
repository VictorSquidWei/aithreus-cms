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
  await page.setViewportSize({ width: 375, height: 760 });
  await page.goto("/admin/links?site=st_dimers_tt");
  await page.screenshot({ path: "test-results/phase3-links-375.png", fullPage: true });
});
