import { test, expect } from '@playwright/test';

test('verify rhythm ui', async ({ page }) => {
  page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
  page.on('pageerror', err => console.log(`BROWSER ERROR: ${err}`));

  await page.goto('http://localhost:5173/');

  // Switch to Drill Mode
  await page.click('#nav-drill');

  // Select Rhythm Module
  await page.selectOption('#module-select', 'rhythm');

  // Verify Rhythm Container is visible
  await expect(page.locator('#rhythm-container')).toBeVisible();

  // Verify 6 Buttons
  await expect(page.locator('#btn-rhythm-l0')).toBeVisible();
  await expect(page.locator('#btn-rhythm-l1')).toBeVisible();
  await expect(page.locator('#btn-rhythm-l2')).toBeVisible();
  await expect(page.locator('#btn-rhythm-r0')).toBeVisible();
  await expect(page.locator('#btn-rhythm-r1')).toBeVisible();
  await expect(page.locator('#btn-rhythm-r2')).toBeVisible();

  // Verify Demo Checkbox
  await expect(page.locator('#chk-rhythm-demo')).toBeVisible();

  // Verify Difficulty Select
  await expect(page.locator('#sel-rhythm-diff')).toBeVisible();

  // Click Start to see if it crashes (Smoke test)
  await page.click('#btn-rhythm-start');
  await page.waitForTimeout(1000); // Wait a bit
  await page.click('#btn-rhythm-stop');

  // Take Screenshot
  await page.screenshot({ path: 'verification/rhythm_ui.png', fullPage: true });
});
