# System Architecture

## Overview

The Piano Chord Trainer is a Progressive Web Application (PWA) built with Vanilla TypeScript and Vite. It employs a modular architecture using the **Strategy Pattern** for drill logic and the **Observer Pattern** for state management.

## Core Modules

### 1. State Management (`src/modules/state.ts`)
*   **Pattern:** Observer
*   **Role:** Central source of truth for the application state.
*   **State Objects:**
    *   `mode`: 'lesson' | 'drill'
    *   `module`: 'triads' | 'sevenths' | 'speed' | 'interval' | 'melody'
    *   `selectedKeyId`: Root note (e.g., 'C', 'F#')
    *   `selectedMode`: Scale mode (e.g., 'Major', 'Dorian', 'Chromatic')
*   **Propagation:** Components subscribe to state changes via `stateManager.subscribe()`.

### 2. Drill System (`src/modules/drills/`)
*   **Pattern:** Strategy
*   **Interface:** `DrillStrategy`
*   **Implementations:**
    *   **Shared Capabilities:**
        *   **Range Management:** Drills respect global range settings (`low`, `high`, `wide`) to constrain generated notes.
        *   **Key Awareness:** Questions are generated relative to the active Key and Mode (e.g., C Major vs C Minor).
        *   **Validation Logic:** Most drills validate based on Pitch Class (ignoring octaves), though specific drills may enforce strict voicing or sequences.
    *   **Implementations:**
        *   `ChordDrill`: Focuses on harmonies (triads/sevenths). Adds logic for **Inversions** and **Polyphonic Validation** (handling partial inputs).
        *   `SpeedDrill`: Optimized for rapid, single-note recognition. Pure pitch-class validation.
        *   `IntervalDrill`: Focuses on relative pitch distance. Enforces **Sequential Input** (Start Note -> Target Note).
        *   `MelodyDrill`: Focuses on musical memory. Enforces **Sequential Input** and includes **Dynamic Difficulty** scaling.
*   **Key Logic:**
    *   `getQuestion()`: Generates a new `DrillQuestion`.
    *   `checkAnswer(input)`: Validates input against the current question. Returns `correct`, `incorrect`, or `continue`.

### 2a. Rhythm System (`src/modules/rhythm-game.ts`)
*   **Role:** Handles the Polyrhythm module logic.
*   **Architecture:** Standalone class that manages its own Canvas loop and Tone.js Transport.
*   **Logic:**
    *   Uses `Tone.Transport` for timing (Metronome & Scoring).
    *   Renders a "Falling Notes" visualizer on an HTML5 Canvas.
    *   Validates input timing against a defined loop duration (e.g., 2s) with tolerance.

### 3. Input Management (`src/modules/input.ts`)
*   **Sources:**
    *   **MIDI:** Via WebMIDI API. Supports polyphonic input.
    *   **Microphone:** Via `AudioInputManager` (Pitchy). Currently monophonic.
    *   **Text/Virtual Piano:** Fallback for mouse/keyboard users.
*   **Normalization:** All inputs are normalized to `NoteName` strings (e.g., "C#", "Bb") before being broadcast.

### 4. Audio Engine (`src/modules/audio.ts`)
*   **Library:** Tone.js
*   **Assets:** Salamander Piano samples (cached via SW).
*   **Feedback:**
    *   **Sequential Drills:** Plays individual notes as they are hit.
    *   **Chord Drills:** Plays the final note, pauses (600ms), then plays the full chord upon completion.

### 5. Notation Rendering (`src/modules/notation.ts`)
*   **Library:** VexFlow
*   **Dynamic Layout:** Width is calculated dynamically based on note count (`Math.max(400, notes.length * 60 + 200)`).
*   **Context:** Supports multiple clefs (Treble/Bass) and dynamic key signatures.

## Data Flow

1.  **User Interaction:** User selects a setting (e.g., Key: Eb Minor).
2.  **State Update:** `StateManager` updates state and notifies subscribers.
3.  **Propagation:**
    *   `DrillManager` updates its active strategy context.
    *   `VirtualPiano` updates its display context (for enharmonic spelling).
4.  **Game Loop:**
    *   `DrillManager` requests a new question from the Strategy.
    *   `NotationRenderer` draws the question.
    *   `InputManager` captures user input.
    *   `DrillManager` validates input via Strategy.
    *   `AudioManager` provides feedback.

## File Structure

```
src/
├── main.ts                 # Application Entry Point & UI Controller
├── modules/
│   ├── state.ts            # State Manager
│   ├── drill.ts            # Drill Manager (Facade)
│   ├── drills/             # Drill Strategies
│   │   ├── DrillStrategy.ts
│   │   ├── ChordDrill.ts
│   │   ├── SpeedDrill.ts
│   │   ├── IntervalDrill.ts
│   │   └── MelodyDrill.ts
│   ├── rhythm-game.ts      # Polyrhythm Logic
│   ├── input.ts            # Input Orchestrator
│   ├── audio.ts            # Audio Output
│   ├── audio-input.ts      # Mic Input
│   ├── notation.ts         # VexFlow Wrapper
│   └── ...
```
