# Project Tasks: Piano Chord Trainer V1.0

Based on `README.md` requirements.

## Phase 1: Foundation & Core Modules
- [x] **Project Setup**
    - [x] Initialize Vite + TypeScript project
    - [x] Configure Vitest for testing
- [x] **Data Models** (`src/modules/content.ts`)
    - [x] Define Note and Chord interfaces
    - [x] Define C Major Triads data
    - [x] Define C Major 7th Chords data
- [x] **Input Manager** (`src/modules/input.ts`)
    - [x] Web MIDI API integration
    - [x] Text Input Parser (Fallback)
    - [x] Input Normalization (Case, Accidentals)
- [x] **Audio Manager** (`src/modules/audio.ts`)
    - [x] Initialize Web Audio API / Tone.js
    - [x] Implement `playChord(notes)`
    - [x] Implement Sound Effects (Correct/Incorrect)
- [x] **Notation Renderer** (`src/modules/notation.ts`)
    - [x] Initialize VexFlow (or similar)
    - [x] Render single chord on staff
    - [x] Handle Treble and Bass clefs

## Phase 2: Game Logic (Drill Engine)
- [x] **Drill Manager** (`src/modules/drill.ts`)
    - [x] Question Generator (Randomize Chord, Inversion, Clef)
    - [x] Answer Validation Logic
    - [x] State Management (Current Question, Score)
- [x] **Scoring System**
    - [x] Track correct/incorrect attempts
    - [x] Reset score functionality

## Phase 3: User Interface (SPA)
- [x] **Navigation**
    - [x] Mode Switcher (Lesson vs Drill)
    - [x] Module Selector (Triads vs 7ths)
- [x] **Lesson Mode UI**
    - [x] Flashcard Display (Name, Notes, Staff)
    - [x] "Play Audio" Button
- [x] **Drill Mode UI**
    - [x] Question Display (Staff/Instruction)
    - [x] Input Area (Text Box / MIDI Status)
    - [x] Feedback Display (Visual Correct/Incorrect)
    - [x] Scoreboard

## Phase 4: Content & Polish
- [x] **Content Verification**
    - [x] Verify all C Major Triads render and play correctly
    - [x] Verify all C Major 7th Chords render and play correctly
- [x] **Refinement**
    - [x] Fix Drill Manager to respect selected Module (Triads/7ths)
    - [x] Styling (CSS)
    - [x] Error Handling (No MIDI device, Audio context start)

## Phase 5: Audio Enhancements
- [x] **Realistic Piano Sound**
    - [x] Implement `Tone.Sampler` with Salamander piano samples
    - [x] Add loading state handling
    - [x] Fallback mechanism

## Phase 6: User Requests
- [x] **Drill Mode Enhancements**
    - [x] Play chord on correct answer (instead of beep)
    - [x] Add Treble/Bass clef selector

