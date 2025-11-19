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
- [ ] **Audio Manager** (`src/modules/audio.ts`)
    - [ ] Initialize Web Audio API / Tone.js
    - [ ] Implement `playChord(notes)`
    - [ ] Implement Sound Effects (Correct/Incorrect)
- [ ] **Notation Renderer** (`src/modules/notation.ts`)
    - [ ] Initialize VexFlow (or similar)
    - [ ] Render single chord on staff
    - [ ] Handle Treble and Bass clefs

## Phase 2: Game Logic (Drill Engine)
- [ ] **Drill Manager** (`src/modules/drill.ts`)
    - [ ] Question Generator (Randomize Chord, Inversion, Clef)
    - [ ] Answer Validation Logic
    - [ ] State Management (Current Question, Score)
- [ ] **Scoring System**
    - [ ] Track correct/incorrect attempts
    - [ ] Reset score functionality

## Phase 3: User Interface (SPA)
- [ ] **Navigation**
    - [ ] Mode Switcher (Lesson vs Drill)
    - [ ] Module Selector (Triads vs 7ths)
- [ ] **Lesson Mode UI**
    - [ ] Flashcard Display (Name, Notes, Staff)
    - [ ] "Play Audio" Button
- [ ] **Drill Mode UI**
    - [ ] Question Display (Staff/Instruction)
    - [ ] Input Area (Text Box / MIDI Status)
    - [ ] Feedback Display (Visual Correct/Incorrect)
    - [ ] Scoreboard

## Phase 4: Content & Polish
- [ ] **Content Verification**
    - [ ] Verify all C Major Triads render and play correctly
    - [ ] Verify all C Major 7th Chords render and play correctly
- [ ] **Refinement**
    - [ ] Styling (CSS)
    - [ ] Error Handling (No MIDI device, Audio context start)
