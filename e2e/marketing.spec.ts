import { expect, test } from "@playwright/test";

test.describe("marketing smoke", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/pharmacy|pharm/i);
    await expect(page.locator("body")).toBeVisible();
  });

  test("catalog page loads", async ({ page }) => {
    await page.goto("/courses", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
  });
});
