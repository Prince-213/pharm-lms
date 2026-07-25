import { expect, test } from "@playwright/test";

test.describe("auth smoke", () => {
  test("student login page renders", async ({ page }) => {
    await page.goto("/student/login", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByPlaceholder("your.email@example.com"),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();
  });

  test("admin login page renders", async ({ page }) => {
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByPlaceholder(/email/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();
  });

  test("failed student login stays on login", async ({ page }) => {
    await page.goto("/student/login", { waitUntil: "domcontentloaded" });
    await page
      .getByPlaceholder("your.email@example.com")
      .fill("nobody@example.com");
    await page.getByPlaceholder("Password").fill("WrongPassword123!");
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page).toHaveURL(/\/student\/login/);
  });
});
