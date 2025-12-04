from playwright.sync_api import Page, expect, sync_playwright

def verify_virtual_piano(page: Page):
  # 1. Arrange: Go to the app homepage.
  page.goto("http://localhost:5173/")

  # Wait for loading to finish
  expect(page.locator('#loading-indicator')).not_to_be_visible(timeout=10000)

  # 2. Switch to Drill Mode
  page.click('#nav-drill')

  # 3. Show Piano
  page.click('#btn-toggle-piano')
  piano_container = page.locator('#virtual-piano-container')
  expect(piano_container).to_be_visible()

  # 4. Set Key to Eb Minor
  page.select_option('#key-select', 'Eb')
  page.select_option('#mode-select', 'Minor')

  # 5. Find the key for B4 (which should correspond to Cb in Eb Minor)
  b4_key = piano_container.locator('.piano-key[data-note="B"][data-octave="4"]')
  expect(b4_key).to_be_visible()

  # 6. Click it to verify highlighting
  b4_key.click()
  expect(b4_key).to_have_class(re.compile(r'active'))

  # 7. Screenshot: Capture the state
  page.screenshot(path="/home/jules/verification/virtual_piano_verification.png")

import re

if __name__ == "__main__":
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    try:
      verify_virtual_piano(page)
    finally:
      browser.close()
