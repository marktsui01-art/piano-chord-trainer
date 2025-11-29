import { NoteName } from '../content';
import { KeySignature, KeyMode, getScaleForKey, getModeRoot, getKeyById } from '../keys';

export type PatternType = 'scale' | 'arpeggio' | 'interval' | 'stepwise' | 'random';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface MelodicPattern {
    notes: { name: NoteName; octave: number }[];
    name: string;
    type: PatternType;
}

// ----------------------------------------
// Musical Helpers
// ----------------------------------------

function getNoteFromScale(scale: NoteName[], scaleIndex: number, rootOctave: number): { name: NoteName, octave: number } {
    const note = scale[scaleIndex % 7];
    // Calculate octave shift based on how many times we wrapped around the 7-note scale
    const octaveOffset = Math.floor(scaleIndex / 7);
    return { name: note, octave: rootOctave + octaveOffset };
}

// ----------------------------------------
// Pattern Generators
// ----------------------------------------

function generateScalePattern(
    key: KeySignature,
    mode: KeyMode,
    length: number,
    ascending: boolean = true
): MelodicPattern {
    const scale = getScaleForKey(key, mode);
    const rootNote = getModeRoot(key, mode);

    // Find the index of the mode's root within the key's scale
    // e.g. Key=C (CDEFGAB), Mode=Dorian (Start on D) -> index 1
    let startIndex = scale.indexOf(rootNote);
    const rootOctave = 4; // Default center

    const notes: { name: NoteName; octave: number }[] = [];

    for (let i = 0; i < length; i++) {
        // Just walk up the scale
        const noteIndex = startIndex + i;
        notes.push(getNoteFromScale(scale, noteIndex, rootOctave));
    }

    if (!ascending) {
        notes.reverse();
    }

    return {
        notes,
        name: `${key.root} ${mode} Scale`,
        type: 'scale'
    };
}

function generateArpeggioPattern(
    key: KeySignature,
    mode: KeyMode,
    length: number
): MelodicPattern {
    const scale = getScaleForKey(key, mode);
    const rootNote = getModeRoot(key, mode);
    const startIndex = scale.indexOf(rootNote);
    const rootOctave = 4;

    // Arpeggio: 1, 3, 5, 7, 8...
    // In 0-indexed scale steps: 0, 2, 4, 6, 7...
    const arpeggioSteps = [0, 2, 4, 7]; // Triad + Octave

    const notes: { name: NoteName; octave: number }[] = [];

    for (let i = 0; i < length; i++) {
        // Cycle through arpeggio steps
        const step = arpeggioSteps[i % arpeggioSteps.length];
        const octaveShift = Math.floor(i / arpeggioSteps.length); // Shift up every full cycle?
        // Actually, simple way:
        // 1st note: step 0
        // 2nd note: step 2
        // 3rd note: step 4
        // 4th note: step 7 (octave)
        // 5th note: step 0 + 7 (next octave)

        // Let's just project the arpeggio pattern linearly
        const currentStep = arpeggioSteps[i % 4] + (7 * Math.floor(i / 4));
        const noteIndex = startIndex + currentStep;

        notes.push(getNoteFromScale(scale, noteIndex, rootOctave));
    }

    return {
        notes,
        name: `${key.root} ${mode} Arpeggio`,
        type: 'arpeggio'
    };
}

/**
 * Generates a "musically random" melody that stays strictly diatonic to the key/mode.
 * - Starts on a stable tone (1, 3, or 5 of the mode).
 * - Moves mostly by step (2nds).
 * - Occasional skips (3rds, 4ths), usually resolved by step in opposite direction.
 */
function generateRandomMelody(
    key: KeySignature,
    mode: KeyMode,
    length: number
): MelodicPattern {
    const scale = getScaleForKey(key, mode);
    const rootNote = getModeRoot(key, mode);
    const startIndex = scale.indexOf(rootNote);
    const rootOctave = 4;

    // Define valid starting degrees relative to mode root (1, 3, 5)
    // 0-indexed: 0, 2, 4
    const startDegrees = [0, 2, 4];
    let currentScaleDegree = startIndex + startDegrees[Math.floor(Math.random() * startDegrees.length)];

    const notes: { name: NoteName; octave: number }[] = [];

    // Add first note
    notes.push(getNoteFromScale(scale, currentScaleDegree, rootOctave));

    for (let i = 1; i < length; i++) {
        const r = Math.random();
        let interval = 0;

        // Probabilistic movement
        if (r < 0.60) {
            // Step (Move by 1)
            interval = Math.random() > 0.5 ? 1 : -1;
        } else if (r < 0.85) {
            // Skip (3rd)
            interval = Math.random() > 0.5 ? 2 : -2;
        } else {
            // Leap (4th or 5th)
            interval = Math.random() > 0.5 ? 3 : -3;
            if (Math.random() > 0.7) interval = interval > 0 ? 4 : -4;
        }

        // Avoid going too high or low (keep within reasonable range relative to start)
        // Let's say range is -5 to +12 from start index
        const potentialNext = currentScaleDegree + interval;
        if (potentialNext < startIndex - 5 || potentialNext > startIndex + 12) {
            interval = -interval; // Reverse direction if out of bounds
        }

        currentScaleDegree += interval;
        notes.push(getNoteFromScale(scale, currentScaleDegree, rootOctave));
    }

    return {
        notes,
        name: `Melody in ${mode}`,
        type: 'random'
    };
}

export function generatePattern(
    keyId: string,
    mode: KeyMode,
    difficulty: Difficulty = 'beginner'
): MelodicPattern {
    const key = getKeyById(keyId);
    if (!key) throw new Error(`Invalid key: ${keyId}`);

    // Adjust length based on difficulty
    let length = 5;
    if (difficulty === 'intermediate') length = 8;
    if (difficulty === 'advanced') length = 16;

    // Select pattern type based on weighted probability or difficulty
    const r = Math.random();

    // For now, let's mix them up
    if (r < 0.4) {
        // 40% Chance: Random Melody (The core request)
        return generateRandomMelody(key, mode, length);
    } else if (r < 0.7) {
        // 30% Chance: Scale Run
        return generateScalePattern(key, mode, length, Math.random() > 0.5);
    } else {
        // 30% Chance: Arpeggio
        return generateArpeggioPattern(key, mode, length);
    }
}
