import { test, expect } from '@playwright/test';

test.describe('Feature: Drill Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.click('#nav-drill');
  });

  test('Chord Drill (Triads) Interaction', async ({ page }) => {
    await page.selectOption('#module-select', 'triads');
    await page.waitForTimeout(500); // Allow render

    const input = page.locator('#text-input');
    const feedback = page.locator('#feedback-text');
    const question = page.locator('#question-text');

    // Reveal Answer
    await page.click('#btn-reveal');
    await expect(feedback).toContainText('Answer:');

    // Extract answer notes from text (e.g., "Answer: C - E - G")
    const answerText = await feedback.textContent();
    const answerNotes = answerText?.replace('Answer:', '').trim().split(' - ').join(' ');

    if (answerNotes) {
        // Type correct answer
        await input.fill(answerNotes);
        await page.click('#btn-submit');

        await expect(feedback).toHaveText('Correct!');
    }
  });

  test('Melody Drill Interaction (Sequential)', async ({ page }) => {
    await page.selectOption('#module-select', 'melody');

    // For Melody, we don't have a Reveal button.
    // We can only test that typing doesn't crash and provides feedback.

    const input = page.locator('#text-input');
    await input.fill('C');

    // Check that we didn't crash.
    await expect(page.locator('#question-text')).toBeVisible();
  });
});
