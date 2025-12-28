# Development Guide

## Setup

### Prerequisites
*   Node.js (v20+)
*   npm

### Installation
```bash
git clone https://github.com/yourusername/piano-chord-trainer.git
cd piano-chord-trainer
npm install
```

### Running Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

## Testing

The project uses two testing frameworks with specific workflows.

### Unit Tests (Vitest)
For logic and modules (e.g., `drills`, `keys`, `input`).
```bash
npm run test
```
*Note: This runs in watch mode by default. To run once:*
```bash
npx vitest run
```

### Integration & Verification (Playwright)
For UI, PWA features, and complex flows. Use the scripts in `verification/`.
**Important:** The dev server must be running (`npm run dev`) before running these tests.

```bash
# In a separate terminal while 'npm run dev' is active:
npx playwright test
```

**Known Issue:** Do NOT run `npm run test` for Playwright files (`*.spec.ts`). Vitest is not configured for browser automation and will fail.

### Verification Scripts
Custom verification scripts reside in `verification/`. These are often used for visual regression or feature confirmation.
*   `mode_selector.spec.ts`: Verifies logic for hiding/showing controls based on the selected drill.
*   `test_drills.spec.ts`: Verifies drill rendering and input handling.
*   `feature_lesson_mode.spec.ts`: Verifies lesson mode functionality.
*   `feature_navigation.spec.ts`: Verifies navigation between lesson and drill modes.

## Build & Deployment

### Production Build
```bash
npm run build
```
This performs a type check (`tsc`) and builds the assets via Vite.

### PWA & Offline Support
The app uses `vite-plugin-pwa`.
*   **Service Worker:** `src/pwa.ts` registers the worker.
*   **Caching:** Audio samples (`.mp3` from `tonejs.github.io`) are cached using a runtime strategy in `vite.config.js`.

### GitHub Pages
Deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`) on push to `main`.
