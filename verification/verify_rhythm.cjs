const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  // Mock AudioContext
  await page.addInitScript(() => {
    window.AudioContext = class {
      constructor() {
        this.state = 'suspended';
        this.destination = {};
      }
      createGain() { return { connect: () => {}, gain: { value: 0 } }; }
      createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 0 }, type: 'sine' }; }
      createDynamicsCompressor() { return { connect: () => {}, threshold: {}, knee: {}, ratio: {}, attack: {}, release: {} }; }
      createBufferSource() { return { connect: () => {}, start: () => {}, stop: () => {}, buffer: null, playbackRate: { value: 1 } }; }
      decodeAudioData() { return Promise.resolve({}); }
      resume() { return Promise.resolve(); }
    };
    window.webkitAudioContext = window.AudioContext;
  });

  try {
      console.log('Navigating to app...');
      await page.goto('http://localhost:5173/');

      console.log('Selecting Rhythm module...');
      await page.selectOption('#module-select', 'rhythm');

      // Wait for rhythm container animation
      console.log('Waiting for rhythm container...');
      const rhythmContainer = page.locator('#rhythm-container');
      await rhythmContainer.waitFor({ state: 'visible', timeout: 5000 });

      // Check for buttons
      console.log('Checking controls...');
      await page.locator('#btn-rhythm-l0').waitFor({ state: 'visible' });
      await page.locator('#sel-rhythm-difficulty').waitFor({ state: 'visible' });

      // Screenshot
      const screenshotPath = path.join(__dirname, 'rhythm_ui.png');
      console.log(`Taking screenshot at ${screenshotPath}...`);
      await page.screenshot({ path: screenshotPath });
      console.log('Done.');

  } catch (e) {
      console.error('Error:', e);
  } finally {
      await browser.close();
  }
})();
