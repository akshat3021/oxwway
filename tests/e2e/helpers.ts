import { expect, type Page } from "@playwright/test";

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? process.env.SEED_ADMIN_EMAIL ?? "";
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD ?? "";

export async function signIn(page: Page, email = ADMIN_EMAIL, password = ADMIN_PASSWORD): Promise<void> {
  if (!email || !password) throw new Error("Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (or SEED_ADMIN_*)");
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible();
}

/** Skip the first-visit boot animation so it never overlaps assertions. */
export async function skipBoot(page: Page): Promise<void> {
  await page.addInitScript(() => window.sessionStorage.setItem("oxway_booted", "1"));
}
