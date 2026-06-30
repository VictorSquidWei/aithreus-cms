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

test("affiliate links are per-client — each login sees its own (spec 09 / §9.2)", async ({ page }) => {
  await login(page, "client@dimers.com", "client123");
  await page.goto("/admin/operators");
  await expect(page.getByTestId("affiliate-url-op_dk")).toHaveValue(/dimers-7741/);

  await login(page, "super@aithreus.internal", "super123");
  await page.goto("/admin/operators");
  await expect(page.getByTestId("affiliate-url-op_dk")).toHaveValue(/aithreus/);
});

test("client sets its affiliate link → Publish → the redirect uses it (spec 09 §3)", async ({ page, request }) => {
  await login(page, "client@dimers.com", "client123");
  await page.goto("/admin/operators");

  const input = page.getByTestId("affiliate-url-op_fd");
  await input.fill("https://fanduel.example/aff?b=dimers-EDITED");
  await input.blur();
  await expect(page.getByText("FanDuel link saved")).toBeVisible();

  await page.goto("/admin/sites");
  await page.getByTestId("publish-open").click();
  await page.getByTestId("publish-confirm").click();
  await expect(page.getByText("Published", { exact: false })).toBeVisible();

  // The tracking redirect now 302s to the client's edited affiliate URL.
  const res = await request.get("/r/site_dimers_tt/wi_dimers_odds/op_fd", { maxRedirects: 0 });
  expect([301, 302, 307, 308]).toContain(res.status());
  expect(res.headers()["location"]).toContain("dimers-EDITED");
});

test("a client can disable a platform (per-client kill switch) — its CTA drops from config", async ({ page, request }) => {
  await login(page, "client@dimers.com", "client123");
  await page.goto("/admin/operators");
  await page.getByLabel("Toggle Caesars").click();
  await expect(page.getByText("Caesars disabled")).toBeVisible();

  await page.goto("/admin/sites");
  await page.getByTestId("publish-open").click();
  await page.getByTestId("publish-confirm").click();
  await expect(page.getByText("Published", { exact: false })).toBeVisible();

  // poll the live config until the disabled platform drops (resilient to load)
  await expect
    .poll(async () => {
      const res = await request.get("/api/embed/config/site_dimers_tt");
      const cfg = await res.json();
      const ctas = (cfg.widgets["wi_dimers_odds"]?.ctas ?? []) as { operatorId: string }[];
      return { caesars: ctas.some((c) => c.operatorId === "op_caesars"), dk: ctas.some((c) => c.operatorId === "op_dk") };
    })
    .toEqual({ caesars: false, dk: true });
});
