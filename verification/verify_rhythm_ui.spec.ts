import { test, expect } from '@playwright/test';

test('verify rhythm game ui', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Click Drill Mode
  await page.getByRole('button', { name: 'Drill Mode' }).click();

  // Select Rhythm
  await page.selectOption('#module-select', 'rhythm');

  // Check UI
  await expect(page.locator('#rhythm-container')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Left Hand (A)' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Right Hand (L)' })).toBeVisible();

  // Screenshot
  await page.screenshot({ path: 'verification/rhythm_ui.png' });
});
