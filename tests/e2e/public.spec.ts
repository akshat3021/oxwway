import { expect, test } from "@playwright/test";
import { skipBoot } from "./helpers";

test.describe("public site", () => {
  test.beforeEach(async ({ page }) => skipBoot(page));

  test("landing page renders its hero and primary call to action", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("OXWAY");
    await expect(page.getByRole("link", { name: /explore products/i })).toBeVisible();
  });

  test("every public page loads without a server error", async ({ page }) => {
    for (const path of ["/", "/about", "/vision", "/products", "/gallery", "/blog", "/team", "/careers", "/contact"]) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
      await expect(page.locator("body")).not.toContainText("Application error");
    }
  });

  test("unknown URLs show the friendly 404", async ({ page }) => {
    const res = await page.goto("/definitely-not-a-page");
    expect(res?.status()).toBe(404);
    await expect(page.getByText(/not found/i).first()).toBeVisible();
  });

  test("no page overflows horizontally (responsive)", async ({ page }) => {
    for (const path of ["/", "/about", "/products", "/blog", "/team", "/contact"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${path} overflows by ${overflow}px`).toBeLessThanOrEqual(1);
    }
  });

  test("contact form validates, then confirms a valid submission", async ({ page }) => {
    await page.goto("/contact");
    await page.locator("#c-name").fill("E2E Tester");
    await page.locator("#c-email").fill("not-an-email");
    await page.locator("#c-message").fill("Hello from the end-to-end test");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.locator("#c-email-err")).toBeVisible();

    await page.locator("#c-email").fill("e2e@example.com");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText(/thank you/i)).toBeVisible();
  });

  test("theme choice persists across reloads", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
    await page.getByRole("button", { name: /dark|light/i }).first().click();
    await expect(html).toHaveClass(/light/);
    await page.reload();
    await expect(html).toHaveClass(/light/);
  });

  test("security headers are present", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-powered-by"]).toBeUndefined();
  });
});
