import { NoteName } from '../content';
import { KeyMode, getScaleForKey } from '../keys';

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


// Legacy Arpeggio Intervals (Chromatic Semitones)
export const MAJOR_TRIAD = [0, 4, 7, 12];
export const MINOR_TRIAD = [0, 3, 7, 12];
export const MAJOR_SEVENTH = [0, 4, 7, 11];
export const MINOR_SEVENTH = [0, 3, 7, 10];

// Diatonic Arpeggio Steps (Scale Degrees: 1-3-5-8, 1-3-5-7)
export const DIATONIC_TRIAD_STEPS = [0, 2, 4, 7]; // Triad + Octave
export const DIATONIC_SEVENTH_STEPS = [0, 2, 4, 6];

function getNoteFromScale(scale: NoteName[], scaleIndex: number, rootOctave: number): { name: NoteName, octave: number } {
    const note = scale[scaleIndex % 7];
    // Calculate octave shift based on how many times we wrapped around the 7-note scale
    const octaveOffset = Math.floor(scaleIndex / 7);
    return { name: note, octave: rootOctave + octaveOffset };
}

// ----------------------------------------
// Pattern Generators
// ----------------------------------------


// --- Chromatic / Legacy Generators (REMOVED - not used with new KeyMode system) ---


// --- Diatonic Generators ---

function generateScalePattern(
    root: string,
    mode: KeyMode,
    length: number,
    ascending: boolean = true
): MelodicPattern {
    const scale = getScaleForKey(root, mode);
    // In new logic, scale[0] IS the root note
    const startIndex = 0;
    const rootOctave = 4;
    const notes: { name: NoteName; octave: number }[] = [];

    for (let i = 0; i < length; i++) {
        const noteIndex = startIndex + i;
        notes.push(getNoteFromScale(scale, noteIndex, rootOctave));
    }
    if (!ascending) notes.reverse();
    return { notes, name: `${root} ${mode} Scale`, type: 'scale' };
}

function generateArpeggioPattern(
    root: string,
    mode: KeyMode,
    length: number
): MelodicPattern {
    const scale = getScaleForKey(root, mode);
    const startIndex = 0;
    const rootOctave = 4;

    // Use Diatonic Steps constant
    const arpeggioSteps = DIATONIC_TRIAD_STEPS;
    const notes: { name: NoteName; octave: number }[] = [];

    for (let i = 0; i < length; i++) {
        const currentStep = arpeggioSteps[i % 4] + (7 * Math.floor(i / 4));
        const noteIndex = startIndex + currentStep;
        notes.push(getNoteFromScale(scale, noteIndex, rootOctave));
    }
    return { notes, name: `${root} ${mode} Arpeggio`, type: 'arpeggio' };
}

function generateIntervalPattern(
    root: string,
    mode: KeyMode,
    length: number,
    intervalStep: number
): MelodicPattern {
    const scale = getScaleForKey(root, mode);
    const startIndex = 0;
    const rootOctave = 4;
    const notes: { name: NoteName; octave: number }[] = [];

    // e.g. intervalStep=2 (3rds), =3 (4ths), =4 (5ths)

    for (let i = 0; i < length; i++) {
        const baseIndex = startIndex + i;
        const targetIndex = baseIndex + intervalStep;
        notes.push(getNoteFromScale(scale, baseIndex, rootOctave));
        notes.push(getNoteFromScale(scale, targetIndex, rootOctave));
    }

    const intervalNames: Record<number, string> = {
        1: '2nds', 2: '3rds', 3: '4ths', 4: '5ths', 5: '6ths', 6: '7ths', 7: 'Octaves'
    };

    return {
        notes,
        name: `${root} ${mode} Broken ${intervalNames[intervalStep] || 'Intervals'}`,
        type: 'interval'
    };
}

