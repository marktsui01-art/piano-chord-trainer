import { test, expect } from '@playwright/test';

test.describe('Feature: Drill Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.click('#nav-drill'); // Go to drill mode
    await page.waitForSelector('#drill-container', { state: 'visible' });
  });

  test('Module Selection should update UI', async ({ page }) => {
    // Select Triads
    await page.selectOption('#module-select', 'triads');
    // Reveal button should be visible for chords
    await expect(page.locator('#btn-reveal')).toBeVisible();

    // Select Melody
    await page.selectOption('#module-select', 'melody');
    // Reveal button should be hidden
    await expect(page.locator('#btn-reveal')).toBeHidden();
  });

  test('Chromatic Mode Logic', async ({ page }) => {
    // 1. Select Interval (Supports Chromatic)
    await page.selectOption('#module-select', 'interval');
    const modeSelect = page.locator('#mode-select');
    const chromaticOpt = modeSelect.locator('option[value="Chromatic"]');

    await expect(chromaticOpt).not.toBeDisabled();
    await page.selectOption('#mode-select', 'Chromatic');
    await expect(modeSelect).toHaveValue('Chromatic');

    // 2. Switch to Melody (No Chromatic)
    await page.selectOption('#module-select', 'melody');

    // Should reset to Major
    await expect(modeSelect).toHaveValue('Major');
    await expect(chromaticOpt).toBeDisabled();
  });

  test('Clef Selection should not crash', async ({ page }) => {
    await page.selectOption('#clef-select', 'bass');

    // Verify notation still exists
    await expect(page.locator('#drill-notation svg')).toBeVisible();
  });

  test('Range Selection', async ({ page }) => {
     await page.selectOption('#range-select', 'wide');
     // Just ensure no error
     await expect(page.locator('#drill-notation svg')).toBeVisible();
  });
});
