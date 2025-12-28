import { test, expect } from '@playwright/test';

test.describe('Feature: Navigation & UI Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('#app-header', { state: 'visible' });
  });

  test('Should start in Lesson Mode by default', async ({ page }) => {
    // Check Nav Buttons State
    await expect(page.locator('#nav-lesson')).toHaveClass(/active/);
    await expect(page.locator('#nav-drill')).not.toHaveClass(/active/);

    // Check Container Visibility
    await expect(page.locator('#lesson-container')).toBeVisible();
    await expect(page.locator('#drill-container')).toBeHidden();
  });

  test('Should switch between Lesson and Drill modes', async ({ page }) => {
    // Switch to Drill Mode
    await page.click('#nav-drill');
    await expect(page.locator('#nav-drill')).toHaveClass(/active/);
    await expect(page.locator('#nav-lesson')).not.toHaveClass(/active/);
    await expect(page.locator('#drill-container')).toBeVisible();
    await expect(page.locator('#lesson-container')).toBeHidden();

    // Check Drill specific elements
    await expect(page.locator('#drill-settings')).toBeVisible();

    // Switch back to Lesson Mode
    await page.click('#nav-lesson');
    await expect(page.locator('#nav-lesson')).toHaveClass(/active/);
    await expect(page.locator('#lesson-container')).toBeVisible();
    await expect(page.locator('#drill-container')).toBeHidden();

    // Check Drill specific elements are hidden
    await expect(page.locator('#drill-settings')).toBeHidden();
  });

  test('Mobile Menu Toggle (Landscape Mode)', async ({ page }) => {
    // Set Viewport to Mobile Landscape to trigger the Hamburger Menu logic
    // CSS rules require max-height: 500px AND orientation: landscape
    await page.setViewportSize({ width: 812, height: 375 });

    const btnMenu = page.locator('#btn-mobile-menu');
    const appHeader = page.locator('#app-header');
    const btnClose = page.locator('#btn-close-menu');

    // Wait for button to be visible (it should be visible in landscape mobile)
    await expect(btnMenu).toBeVisible();

    // Initially header should be hidden in landscape mode (until menu is opened)
    // Wait, CSS says #app-header { display: none; } in landscape.
    await expect(appHeader).toBeHidden();

    // Open Menu
    await btnMenu.click();

    // Now header should be visible with .show-menu class
    await expect(appHeader).toBeVisible();
    await expect(appHeader).toHaveClass(/show-menu/);

    // Close Menu
    await btnClose.click();

    // Should be hidden again
    await expect(appHeader).toBeHidden();
    await expect(appHeader).not.toHaveClass(/show-menu/);
  });
});
