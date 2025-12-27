import { test, expect } from '@playwright/test';

test.describe('Mode Selector and Chromatic Logic', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the app
    await page.goto('http://localhost:5173/');
    // Wait for loading to finish (if any)
    await page.waitForSelector('#app-header', { state: 'visible' });

    // Ensure we are in Drill Mode for consistency, as some elements checks might depend on it
    await page.click('#nav-drill');
    await expect(page.locator('#drill-container')).toBeVisible();
  });

  test('Module "Interval" should show Chromatic option', async ({ page }) => {
    // Select Interval module
    await page.selectOption('#module-select', 'interval');

    // Check if Mode selector is visible
    const modeSelectContainer = page.locator('#mode-select-container');
    await expect(modeSelectContainer).toBeVisible();

    // Check if Chromatic option is visible and enabled
    const chromaticOption = page.locator('#mode-select option[value="Chromatic"]');

    // We check if it is NOT disabled (meaning enabled)
    await expect(chromaticOption).not.toBeDisabled();

    // Try selecting it
    await page.selectOption('#mode-select', 'Chromatic');
    await expect(page.locator('#mode-select')).toHaveValue('Chromatic');
  });

  test('Module "Speed" should show Chromatic option', async ({ page }) => {
    await page.selectOption('#module-select', 'speed');
    const modeSelectContainer = page.locator('#mode-select-container');
    await expect(modeSelectContainer).toBeVisible();

    const chromaticOption = page.locator('#mode-select option[value="Chromatic"]');
    await expect(chromaticOption).not.toBeDisabled();

    await page.selectOption('#mode-select', 'Chromatic');
    await expect(page.locator('#mode-select')).toHaveValue('Chromatic');
  });

  test('Module "Triads" (Chord Drill) should HIDE Chromatic option', async ({ page }) => {
    await page.selectOption('#module-select', 'triads');

    // Mode selector container should be visible for Triads
    const modeSelectContainer = page.locator('#mode-select-container');
    await expect(modeSelectContainer).toBeVisible();

    // Chromatic option should be disabled/hidden
    const chromaticOption = page.locator('#mode-select option[value="Chromatic"]');
    await expect(chromaticOption).toBeDisabled();
  });

  test('Switching from Chromatic (Interval) to Melody (Non-Chromatic) should reset to Major', async ({ page }) => {
    // 1. Select Interval
    await page.selectOption('#module-select', 'interval');
    // 2. Select Chromatic
    await page.selectOption('#mode-select', 'Chromatic');
    await expect(page.locator('#mode-select')).toHaveValue('Chromatic');

    // 3. Switch to Melody (which doesn't support Chromatic)
    await page.selectOption('#module-select', 'melody');

    // 4. Check if Mode reset to Major
    await expect(page.locator('#mode-select')).toHaveValue('Major');

    // 5. Check if Chromatic option is now disabled
    const chromaticOption = page.locator('#mode-select option[value="Chromatic"]');
    await expect(chromaticOption).toBeDisabled();
  });

  test('Regression: Chord Drills (Triads) should still function', async ({ page }) => {
      // Ensure we are in Drill Mode (already done in beforeEach but good to be explicit for flow)
      await page.selectOption('#module-select', 'triads');

      // Wait for notation to render something (basic check)
      const notation = page.locator('#drill-notation svg');
      await expect(notation).toBeVisible();

      // Check if interaction works (e.g. revealing answer)
      const revealBtn = page.locator('#btn-reveal');
      await expect(revealBtn).toBeVisible();
      await revealBtn.click();

      const feedback = page.locator('#feedback-text');
      await expect(feedback).toContainText('Answer:');
  });
});
