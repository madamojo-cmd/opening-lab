import { test, expect } from "@playwright/test";

test("production root responds", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
});
