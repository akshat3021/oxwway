import { expect, test } from "@playwright/test";
import { signIn, skipBoot } from "./helpers";

test.describe("admin", () => {
  test("anonymous visitors are sent to the login page", async ({ page }) => {
    await page.goto("/admin/blog");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("wrong credentials show a generic error and stay signed out", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByLabel("Password").fill("not-the-right-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert")).toContainText(/invalid email or password/i);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("create → publish → visible on the public site → delete → gone", async ({ page, context }) => {
    await skipBoot(page);
    await signIn(page);

    const title = `E2E Post ${Date.now()}`;
    await page.goto("/admin/blog");
    await page.getByRole("button", { name: /new post/i }).first().click();

    const dialog = page.getByRole("dialog");
    await dialog.locator("#f-title").fill(title);
    // The slug is generated from the title until edited by hand.
    await expect(dialog.locator("#f-slug")).toHaveValue(/^e2e-post-/);
    const slug = await dialog.locator("#f-slug").inputValue();
    await dialog.locator("#f-excerpt").fill("Created by the end-to-end test");
    await dialog.locator("#f-body").fill("# Heading\n\nHello **world**\n\n<script>window.__xss = true</script>");
    await dialog.locator("#f-status").selectOption("published");
    await dialog.getByRole("button", { name: "Save" }).click();

    await expect(page.getByRole("status")).toContainText(/created/i);
    await expect(page.getByRole("row", { name: new RegExp(title) })).toBeVisible();

    // Public site (separate, anonymous context).
    const anon = await context.browser()!.newContext();
    const pub = await anon.newPage();
    await skipBoot(pub);
    await pub.goto(`/blog/${slug}`);
    await expect(pub.getByRole("heading", { name: title })).toBeVisible();
    await expect(pub.getByRole("heading", { name: "Heading" })).toBeVisible();
    expect(await pub.evaluate(() => (window as unknown as { __xss?: boolean }).__xss)).toBeUndefined();
    await anon.close();

    // Delete through the UI with confirmation.
    await page.getByRole("button", { name: `Delete ${title}` }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByRole("row", { name: new RegExp(title) })).toHaveCount(0);

    const gone = await page.request.get(`/blog/${slug}`);
    expect(gone.status()).toBe(404);
  });

  test("form validation errors are shown next to the field", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/blog");
    await page.getByRole("button", { name: /new post/i }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Save" }).click();
    await expect(dialog.locator("#f-title-error")).toBeVisible();
    await expect(dialog.locator("#f-title")).toHaveAttribute("aria-invalid", "true");
  });

  test("signing out ends the session", async ({ page }) => {
    await signIn(page);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("admins can open every admin screen", async ({ page }) => {
    await signIn(page);
    for (const [path, heading] of [
      ["/admin/homepage", /homepage/i], ["/admin/products", /products/i], ["/admin/team", /team/i],
      ["/admin/careers", /careers/i], ["/admin/gallery", /gallery/i], ["/admin/company", /company/i],
      ["/admin/messages", /messages/i], ["/admin/users", /users/i], ["/admin/audit", /audit log/i],
      ["/admin/settings", /settings/i], ["/admin/account", /account/i],
    ] as const) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    }
  });
});
