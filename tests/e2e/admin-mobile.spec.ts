import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test("admin navigation works on a phone via the drawer", async ({ page }) => {
  await signIn(page);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("link", { name: "Blog & News" }).click();
  await expect(page).toHaveURL(/\/admin\/blog/);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
