import { test, expect } from '@playwright/test';

test('Space Shooter loads and responds to player actions', async ({ page }) => {
  // Launch the app
  await page.goto('http://localhost:5173');

  // Check the canvas (game screen) is visible
  const canvas = await page.locator('canvas');
  await expect(canvas).toBeVisible();

  // Simulate spacebar press to shoot
  await page.keyboard.press('Space');

  // Wait briefly and take screenshot
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/product-test.png', fullPage: true });
});
