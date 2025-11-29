from playwright.sync_api import sync_playwright

def verify_audio_cache():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to app (1st load)...")
        page.goto("http://localhost:4173")

        print("Waiting for Service Worker registration...")
        # Give SW time to install and activate
        page.wait_for_timeout(3000)

        print("Reloading page to ensure SW control...")
        page.reload()

        print("Waiting for 'Sounds Ready' (2nd load)...")
        page.wait_for_selector("text=Sounds Ready", timeout=60000)

        print("Waiting for caching...")
        page.wait_for_timeout(5000)

        print("Checking cache...")
        cache_keys = page.evaluate("""
            async () => {
                const hasCache = await caches.has('piano-samples-cache');
                if (!hasCache) return { exists: false, keys: [] };

                const cache = await caches.open('piano-samples-cache');
                const keys = await cache.keys();
                return {
                    exists: true,
                    keys: keys.map(req => req.url)
                };
            }
        """)

        print(f"Cache check result: {cache_keys}")

        if cache_keys['exists']:
            count = len(cache_keys['keys'])
            print(f"Found 'piano-samples-cache' with {count} entries.")
            if count > 0:
                print("SUCCESS: Audio samples are cached.")
                for url in cache_keys['keys'][:3]:
                    print(f" - {url}")
            else:
                print("FAILURE: Cache exists but is empty.")
        else:
            print("FAILURE: 'piano-samples-cache' not found.")

        browser.close()

if __name__ == "__main__":
    verify_audio_cache()
