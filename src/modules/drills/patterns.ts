import { NoteName } from '../content';

export type PatternType = 'scale' | 'arpeggio' | 'interval' | 'stepwise';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ScaleType = 'major' | 'naturalMinor' | 'harmonicMinor' | 'melodicMinor';

export interface MelodicPattern {
    notes: { name: NoteName; octave: number }[];
    name: string;
    type: PatternType;
}

const CHROMATIC_SCALE: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Major scale intervals (in semitones from root)
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11, 12];
const NATURAL_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10, 12];
const HARMONIC_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 11, 12];
const MELODIC_MINOR_INTERVALS = [0, 2, 3, 5, 7, 9, 11, 12];

// Arpeggio intervals
const MAJOR_TRIAD = [0, 4, 7, 12];
const MINOR_TRIAD = [0, 3, 7, 12];
const MAJOR_SEVENTH = [0, 4, 7, 11];
const MINOR_SEVENTH = [0, 3, 7, 10];

function getNoteFromInterval(root: NoteName, rootOctave: number, semitones: number): { name: NoteName; octave: number } {
    const rootIndex = CHROMATIC_SCALE.indexOf(root);
    const targetIndex = (rootIndex + semitones) % 12;
    const octaveOffset = Math.floor((rootIndex + semitones) / 12);

    return {
        name: CHROMATIC_SCALE[targetIndex],
        octave: rootOctave + octaveOffset
    };
}

function generateScalePattern(
    root: NoteName,
    rootOctave: number,
    scaleType: ScaleType,
    length: number,
    ascending: boolean = true
): MelodicPattern {
    let intervals: number[];
    let scaleName: string;

    switch (scaleType) {
        case 'major':
            intervals = MAJOR_SCALE_INTERVALS;
            scaleName = 'Major';
            break;
        case 'naturalMinor':
            intervals = NATURAL_MINOR_INTERVALS;
            scaleName = 'Natural Minor';
            break;
        case 'harmonicMinor':
            intervals = HARMONIC_MINOR_INTERVALS;
            scaleName = 'Harmonic Minor';
            break;
        case 'melodicMinor':
            intervals = MELODIC_MINOR_INTERVALS;
            scaleName = 'Melodic Minor';
            break;
    }

    // Take first 'length' notes
    const selectedIntervals = intervals.slice(0, Math.min(length, intervals.length));

    let notes = selectedIntervals.map(interval => getNoteFromInterval(root, rootOctave, interval));

    if (!ascending) {
        notes = notes.reverse();
    }

    const direction = ascending ? 'Ascending' : 'Descending';
    const name = `${root} ${scaleName} ${direction}`;

    return { notes, name, type: 'scale' };
}

function generateArpeggioPattern(
    root: NoteName,
    rootOctave: number,
    arpeggioType: 'major' | 'minor' | 'maj7' | 'min7',
    ascending: boolean = true
): MelodicPattern {
    let intervals: number[];
    let arpeggioName: string;

    switch (arpeggioType) {
        case 'major':
            intervals = MAJOR_TRIAD;
            arpeggioName = 'Major';
            break;
        case 'minor':
            intervals = MINOR_TRIAD;
            arpeggioName = 'Minor';
            break;
        case 'maj7':
            intervals = MAJOR_SEVENTH;
            arpeggioName = 'Major 7th';
            break;
        case 'min7':
            intervals = MINOR_SEVENTH;
            arpeggioName = 'Minor 7th';
            break;
    }

    let notes = intervals.map(interval => getNoteFromInterval(root, rootOctave, interval));

    if (!ascending) {
        notes = notes.reverse();
    }

    const direction = ascending ? 'Ascending' : 'Descending';
    const name = `${root} ${arpeggioName} Arpeggio ${direction}`;

    return { notes, name, type: 'arpeggio' };
}

function generateIntervalPattern(
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
        2: '2nds',
        3: 'Minor 3rds',
        4: 'Major 3rds',
        5: '4ths',
        7: '5ths'
    };

    const name = `${root} ${intervalNames[interval] || 'Intervals'}`;

    return { notes, name, type: 'interval' };
}

function generateStepwisePattern(
    root: NoteName,
    rootOctave: number,
    length: number = 5
): MelodicPattern {
    // Simple stepwise pattern (like C-D-E-D-C or C-D-E-F-G)
    const patterns = [
        [0, 2, 4, 2, 0],           // Up and down
        [0, 2, 4, 5, 7],           // 5-finger ascending
        [7, 5, 4, 2, 0],           // 5-finger descending
        [0, 2, 0, 4, 2, 0],        // Neighbor tones
    ];

    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
    const intervals = selectedPattern.slice(0, length);

    const notes = intervals.map(interval => getNoteFromInterval(root, rootOctave, interval));

    return { notes, name: `${root} Stepwise Pattern`, type: 'stepwise' };
}

export function generatePattern(difficulty: Difficulty): MelodicPattern {
    // Random root note (C, D, E, F, G for simplicity)
    const roots: NoteName[] = ['C', 'D', 'E', 'F', 'G'];
    const root = roots[Math.floor(Math.random() * roots.length)];
    const rootOctave = 4;

    const ascending = Math.random() > 0.5;

    switch (difficulty) {
        case 'beginner':
            // Simple 5-note patterns
            const beginnerPatterns = [
                () => generateScalePattern(root, rootOctave, 'major', 5, ascending),
                () => generateStepwisePattern(root, rootOctave, 5),
                () => generateArpeggioPattern(root, rootOctave, 'major', ascending),
            ];
            return beginnerPatterns[Math.floor(Math.random() * beginnerPatterns.length)]();

        case 'intermediate':
            // Full octave scales and 7th arpeggios
            const intermediatePatterns = [
                () => generateScalePattern(root, rootOctave, 'major', 8, ascending),
                () => generateScalePattern(root, rootOctave, 'naturalMinor', 8, ascending),
                () => generateArpeggioPattern(root, rootOctave, 'maj7', ascending),
                () => generateArpeggioPattern(root, rootOctave, 'min7', ascending),
                () => generateIntervalPattern(root, rootOctave, 4, 5), // Major 3rds
            ];
            return intermediatePatterns[Math.floor(Math.random() * intermediatePatterns.length)]();

        case 'advanced':
            // Complex patterns with harmonic/melodic minor
            const advancedPatterns = [
                () => generateScalePattern(root, rootOctave, 'harmonicMinor', 8, ascending),
                () => generateScalePattern(root, rootOctave, 'melodicMinor', 8, ascending),
                () => generateIntervalPattern(root, rootOctave, 5, 6), // 4ths
                () => generateIntervalPattern(root, rootOctave, 7, 5), // 5ths
                () => generateArpeggioPattern(root, rootOctave, 'min7', ascending),
            ];
            return advancedPatterns[Math.floor(Math.random() * advancedPatterns.length)]();
    }
}
