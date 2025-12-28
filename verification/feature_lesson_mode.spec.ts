import { test, expect } from '@playwright/test';

test.describe('Feature: Lesson Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('#lesson-container', { state: 'visible' });
  });

  test('Should render initial chord', async ({ page }) => {
    // Default is usually C Major or similar
    await expect(page.locator('#lesson-chord-name')).not.toBeEmpty();
    await expect(page.locator('#lesson-chord-notes')).not.toBeEmpty();

    // Check Notation
    const notation = page.locator('#lesson-notation svg');
    await expect(notation).toBeVisible();
  });

  test('Should update content when Key/Mode changes', async ({ page }) => {
    const chordName = page.locator('#lesson-chord-name');
    const chordNotes = page.locator('#lesson-chord-notes');

    // Store initial text
    const initialText = await chordName.textContent();

    // Change Key to D
    await page.selectOption('#key-select', 'D');

    // Wait for update
    await expect(chordName).not.toHaveText(initialText!);
    await expect(chordName).toContainText('D');

    // Change Mode to Minor
    await page.selectOption('#mode-select', 'Minor');
    await expect(chordName).toContainText('Minor');

    // Verify notes update (D Minor: D - F - A)
    await expect(chordNotes).toContainText('D');
    await expect(chordNotes).toContainText('F');
    await expect(chordNotes).toContainText('A');
  });

  test('Navigation buttons should cycle chords', async ({ page }) => {
    const chordNotes = page.locator('#lesson-chord-notes');
    const initialNotes = await chordNotes.textContent();

    await page.click('#btn-next-chord');

    // Notes should change (next inversion/voicing)
    await expect(chordNotes).not.toHaveText(initialNotes!);

    await page.click('#btn-prev-chord');
    // Should return to initial (or previous)
    await expect(chordNotes).toHaveText(initialNotes!);
  });
});
