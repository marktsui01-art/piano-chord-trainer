import { NoteName } from './content';

export type KeyMode = 'Major' | 'Minor' | 'Harmonic Minor' | 'Melodic Minor' | 'Dorian' | 'Mixolydian' | 'Chromatic';

export interface KeySignature {
    id: string; // e.g., 'C', 'G', 'Dm'
    root: NoteName;
    type: 'Major' | 'Minor' | 'Chromatic';
    accidentals: number; // + for sharps, - for flats
    difficulty: number; // 1 = Easy, 2 = Medium, 3 = Hard
    scale: NoteName[]; // The 7 diatonic notes in order (or 12 for chromatic)
}

export const NOTES_SHARP: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTES_FLAT: NoteName[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// ----------------------------------------
// Music Theory Constants
// ----------------------------------------

// Scale intervals in semitones
export const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
export const NATURAL_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10];
export const HARMONIC_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 11];
export const MELODIC_MINOR_INTERVALS = [0, 2, 3, 5, 7, 9, 11];

// ----------------------------------------
// Helpers
// ----------------------------------------

export function getNoteIndex(note: string): number {
    // Handle special enharmonic cases not in NoteName type
    if (note === 'Cb') return 11;
    if (note === 'E#') return 5;
    if (note === 'Fb') return 4;
    if (note === 'B#') return 0;

    // Standard lookup
    let index = NOTES_SHARP.indexOf(note as NoteName);
    if (index !== -1) return index;
    index = NOTES_FLAT.indexOf(note as NoteName);
    return index;
}

export function areNotesEnharmonic(n1: string, n2: string): boolean {
    if (n1 === n2) return true;
    const i1 = getNoteIndex(n1);
    const i2 = getNoteIndex(n2);
    return i1 !== -1 && i1 === i2;
}

export function getDisplayNoteName(note: string, keyId: string, mode: KeyMode = 'Major'): string {
    const key = getKeyById(keyId);
    if (!key) return note;

    const index = getNoteIndex(note);
    if (index === -1) return note;

    // Specific overrides for enharmonic correctness

    // 1. Cb in Gb Major / Eb Minor
    if ((key.id === 'Gb' || key.id === 'Ebm') && index === 11) {
        return 'Cb';
    }

    // 2. E# in F# Major / D# Minor
    if ((key.id === 'F#' || key.id === 'D#m') && index === 5) {
        return 'E#';
    }

    // 3. Harmonic Minor specifics where accidental contradicts key signature
    if (mode === 'Harmonic Minor' || mode === 'Melodic Minor') {
         // D Minor (1 flat). Harmonic uses C# (index 1). Key uses Db (index 1).
         if (key.id === 'Dm' && index === 1) return 'C#';

         // G Minor (2 flats). Harmonic uses F# (index 6). Key uses Gb (index 6).
         if (key.id === 'Gm' && index === 6) return 'F#';

         // C# Minor (4 sharps). Harmonic uses B# (index 0).
         if (key.id === 'C#m' && index === 0) return 'B#';
    }

    // Default to Key preference
    if (key.accidentals >= 0) {
        return NOTES_SHARP[index];
    } else {
        return NOTES_FLAT[index];
    }
}

// Helper to generate major scale
function getMajorScale(rootIndex: number, useSharps: boolean): NoteName[] {
    const chromatic = useSharps ? NOTES_SHARP : NOTES_FLAT;
    return MAJOR_SCALE_INTERVALS.map(i => chromatic[(rootIndex + i) % 12]);
}

// Helper to generate natural minor scale
function getMinorScale(rootIndex: number, useSharps: boolean): NoteName[] {
    const chromatic = useSharps ? NOTES_SHARP : NOTES_FLAT;
    return NATURAL_MINOR_INTERVALS.map(i => chromatic[(rootIndex + i) % 12]);
}

export const KEYS: KeySignature[] = [
    // Special: Chromatic (Legacy / Non-Diatonic)
    // We treat C as root, but scale is full chromatic
    { id: 'chromatic', root: 'C', type: 'Chromatic', accidentals: 0, difficulty: 0, scale: NOTES_SHARP },

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
    // If Chromatic, return full chromatic scale
    if (key.type === 'Chromatic') {
        return NOTES_SHARP;
    }

    // Special handling for Harmonic/Melodic Minor modes
    // These modify the base key scale
    if (mode === 'Harmonic Minor' || mode === 'Melodic Minor') {
        const chromatic = key.accidentals >= 0 ? NOTES_SHARP : NOTES_FLAT;

        // Determine root of the minor scale
        // If Key is Major, use Relative Minor (scale[5])
        // If Key is Minor, use Tonic (scale[0])
        const minorRoot = key.type === 'Major' ? key.scale[5] : key.scale[0];

        const rootIndex = chromatic.indexOf(minorRoot); // Scale root (e.g. A for Am)
        // Ensure we find the root
        if (rootIndex === -1) {
            // Fallback if root not found in chosen chromatic array (enharmonic issues)
            // Just return natural minor key scale to be safe
            return key.scale;
        }

        const intervals = mode === 'Harmonic Minor' ? HARMONIC_MINOR_INTERVALS : MELODIC_MINOR_INTERVALS;
        return intervals.map(i => chromatic[(rootIndex + i) % 12]);
    }

    // If mode matches key type (Major/Major or Minor/Minor), return key scale
    if ((mode === 'Major' && key.type === 'Major') || (mode === 'Minor' && key.type === 'Minor')) {
        return key.scale;
    }

    // Default: Return key signature scale (Diatonic modes)
    return key.scale;
}

export function getModeRoot(key: KeySignature, mode: KeyMode): NoteName {
    // Returns the root note for the given mode within the key signature
    // e.g. Key=C, Mode=Dorian -> returns D

    if (key.type === 'Chromatic') return 'C'; // Default root

    const scale = key.scale;
    switch (mode) {
        case 'Major':
            // Ionian: Index 0 in Major, Index 2 in Minor
            return key.type === 'Minor' ? scale[2] : scale[0];

        case 'Dorian':
            // Dorian: Index 1 in Major, Index 3 in Minor
            return key.type === 'Minor' ? scale[3] : scale[1];

        case 'Mixolydian':
            // Mixolydian: Index 4 in Major, Index 6 in Minor
            return key.type === 'Minor' ? scale[6] : scale[4];

        case 'Minor':
        case 'Harmonic Minor':
        case 'Melodic Minor':
            // Aeolian/Minor: Index 5 in Major, Index 0 in Minor
            return key.type === 'Minor' ? scale[0] : scale[5];

        default: return scale[0];
    }
}
