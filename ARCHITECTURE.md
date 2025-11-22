# Piano Chord Trainer - Architecture Documentation

## Overview

The Piano Chord Trainer is a web-based application designed to help users learn and practice piano chords through two modes: **Lesson Mode** (sequential learning) and **Drill Mode** (randomized practice with inversions).

## System Architecture

### Layered Architecture

The application follows a clean layered architecture pattern:

1. **Presentation Layer** - HTML/CSS UI with two distinct modes
2. **Application Controller** - `main.ts` orchestrates all modules and handles events
3. **Business Logic Layer** - Core managers and I/O handlers
4. **Data Layer** - Chord definitions and musical content

### Key Design Patterns

- **Observer Pattern**: `StateManager` notifies subscribers of state changes
- **Module Pattern**: Each manager is a self-contained module with clear responsibilities
- **Separation of Concerns**: Clear boundaries between UI, business logic, and data

## Core Modules

### StateManager
**Purpose**: Centralized application state management

**Responsibilities**:
- Tracks current mode (lesson/drill)
- Tracks current module (triads/sevenths)
- Notifies subscribers of state changes
- Implements Observer pattern

**Key Methods**:
- `setMode(mode)` - Switch between lesson and drill modes
- `setModule(module)` - Switch between triads and sevenths
- `subscribe(listener)` - Register state change listeners

### DrillManager
**Purpose**: Manages randomized chord practice with inversions

**Responsibilities**:
- Generates random chord questions
- Handles inversion randomization (root, 1st, 2nd, 3rd)
- Handles octave shift randomization (wide range feature)
- Normalizes chord voicings to prevent excessive spreads
- Validates user answers
- Tracks score

**Key Methods**:
- `getQuestion()` - Generate new random chord with inversion/octave shift
- `getCurrentVoicing(baseOctave)` - Get VexFlow-formatted notes
- `getCurrentPitches(baseOctave)` - Get Tone.js-formatted notes
- `getNormalizedNotes()` - **NEW**: Normalize voicing to ensure spread ≤ 12 semitones
- `checkAnswer(notes)` - Validate user input

**Recent Enhancement**: Added voicing normalization to ensure inversions and octave shifts produce musically reasonable voicings.

### LessonManager
**Purpose**: Sequential chord learning

**Responsibilities**:
- Provides sequential access to chord library
- Tracks current position in lesson
- Supports forward/backward navigation

**Key Methods**:
- `getCurrentChord()` - Get current lesson chord
- `next()` - Move to next chord
- `previous()` - Move to previous chord

### InputManager
**Purpose**: Handle multiple input sources

**Responsibilities**:
- MIDI keyboard input (WebMIDI API)
- Microphone pitch detection (Pitchy library)
- Text input parsing
- Notify main controller of detected notes

**Key Methods**:
- `enableMIDI()` - Initialize MIDI input
- `enableMicrophone()` - Initialize pitch detection
- `getCurrentNotes()` - Get currently detected notes
- `clear()` - Reset input state

### AudioManager
**Purpose**: Sound playback and feedback

**Responsibilities**:
- Load piano samples
- Play chord sounds
- Play correct/incorrect feedback sounds

**Dependencies**: Tone.js for audio synthesis

**Key Methods**:
- `playChord(notes, duration, octave)` - Play chord with single octave
- `playNotes(pitches, duration)` - Play specific pitches (for inversions)
- `playCorrect()` - Success sound
- `playIncorrect()` - Error sound

### NotationRenderer
**Purpose**: Visual music notation display

**Responsibilities**:
- Render chords on musical staff
- Support treble and bass clefs
- Handle ledger lines for wide range

**Dependencies**: VexFlow for music notation rendering

**Key Methods**:
- `render(notes, clef)` - Render chord on staff

## Data Flow

### Drill Mode - New Question Flow

1. **User Action**: Clicks "New Question"
2. **Question Generation**: 
   - `DrillManager.getQuestion()` generates random chord
   - Randomizes inversion (0-3)
   - Randomizes octave shift (-1, 0, +1)
   - Normalizes voicing via `getNormalizedNotes()`
3. **Visual Display**:
   - `NotationRenderer.render()` displays chord on staff
   - Uses `getCurrentVoicing()` for VexFlow format
4. **User Input**:
   - `InputManager` detects notes (MIDI/mic/text)
   - Calls `onNotesChange` callback
5. **Answer Validation**:
   - `DrillManager.checkAnswer()` validates input
   - Returns correct/incorrect
6. **Feedback**:
   - `AudioManager` plays appropriate sound
   - UI updates with feedback message

### Lesson Mode Flow

1. **User Action**: Clicks next/previous or play
2. **Chord Selection**: `LessonManager` provides current chord
3. **Display**: Both notation and text display update
4. **Audio**: `AudioManager` plays chord when requested

## Voicing Normalization Algorithm

**Problem**: Inversions and octave shifts could create voicings with notes too far apart (>12 semitones), making them visually and musically unreasonable.

**Solution**: Three-step normalization process in `getNormalizedNotes()`:

### Step 1: Normalize Root Position
- Ensures root position chords are in ascending order
- Example: G Major (G, B, D) → G4, B4, D5 (not G4, B4, D4)
- Compares each note with chromatic scale order
- Increments octave when wrapping around

### Step 2: Apply Inversion
- Rotates notes based on inversion level
- Moves bottom note to top with +1 octave offset
- Example: 1st inversion of G Major → B4, D5, G5

### Step 3: Apply Octave Shift
- Adds global octave shift for "Wide Range" feature
- Shifts all notes by -1, 0, or +1 octaves
- Example: +1 shift → B5, D6, G6

### Result
- All voicings have spread ≤ 12 semitones (one octave)
- Visually reasonable on staff
- Musically practical for sight-reading

## External Dependencies

- **Tone.js**: Audio synthesis and playback
- **VexFlow**: Music notation rendering
- **WebMIDI API**: MIDI keyboard input
- **Pitchy**: Microphone pitch detection
- **Vite**: Build tool and dev server
- **Vitest**: Unit testing framework

## Testing

The project includes comprehensive unit tests:

- `state.test.ts` - State management tests
- `lesson.test.ts` - Lesson mode tests
- `drill.test.ts` - Drill mode tests
- `input.test.ts` - Input handling tests
- `voicing_verification.test.ts` - **NEW**: Verifies voicing spreads ≤ 12 semitones

All tests use Vitest and follow the Arrange-Act-Assert pattern.

## File Structure

```
src/
├── main.ts                 # Application controller
├── style.css              # Global styles
└── modules/
    ├── state.ts           # State management
    ├── drill.ts           # Drill mode logic
    ├── lesson.ts          # Lesson mode logic
    ├── input.ts           # Input handling
    ├── audio.ts           # Audio playback
    ├── audio-input.ts     # Microphone input
    ├── notation.ts        # VexFlow rendering
    ├── content.ts         # Chord definitions
    └── *.test.ts          # Unit tests
```

## Future Enhancements

Potential areas for expansion:
- Additional chord types (diminished, augmented, extended chords)
- Custom chord progressions
- Rhythm practice mode
- Recording and playback of practice sessions
- Progress tracking and analytics
- Multiple key signatures
