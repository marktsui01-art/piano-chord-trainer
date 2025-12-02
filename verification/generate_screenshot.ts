
import { chromium, Browser, Page } from 'playwright';

async function generateScreenshot() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. Navigate to the app (assuming default Vite port)
    await page.goto('http://localhost:5173');

    // Wait for the app to load
    await page.waitForSelector('h1');

    // 2. Interact to show a meaningful state (Drill Mode)
    // Click on "Drill Mode" button if it exists, or navigate to it.
    // Based on README, the main nav allows selecting Lesson or Drill.
    // Let's try to find a button that starts a drill.

    // Inspecting the DOM structure would be ideal, but let's assume standard button text based on code.
    // Looking at main.ts/index.html would help, but I'll try to find "Drill" text.

    const drillButton = page.getByText('Drill Mode', { exact: false }).first();
    if (await drillButton.isVisible()) {
        await drillButton.click();
    } else {
        // Maybe it's a specific module drill button
        // Let's try clicking the first available "Drill" button
        const anyDrillButton = page.getByRole('button', { name: /Drill/i }).first();
         if (await anyDrillButton.isVisible()) {
            await anyDrillButton.click();
         }
    }

    // Wait for notation to appear (canvas or svg)
    await page.waitForTimeout(1000); // Give it a sec to render notation

    // 3. Take screenshot
    await page.screenshot({ path: 'public/app-screenshot.png' });
    console.log('Screenshot saved to public/app-screenshot.png');

  } catch (error) {
    console.error('Error generating screenshot:', error);
  } finally {
    await browser.close();
  }
}

generateScreenshot();
