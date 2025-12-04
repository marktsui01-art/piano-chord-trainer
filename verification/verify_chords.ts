import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('#app-header');

    // 1. Ensure we are in Drill Mode -> Triads (Default)
    await page.click('#nav-drill');
    await page.waitForSelector('#drill-container.active');

    // Check module selector is triads
    const moduleValue = await page.$eval('#module-select', el => (el as HTMLSelectElement).value);
    if (moduleValue !== 'triads') {
        console.log('Switching to Triads...');
        await page.selectOption('#module-select', 'triads');
    }

    // 2. Get the Question
    const questionText = await page.textContent('#question-text');
    console.log(`Question: ${questionText}`);
    // e.g. "Play: C Major"

    // 3. Type "C E G" (assuming C Major for simplicity, or just verify behavior doesn't clear early)
    // We'll type "C", wait, " ", wait, "E".
    // If broken, "C " will trigger flush and maybe clear or show error.

    await page.focus('#text-input');
    await page.keyboard.type('C');
    await page.waitForTimeout(100);
    await page.keyboard.type(' ');
    await page.waitForTimeout(100);

    // Check value. If logic is broken, "C" was submitted.
    // ChordDrill ("C") -> Incorrect.
    // Does ChordDrill clear input on incorrect?
    // In main.ts, I only clear input for sequential drills on incorrect.
    // For Chords (non-sequential), input might stay?

    const valAfterSpace = await page.inputValue('#text-input');
    console.log(`Value after "C ": "${valAfterSpace}"`);

    // If TextInputHandler flushed, it called handleDrillInput(['C']).
    // ChordDrill checked ['C']. Result: Incorrect (or null?).
    // Feedback text should show "Try Again" if incorrect.

    const feedback = await page.textContent('#feedback-text');
    console.log(`Feedback: "${feedback}"`);

    if (feedback?.includes('Try Again')) {
        console.error('FAIL: Input was submitted prematurely!');
    } else {
        console.log('PASS: Input was not submitted prematurely.');
    }

    await page.keyboard.type('E');
    await page.keyboard.type(' ');
    await page.keyboard.type('G');

    const finalVal = await page.inputValue('#text-input');
    console.log(`Value after "C E G": "${finalVal}"`);

    // Now hit Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const feedbackFinal = await page.textContent('#feedback-text');
    console.log(`Final Feedback: "${feedbackFinal}"`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
})();
