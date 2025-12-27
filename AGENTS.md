# Agent Instructions & Memories

This file contains specific instructions, coding conventions, and "tribal knowledge" for AI agents working on this codebase.

## 1. Environment & Commands

*   **Development Server:** `npm run dev`
*   **Unit Tests:** `npm run test` (Vitest).
    *   *Note:* Runs in watch mode by default. Use `npx vitest run` for a single pass.
*   **Verification (Playwright):** `npx playwright test`
    *   **CRITICAL:** The development server must be running (`npm run dev`) before executing Playwright tests.
    *   **Conflict:** Do not run `npm run test` on `*.spec.ts` files; Vitest will fail.

## 2. Coding Conventions

### Drill Implementation
*   **Strategy Pattern:** All new drills must implement `DrillStrategy` (`src/modules/drills/DrillStrategy.ts`).
*   **Octave Handling:** Use relative offsets. Renderers provide a `baseOctave` (e.g., 4 for Treble). Drills should calculate final pitches as `baseOctave + offset`.
*   **Input Validation:**
    *   **Chord Drills:** Use exact pitch matching (accumulated input).
    *   **Sequential Drills:** Use `TextInputHandler` for smart flushing.

### State Management
*   **Key/Mode Context:** When updating the global Key or Mode, explicitly propagate the context to `LessonManager`, `DrillManager`, and `VirtualPiano` via `setKeyContext`.

### UI & Accessibility
*   **ARIA Labels:** All icon-only buttons and inputs must have `aria-label`.
*   **Dynamic Elements:** The microphone button (`#btn-mic`) is context-sensitive; ensure it exists before attaching listeners.

## 3. Verification & Testing

*   **Headless Audio:** Playwright tests verifying audio features often require mocking `window.AudioContext` and `navigator.mediaDevices`.
*   **Screenshot Verification:** Frontend changes are verified using Playwright scripts in `verification/`.
*   **Enharmonics:** Use `isEnharmonicMatch` (chromatic index comparison) for logic, but preserve context-aware spelling (e.g., 'Cb') for UI display.
