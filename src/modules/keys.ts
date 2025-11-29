import { NoteName } from './content';

export type KeyMode = 'Major' | 'Minor' | 'Dorian' | 'Mixolydian';

export interface KeySignature {
    id: string; // e.g., 'C', 'G', 'Dm'
    root: NoteName;
    type: 'Major' | 'Minor';
    accidentals: number; // + for sharps, - for flats
    difficulty: number; // 1 = Easy, 2 = Medium, 3 = Hard
    scale: NoteName[]; // The 7 diatonic notes in order
}

const NOTES_SHARP: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT: NoteName[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Helper to generate major scale
function getMajorScale(rootIndex: number, useSharps: boolean): NoteName[] {
    const chromatic = useSharps ? NOTES_SHARP : NOTES_FLAT;
    const intervals = [0, 2, 4, 5, 7, 9, 11];
    return intervals.map(i => chromatic[(rootIndex + i) % 12]);
}

// Helper to generate natural minor scale
function getMinorScale(rootIndex: number, useSharps: boolean): NoteName[] {
    const chromatic = useSharps ? NOTES_SHARP : NOTES_FLAT;
    const intervals = [0, 2, 3, 5, 7, 8, 10];
    return intervals.map(i => chromatic[(rootIndex + i) % 12]);
}

export const KEYS: KeySignature[] = [
    // Level 1: C Major / A Minor (No accidentals)
    { id: 'C', root: 'C', type: 'Major', accidentals: 0, difficulty: 1, scale: getMajorScale(0, true) },
    { id: 'Am', root: 'A', type: 'Minor', accidentals: 0, difficulty: 1, scale: getMinorScale(9, true) },

    // Level 2: 1 Sharp/Flat
    { id: 'G', root: 'G', type: 'Major', accidentals: 1, difficulty: 2, scale: getMajorScale(7, true) }, // F#
    { id: 'F', root: 'F', type: 'Major', accidentals: -1, difficulty: 2, scale: getMajorScale(5, false) }, // Bb
    { id: 'Em', root: 'E', type: 'Minor', accidentals: 1, difficulty: 2, scale: getMinorScale(4, true) }, // F#
    { id: 'Dm', root: 'D', type: 'Minor', accidentals: -1, difficulty: 2, scale: getMinorScale(2, false) }, // Bb

    // Level 3: 2 Sharps/Flats
    { id: 'D', root: 'D', type: 'Major', accidentals: 2, difficulty: 3, scale: getMajorScale(2, true) },
    { id: 'Bb', root: 'Bb', type: 'Major', accidentals: -2, difficulty: 3, scale: getMajorScale(10, false) },
    { id: 'Bm', root: 'B', type: 'Minor', accidentals: 2, difficulty: 3, scale: getMinorScale(11, true) },
    { id: 'Gm', root: 'G', type: 'Minor', accidentals: -2, difficulty: 3, scale: getMinorScale(7, false) },

    // Level 4: 3 Sharps/Flats
    { id: 'A', root: 'A', type: 'Major', accidentals: 3, difficulty: 4, scale: getMajorScale(9, true) },
    { id: 'Eb', root: 'Eb', type: 'Major', accidentals: -3, difficulty: 4, scale: getMajorScale(3, false) },
    { id: 'F#m', root: 'F#', type: 'Minor', accidentals: 3, difficulty: 4, scale: getMinorScale(6, true) },
    { id: 'Cm', root: 'C', type: 'Minor', accidentals: -3, difficulty: 4, scale: getMinorScale(0, false) },

    // Level 5: 4 Sharps/Flats
    { id: 'E', root: 'E', type: 'Major', accidentals: 4, difficulty: 5, scale: getMajorScale(4, true) },
    { id: 'Ab', root: 'Ab', type: 'Major', accidentals: -4, difficulty: 5, scale: getMajorScale(8, false) },
    { id: 'C#m', root: 'C#', type: 'Minor', accidentals: 4, difficulty: 5, scale: getMinorScale(1, true) },
    { id: 'Fm', root: 'F', type: 'Minor', accidentals: -4, difficulty: 5, scale: getMinorScale(5, false) },

    // Level 6: 5 Sharps/Flats
    { id: 'B', root: 'B', type: 'Major', accidentals: 5, difficulty: 6, scale: getMajorScale(11, true) },
    { id: 'Db', root: 'Db', type: 'Major', accidentals: -5, difficulty: 6, scale: getMajorScale(1, false) },
    { id: 'G#m', root: 'G#', type: 'Minor', accidentals: 5, difficulty: 6, scale: getMinorScale(8, true) },
    { id: 'Bbm', root: 'Bb', type: 'Minor', accidentals: -5, difficulty: 6, scale: getMinorScale(10, false) },

    // Level 7: 6 Sharps/Flats (Enharmonic equivalents often)
    { id: 'F#', root: 'F#', type: 'Major', accidentals: 6, difficulty: 7, scale: getMajorScale(6, true) },
    { id: 'Gb', root: 'Gb', type: 'Major', accidentals: -6, difficulty: 7, scale: getMajorScale(6, false) },
    { id: 'D#m', root: 'D#', type: 'Minor', accidentals: 6, difficulty: 7, scale: getMinorScale(3, true) },
    { id: 'Ebm', root: 'Eb', type: 'Minor', accidentals: -6, difficulty: 7, scale: getMinorScale(3, false) },
];

export function getKeyById(id: string): KeySignature | undefined {
    return KEYS.find(k => k.id === id);
}

export function getScaleForKey(key: KeySignature, mode: KeyMode): NoteName[] {
    // If mode matches key type (Major/Major or Minor/Minor), return key scale
    if ((mode === 'Major' && key.type === 'Major') || (mode === 'Minor' && key.type === 'Minor')) {
        return key.scale;
    }

    // Since we are doing "Diatonic to the Key Signature", the pool of notes is ALWAYS just the key.scale.
    // The "Mode" only determines the starting/root note (center) of the melody,
    // but the notes themselves must belong to the Key Signature.

    // For pattern generation, we might need to know the "tonic" of the mode.
    // e.g. Key C Major, Mode Dorian -> Scale is C Major notes, but tonic is D.
    return key.scale;
}

export function getModeRoot(key: KeySignature, mode: KeyMode): NoteName {
    // Returns the root note for the given mode within the key signature
    // e.g. Key=C, Mode=Dorian -> returns D

    const scale = key.scale;
    switch(mode) {
        case 'Major': return scale[0]; // Ionian
        case 'Dorian': return scale[1]; // ii
        case 'Mixolydian': return scale[4]; // V
        case 'Minor': return scale[5]; // Aeolian (Relative Minor)
    }
}
