import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  await request.post("/api/dev/reset-store");
});

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/admin/);
}

test("public landing + portfolio render (§9.1)", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("brand-wordmark").first()).toBeVisible();
  await expect(page.getByTestId("cta-login")).toBeVisible();

  await page.goto("/portfolio");
  await expect(page.getByTestId("product-vnx-terminal")).toBeVisible();
  await expect(page.getByTestId("product-tt-bot")).toBeVisible();
});

test("admin is gated (§9.1)", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
});

test("affiliate_client: scoped data + product switch re-scopes (§9.2, §9.3)", async ({ page }) => {
  await login(page, "client@dimers.com", "client123");
  await expect(page.getByTestId("app-sidebar")).toBeVisible();

  // TT (default): client sees TT operators EXCEPT internalOnly Stake = 7; only Dimers' TT site = 1.
  await expect(page.getByTestId("kpi-operators")).toContainText("7");
  await expect(page.getByTestId("kpi-sites")).toContainText("1");

  // Switch to VNX → operators re-scope to 4 (Polymarket, Kalshi, CalcX, PredictIt).
  await page.getByTestId("product-switch-vnx").click();
  await expect(page.getByTestId("product-switch-vnx")).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("kpi-operators")).toContainText("4");

  // affiliate_client must NOT see the internal content section.
  await expect(page.getByTestId("nav-/admin/content")).toHaveCount(0);
});

test("internal role sees internalOnly + all clients (§9.2)", async ({ page }) => {
  await login(page, "super@aithreus.internal", "super123");
  // TT: superadmin sees ALL operators incl. internalOnly Stake = 8; both clients' TT sites = 2.
  await expect(page.getByTestId("kpi-operators")).toContainText("8");
  await expect(page.getByTestId("kpi-sites")).toContainText("2");
  // Internal content section present.
  await expect(page.getByTestId("nav-/admin/content")).toBeVisible();
});

test("theme toggle persists across reload (§9.15)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/light/);
  await page.getByTestId("theme-toggle").click();
  await expect(page.locator("html")).toHaveClass(/light/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/light/);
});

test("responsive screenshots at 1280px and 375px", async ({ page }) => {
  // public
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.screenshot({ path: "test-results/phase2-landing-1280.png", fullPage: true });
  await page.goto("/portfolio");
  await page.screenshot({ path: "test-results/phase2-portfolio-1280.png", fullPage: true });
  await page.goto("/login");
  await page.screenshot({ path: "test-results/phase2-login-1280.png", fullPage: true });

  // admin (desktop)
  await login(page, "client@dimers.com", "client123");
  await page.screenshot({ path: "test-results/phase2-admin-1280.png", fullPage: true });

  // admin (mobile) — drawer trigger visible, desktop sidebar hidden
  await page.setViewportSize({ width: 375, height: 720 });
  await page.goto("/admin");
  await expect(page.getByTestId("sidebar-toggle")).toBeVisible();
  await page.screenshot({ path: "test-results/phase2-admin-375.png", fullPage: true });
  await page.goto("/");
  await page.screenshot({ path: "test-results/phase2-landing-375.png", fullPage: true });
});
