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

test("Config endpoint: published, resolved, active-only, no raw URLs (§9.11)", async ({ request }) => {
  const res = await request.get("/api/embed/config/site_dimers_tt");
  expect(res.status()).toBe(200);
  const cfg = await res.json();
  expect(cfg.configId).toBe("site_dimers_tt");

  const odds = cfg.widgets["wi_dimers_odds"];
  expect(odds.ctaMode).toBe("multi");
  expect(odds.ctas.length).toBeGreaterThan(1);
  // CTA hrefs are tracking redirects, never raw affiliate URLs
  expect(odds.ctas[0].href).toContain("/r/site_dimers_tt/wi_dimers_odds/");
  const json = JSON.stringify(cfg);
  expect(json).not.toContain("draftkings.example"); // no raw affiliate URL leaks
  expect(json).not.toContain("Stake"); // internalOnly operator never present
});

test("Config endpoint: unknown configId → 404", async ({ request }) => {
  const res = await request.get("/api/embed/config/nope");
  expect(res.status()).toBe(404);
});

test("Redirect logs a click and 302s to the affiliate URL (§9.13)", async ({ request }) => {
  const res = await request.get("/r/site_dimers_tt/wi_dimers_odds/op_dk", { maxRedirects: 0 });
  expect([301, 302, 307, 308]).toContain(res.status());
  expect(res.headers()["location"]).toContain("draftkings.example");
});

test("§9.14 end-to-end loop: CMS change + Publish → demo updates, embed unchanged", async ({ page }) => {
  // 1. Demo renders operator CTAs from the published config.
  await page.goto("/demo/client-site");
  await expect(page.getByTestId("aithreus-rendered-widget").first()).toBeVisible();
  await expect(page.getByText("Bet on FanDuel")).toBeVisible();
  await expect(page.getByText("Bet on DraftKings")).toBeVisible();

  // 2. In the CMS: turn FanDuel off, then Publish.
  await loginClient(page);
  await page.goto("/admin/operators");
  await page.getByLabel("Toggle FanDuel").click();
  await expect(page.getByText("FanDuel turned off")).toBeVisible();
  await page.getByTestId("publish-open").click();
  await page.getByTestId("publish-confirm").click();
  await expect(page.getByText("Published", { exact: false })).toBeVisible();

  // 3. Reload the demo (embed code unchanged) — FanDuel CTA gone, DraftKings remains.
  await page.goto("/demo/client-site");
  await expect(page.getByTestId("aithreus-rendered-widget").first()).toBeVisible();
  await expect(page.getByText("Bet on DraftKings")).toBeVisible();
  await expect(page.getByText("Bet on FanDuel")).toHaveCount(0);
});

test("Phase 4 screenshot", async ({ page }) => {
  await page.goto("/demo/client-site");
  await expect(page.getByTestId("aithreus-rendered-widget").first()).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "test-results/phase4-demo-1280.png", fullPage: true });
});
