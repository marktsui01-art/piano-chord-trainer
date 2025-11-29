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

const CHROMATIC_SCALE: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function getNoteFromInterval(root: NoteName, rootOctave: number, semitones: number): { name: NoteName; octave: number } {
    const rootIndex = CHROMATIC_SCALE.indexOf(root);
    const targetIndex = (rootIndex + semitones) % 12;
    const octaveOffset = Math.floor((rootIndex + semitones) / 12);

    return {
        name: CHROMATIC_SCALE[targetIndex],
        octave: rootOctave + octaveOffset
    };
}

function getNoteFromScale(scale: NoteName[], scaleIndex: number, rootOctave: number): { name: NoteName, octave: number } {
    const note = scale[scaleIndex % 7];
    // Calculate octave shift based on how many times we wrapped around the 7-note scale
    const octaveOffset = Math.floor(scaleIndex / 7);
    return { name: note, octave: rootOctave + octaveOffset };
}

// ----------------------------------------
// Pattern Generators
// ----------------------------------------

// --- Chromatic / Legacy Generators ---

function generateChromaticIntervalPattern(
    root: NoteName,
    rootOctave: number,
    interval: number,
    length: number = 5
): MelodicPattern {
    const notes: { name: NoteName; octave: number }[] = [];
    for (let i = 0; i < length; i++) {
        notes.push(getNoteFromInterval(root, rootOctave, i * interval));
    }
    const intervalNames: Record<number, string> = {
        2: '2nds', 3: 'Minor 3rds', 4: 'Major 3rds', 5: '4ths', 7: '5ths'
    };
    return { notes, name: `${root} ${intervalNames[interval] || 'Intervals'} (Chromatic)`, type: 'interval' };
}

function generateChromaticStepwisePattern(
    root: NoteName,
    rootOctave: number,
    length: number = 5
): MelodicPattern {
    // Simple stepwise pattern (like C-D-E-D-C or C-D-E-F-G) - Chromatic logic uses Major Scale steps usually
    // Replicating old logic:
    const patterns = [
        [0, 2, 4, 2, 0],           // Up and down
        [0, 2, 4, 5, 7],           // 5-finger ascending
        [7, 5, 4, 2, 0],           // 5-finger descending
        [0, 2, 0, 4, 2, 0],        // Neighbor tones
    ];
    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
    const intervals = selectedPattern.slice(0, length);
    const notes = intervals.map(interval => getNoteFromInterval(root, rootOctave, interval));
    return { notes, name: `${root} Stepwise Pattern (Chromatic)`, type: 'stepwise' };
}

// --- Diatonic Generators ---

function generateScalePattern(
    key: KeySignature,
    mode: KeyMode,
    length: number,
    ascending: boolean = true
): MelodicPattern {
    const scale = getScaleForKey(key, mode);
    const rootNote = getModeRoot(key, mode);
    let startIndex = scale.indexOf(rootNote);
    const rootOctave = 4;
    const notes: { name: NoteName; octave: number }[] = [];

    for (let i = 0; i < length; i++) {
        const noteIndex = startIndex + i;
        notes.push(getNoteFromScale(scale, noteIndex, rootOctave));
    }
    if (!ascending) notes.reverse();
    return { notes, name: `${key.root} ${mode} Scale`, type: 'scale' };
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
    const arpeggioSteps = [0, 2, 4, 7];
    const notes: { name: NoteName; octave: number }[] = [];

    for (let i = 0; i < length; i++) {
        const currentStep = arpeggioSteps[i % 4] + (7 * Math.floor(i / 4));
        const noteIndex = startIndex + currentStep;
        notes.push(getNoteFromScale(scale, noteIndex, rootOctave));
    }
    return { notes, name: `${key.root} ${mode} Arpeggio`, type: 'arpeggio' };
}

function generateIntervalPattern(
    key: KeySignature,
    mode: KeyMode,
    length: number,
    intervalStep: number
): MelodicPattern {
    const scale = getScaleForKey(key, mode);
    const rootNote = getModeRoot(key, mode);
    const startIndex = scale.indexOf(rootNote);
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
        name: `${key.root} ${mode} Broken ${intervalNames[intervalStep] || 'Intervals'}`,
        type: 'interval'
    };
}

function generateStepwisePattern(
    key: KeySignature,
    mode: KeyMode,
    length: number
): MelodicPattern {
    const scale = getScaleForKey(key, mode);
    const rootNote = getModeRoot(key, mode);
    const startIndex = scale.indexOf(rootNote);
    const rootOctave = 4;
    const relativeSteps = [0, 1, 2, 1, 0, -1, 0, 1];
    const notes: { name: NoteName; octave: number }[] = [];

    for (let i = 0; i < length; i++) {
        const step = relativeSteps[i % relativeSteps.length];
        const noteIndex = startIndex + step;
        notes.push(getNoteFromScale(scale, noteIndex, rootOctave));
    }
    return { notes, name: `${key.root} ${mode} Stepwise`, type: 'stepwise' };
}

function generateRandomMelody(
    key: KeySignature,
    mode: KeyMode,
    length: number
): MelodicPattern {
    const scale = getScaleForKey(key, mode);
    const rootNote = getModeRoot(key, mode);
    const startIndex = scale.indexOf(rootNote);
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
    keyId: string,
    mode: KeyMode,
    difficulty: Difficulty = 'beginner'
): MelodicPattern {
    const key = getKeyById(keyId);
    if (!key) throw new Error(`Invalid key: ${keyId}`);

    // Adjust length
    let length = 5;
    if (difficulty === 'intermediate') length = 8;
    if (difficulty === 'advanced') length = 16;

    // --- Chromatic / Legacy Logic ---
    if (key.type === 'Chromatic') {
        const roots: NoteName[] = ['C', 'D', 'E', 'F', 'G'];
        const root = roots[Math.floor(Math.random() * roots.length)];
        const rootOctave = 4;

        // Randomly pick legacy pattern types
        const r = Math.random();
        if (r < 0.5) {
             // Intervals (e.g. Major 3rds, 4ths)
             const interval = [4, 5, 7][Math.floor(Math.random() * 3)];
             return generateChromaticIntervalPattern(root, rootOctave, interval, length);
        } else {
             // Stepwise
             return generateChromaticStepwisePattern(root, rootOctave, length);
        }
    }

    // --- Diatonic Logic ---
    const r = Math.random();
    if (r < 0.3) {
        return generateRandomMelody(key, mode, length);
    } else if (r < 0.5) {
        return generateScalePattern(key, mode, length, Math.random() > 0.5);
    } else if (r < 0.7) {
        return generateArpeggioPattern(key, mode, length);
    } else if (r < 0.85) {
        // Random diatonic interval step (3rds, 4ths, 5ths)
        // 2=3rd, 3=4th, 4=5th
        const intervalStep = 2 + Math.floor(Math.random() * 3);
        return generateIntervalPattern(key, mode, Math.max(3, Math.floor(length / 2)), intervalStep);
    } else {
        return generateStepwisePattern(key, mode, length);
    }
}
