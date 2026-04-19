import { test, expect } from "./fixture.js";

test("test testing", async ({ page }) => {
  await page.goto("http://localhost:8000?from=de-VBB_710008010381");

  const from = page.locator("#config-from");
  await expect(from).toHaveValue("Wismar, Bahnhof", { timeout: 2000 });
});