function generateStepwisePattern(
    root: string,
    mode: KeyMode,
    length: number
): MelodicPattern {
    const scale = getScaleForKey(root, mode);
    const startIndex = 0;
    const rootOctave = 4;
    const relativeSteps = [0, 1, 2, 1, 0, -1, 0, 1];
    const notes: { name: NoteName; octave: number }[] = [];

    for (let i = 0; i < length; i++) {
        const step = relativeSteps[i % relativeSteps.length];
        const noteIndex = startIndex + step;
        notes.push(getNoteFromScale(scale, noteIndex, rootOctave));
    }
    return { notes, name: `${root} ${mode} Stepwise`, type: 'stepwise' };
}

function generateRandomMelody(
    root: string,
    mode: KeyMode,
    length: number
): MelodicPattern {
    const scale = getScaleForKey(root, mode);
    const startIndex = 0;
    const rootOctave = 4;
    const startDegrees = [0, 2, 4];
    let currentScaleDegree = startIndex + startDegrees[Math.floor(Math.random() * startDegrees.length)];
    const notes: { name: NoteName; octave: number }[] = [];

    notes.push(getNoteFromScale(scale, currentScaleDegree, rootOctave));

    for (let i = 1; i < length; i++) {
        const r = Math.random();
        let interval = 0;
        if (r < 0.60) interval = Math.random() > 0.5 ? 1 : -1;
        else if (r < 0.85) interval = Math.random() > 0.5 ? 2 : -2;
        else {
            interval = Math.random() > 0.5 ? 3 : -3;
            if (Math.random() > 0.7) interval = interval > 0 ? 4 : -4;
        }
        const potentialNext = currentScaleDegree + interval;
        if (potentialNext < startIndex - 5 || potentialNext > startIndex + 12) interval = -interval;
        currentScaleDegree += interval;
        notes.push(getNoteFromScale(scale, currentScaleDegree, rootOctave));
    }
    return { notes, name: `Melody in ${mode}`, type: 'random' };
}

export function generatePattern(
    root: string,
    mode: KeyMode,
    difficulty: Difficulty = 'beginner'
): MelodicPattern {
    // Adjust length
    let length = 5;
    if (difficulty === 'intermediate') length = 8;
    if (difficulty === 'advanced') length = 8; // Capped to 8 notes as requested

    // --- Chromatic / Legacy Logic (DISABLED - not a valid KeyMode) ---
    // if (mode === 'Chromatic') {
    //     const roots: NoteName[] = ['C', 'D', 'E', 'F', 'G'];
    //     const randomRoot = roots[Math.floor(Math.random() * roots.length)];
    //     const rootOctave = 4;
    //
    //     // Randomly pick legacy pattern types
    //     const r = Math.random();
    //     if (r < 0.4) {
    //         // Intervals (e.g. Major 3rds, 4ths)
    //         const interval = [4, 5, 7][Math.floor(Math.random() * 3)];
    //         return generateChromaticIntervalPattern(randomRoot, rootOctave, interval, length);
    //     } else if (r < 0.7) {
    //         // Arpeggios (restored)
    //         return generateChromaticArpeggioPattern(randomRoot, rootOctave, 'major', length);
    //     } else {
    //         // Stepwise
    //         return generateChromaticStepwisePattern(randomRoot, rootOctave, length);
    //     }
    // }

    // --- Diatonic Logic ---
    const r = Math.random();
    if (r < 0.3) {
        return generateRandomMelody(root, mode, length);
    } else if (r < 0.5) {
        return generateScalePattern(root, mode, length, Math.random() > 0.5);
    } else if (r < 0.7) {
        return generateArpeggioPattern(root, mode, length);
    } else if (r < 0.85) {
        // Random diatonic interval step (3rds, 4ths, 5ths)
        // 2=3rd, 3=4th, 4=5th
        const intervalStep = 2 + Math.floor(Math.random() * 3);
        return generateIntervalPattern(root, mode, Math.max(3, Math.floor(length / 2)), intervalStep);
    } else {
        return generateStepwisePattern(root, mode, length);
    }
}
