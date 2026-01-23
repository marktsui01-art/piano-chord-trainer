# Changelog

## [1.1.0] - Feature Update

### Added
*   **Rhythm Game:**
    *   New **Polyrhythm (2 vs 3)** module.
    *   Visual "Falling Notes" rhythm display.
    *   Interactive controls (Left Hand 'A' / Right Hand 'L') and Metronome.
*   **Settings:**
    *   **Clef Selector:** Toggle between Treble and Bass clef for all drills.
    *   **Range Control:** Granular range options (Normal, Low, High, Wide).
*   **Inputs:**
    *   **Microphone Support:** Enabled monophonic pitch detection via `pitchy`.

## [1.0.0] - Alpha

### Added
*   **Drill Strategies:**
    *   `SpeedDrill`: Rapid single-note recognition (octave independent).
    *   `IntervalDrill`: Sequential interval recognition (Major/Minor/Perfect intervals).
    *   `MelodyDrill`: Sequential pattern playing (5-note ascending pattern).
*   **Core Logic:**
    *   Implemented `DrillStrategy` pattern for extensible game modes.
    *   Added 'Chromatic' mode for Interval and Speed drills.
    *   Added support for multiple Key Signatures (Major, Minor, Harmonic/Melodic Minor, Modes).
*   **UI/UX:**
    *   Context-sensitive controls (e.g., hiding 'Inversions' for melody drills).
    *   "Reveal Answer" button for Chord drills.
    *   Virtual Piano visual feedback (Green/Red flashing).
    *   Mobile enhancements: Fullscreen toggle, Wake Lock API, Mobile Menu.
*   **Audio:**
    *   Specific feedback for Chord drills (Note -> Pause -> Full Chord).
    *   Tone.js integration with Salamander piano samples.
*   **DevOps:**
    *   Playwright integration for verification (`verification/`).
    *   PWA support via `vite-plugin-pwa`.

### Changed
*   **Refactor:** Migrated monolithic `DrillManager` to use `DrillStrategy` implementations.
*   **Input:** Unified text input handling; `TextInputHandler` now manages sequential inputs.
*   **Docs:** Consolidated project documentation into `docs/` folder.

### Fixed
*   **Audio:** Corrected octave playback for Bass Clef in `MelodyDrill` and `IntervalDrill`.
*   **Validation:** Fixed enharmonic validation logic to accept all valid spellings (e.g., C# vs Db).
*   **UI:** Fixed "Reveal Answer" button visibility logic.

## [Legacy Tasks]
*See archived `PROJECT_TASKS.md` in git history for initial alpha task list.*
