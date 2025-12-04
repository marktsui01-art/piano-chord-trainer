import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to local dev server (default vite port is usually 5173, but let's check or try)
    // Assuming standard vite behavior.
    await page.goto('http://localhost:5173');

    // Wait for app to load
    await page.waitForSelector('#app-header');

    // Screenshot 1: Initial State (Lesson Mode)
    await page.screenshot({ path: 'verification/1-lesson-mode.png' });
    console.log('Captured Lesson Mode');

    // 1. Switch to Drill Mode
    await page.click('#nav-drill');
    await page.waitForSelector('#drill-container.active');

    // 2. Select "Melodic Sight-Reading" (should set piano to Trigger mode)
    await page.selectOption('#module-select', 'melody');

    // Screenshot 2: Drill Mode (Melody)
    await page.screenshot({ path: 'verification/2-melody-mode.png' });
    console.log('Captured Melody Mode');

    // 3. Show Piano
    await page.click('#btn-toggle-piano');
    await page.waitForSelector('#virtual-piano-container', { state: 'visible' });

    // Screenshot 3: With Piano Visible
    await page.screenshot({ path: 'verification/3-melody-piano.png' });
    console.log('Captured Piano Visible');

    // 4. Test Trigger Interaction
    // We want to verify that clicking a key "flashes" it but doesn't keep it toggled "active" (green forever).
    // We can't easily capture the flash in a static screenshot without precise timing,
    // but we can verify that after a short delay, the key is NOT active.

    // Find C4 key
    const c4Key = page.locator('.piano-key[data-note="C"][data-octave="4"]');
    await c4Key.click();

    // Wait for flash duration (e.g. 600ms)
    await page.waitForTimeout(600);

    // Verify key does NOT have 'active' class
    const isActive = await c4Key.getAttribute('class');
    if (isActive?.includes('active')) {
        console.error('FAIL: Key remained active in Trigger Mode!');
    } else {
        console.log('PASS: Key is not active after click (Trigger Mode)');
    }

    // 5. Test Smart Text Input (Space flush)
    // Type 'C' -> Wait -> Type ' ' -> Should submit 'C'
    await page.focus('#text-input');
    await page.keyboard.type('C');
    await page.keyboard.type(' ');

    // Check if input was cleared (which happens on correct/continue or submit)
    // Or check detected notes
    // If we are in melody drill, 'C' might be correct or incorrect.
    // If incorrect, input stays? No, we cleared it in code if correct/continue.
    // If incorrect, we set it to empty in my code?
    // Wait, "if drillManager.isSequential and result === 'incorrect' -> textInput.value = ''"

    // Let's type 'C' and see if input is empty after space.
    await page.waitForTimeout(100);
    const val = await page.inputValue('#text-input');
    if (val === '') {
        console.log('PASS: Text input flushed and processed (Input cleared)');
    } else {
        console.log('INFO: Text input value is: ' + val);
    }

    await page.screenshot({ path: 'verification/4-final.png' });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
})();
