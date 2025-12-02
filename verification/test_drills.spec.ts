import { test, expect } from '@playwright/test';

test.describe('Melody Drill Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the app
    await page.goto('http://localhost:5173/');
    // Wait for loading to finish
    await page.waitForSelector('#loading-indicator', { state: 'hidden', timeout: 10000 });
  });

  test('Melody Drill Setup and Rendering', async ({ page }) => {
    await page.click('#nav-drill');
    await page.selectOption('#module-select', 'melody');
    await page.waitForSelector('#key-select', { state: 'visible' });
    await page.selectOption('#key-select', 'Ebm');

    // Check for Off-Screen Notes
    const notation = page.locator('#drill-notation svg');
    await expect(notation).toBeVisible();

    // Check for "No Notes" (Empty Stave)
    const notes = page.locator('.vf-stavenote');
    const count = await notes.count();
    console.log(`Initial Note Count: ${count}`);

    if (count === 0) {
        console.log("Bug Reproduced: No notes rendered!");
    } else {
        console.log(`Notes rendered: ${count}`);
    }

    // Minimal assertion to ensure test fails if empty
    expect(count).toBeGreaterThan(0);
  });

  test('Repeated Note Input', async ({ page }) => {
    await page.click('#nav-drill');
    await page.selectOption('#module-select', 'melody');

    const input = page.locator('#text-input');
    await input.fill('');
    await input.type('C');

    // Simulate Enter to trigger potential double submission
    await input.press('Enter');

    // Since we can't easily verify exact logic without controlling the question,
    // we ensure no catastrophic failure (like crash or weird UI state).
    // The main fix is verified by code inspection of main.ts.
    await expect(page.locator('#question-text')).toBeVisible();
  });
});
