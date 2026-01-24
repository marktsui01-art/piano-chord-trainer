import { test, expect } from '@playwright/test';

test.describe('Melody Drill Reproduction', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

        await page.goto('http://localhost:5173/');
        // Wait for the app to load
        try {
            await page.waitForSelector('#loading-indicator', { state: 'hidden', timeout: 30000 });
        } catch (e) {
            console.warn('Loading indicator timed out, proceeding anyway');
        }

        // Switch to Drill Mode
        await page.click('#nav-drill');
        // Select Melodic Sight-Reading
        await page.selectOption('#module-select', 'melody');
        // Wait for container to be ready
        await page.waitForSelector('#drill-container.active');
    });

    test('should not show blank questions in 100 iterations', async ({ page }) => {
        let hasError = false;
        page.on('pageerror', () => { hasError = true; });
        page.on('console', msg => {
            if (msg.type() === 'error' || msg.text().includes('RuntimeError')) {
                hasError = true;
            }
        });

        for (let i = 0; i < 100; i++) {
            if (i % 10 === 0) console.log(`Iteration ${i + 1}/100`);

            hasError = false; // Reset for this iteration

            // Click Next Question
            await page.click('#btn-next-drill');

            // Wait a bit for VexFlow to render and for any errors to propagate
            await page.waitForTimeout(200);

            const notes = page.locator('.vf-stavenote');
            const count = await notes.count();

            if (count === 0 || hasError) {
                console.error(`FAILURE: Blank question or rendering error found at iteration ${i + 1}`);
                await page.screenshot({ path: `verification/failure_failure_iter_${i + 1}.png` });
                expect(hasError).toBe(false);
                expect(count).toBeGreaterThan(0);
            }
        }
    });
});
