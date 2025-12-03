import { NoteName } from './content';

/**
 * Represents the mode of a scale.
 * - Major: Ionian mode (1, 2, 3, 4, 5, 6, 7)
 * - Minor: Natural Minor / Aeolian mode (1, 2, b3, 4, 5, b6, b7)
 * - Harmonic Minor: Natural Minor with a raised 7th (1, 2, b3, 4, 5, b6, 7)
 * - Melodic Minor: Natural Minor with raised 6th and 7th ascending (1, 2, b3, 4, 5, 6, 7)
 * - Dorian: Minor scale with a major 6th (1, 2, b3, 4, 5, 6, b7)
 * - Mixolydian: Major scale with a minor 7th (1, 2, 3, 4, 5, 6, b7)
 * - Chromatic: All 12 semitones
 */
export type KeyMode = 'Major' | 'Minor' | 'Harmonic Minor' | 'Melodic Minor' | 'Dorian' | 'Mixolydian' | 'Chromatic';

/**
 * Represents a Root Note configuration.
 * Used to populate the Key selector.
 */
export interface KeyRoot {
    id: string;      // e.g. 'C', 'C#', 'Db'
    root: NoteName;  // The actual note name
    accidentals: number; // Preferred accidentals for Major scale (approximate)
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
export const DORIAN_INTERVALS = [0, 2, 3, 5, 7, 9, 10];
export const MIXOLYDIAN_INTERVALS = [0, 2, 4, 5, 7, 9, 10];

/**
 * List of all available Root notes for selection.
 * Includes enharmonic equivalents where common (e.g. F# and Gb).
 */
export const ALL_ROOTS: KeyRoot[] = [
    { id: 'C', root: 'C', accidentals: 0 },
    { id: 'C#', root: 'C#', accidentals: 7 },
    { id: 'Db', root: 'Db', accidentals: -5 },
    { id: 'D', root: 'D', accidentals: 2 },
    { id: 'Eb', root: 'Eb', accidentals: -3 },
    { id: 'E', root: 'E', accidentals: 4 },
    { id: 'F', root: 'F', accidentals: -1 },
    { id: 'F#', root: 'F#', accidentals: 6 },
    { id: 'Gb', root: 'Gb', accidentals: -6 },
    { id: 'G', root: 'G', accidentals: 1 },
    { id: 'Ab', root: 'Ab', accidentals: -4 },
    { id: 'A', root: 'A', accidentals: 3 },
    { id: 'Bb', root: 'Bb', accidentals: -2 },
    { id: 'B', root: 'B', accidentals: 5 },
    // Cb? usually B.
];

/**
 * Retrieves a KeyRoot object by its ID.
 * @param id The ID of the key root (e.g. 'C', 'Eb')
 */
export function getKeyRootById(id: string): KeyRoot | undefined {
    return ALL_ROOTS.find(k => k.id === id);
}

/**
 * Determines whether to use Sharps or Flats for a given Root and Mode.
 * This is a heuristic based on the Circle of Fifths.
 * @param root The root note
 * @param mode The mode
 * @returns true for Sharps, false for Flats
 */
function useSharps(root: NoteName, mode: KeyMode): boolean {
    // Simplified logic:
    // 1. Look up the "Major Key" accidentals for this root.
    // 2. Adjust based on mode (e.g. Minor adds 3 flats / removes 3 sharps).

    const keyRoot = ALL_ROOTS.find(k => k.root === root);
    if (!keyRoot) return true; // Default to sharps

    let accidentals = keyRoot.accidentals;

    // Adjust for Mode relative to Major
    switch (mode) {
        case 'Minor': // Natural Minor = Major - 3 sharps (or +3 flats)
        case 'Harmonic Minor':
        case 'Melodic Minor':
            accidentals -= 3;
            break;
        case 'Dorian': // Major - 2 sharps
            accidentals -= 2;
            break;
        case 'Mixolydian': // Major - 1 sharp
            accidentals -= 1;
            break;
        case 'Major':
        default:
            break;
    }

    // If accidentals >= 0, use Sharps. If < 0, use Flats.
    // Exception: F Major (1 flat) -> accidentals -1.
    // C Major (0) -> Sharps (default)
    return accidentals >= 0;
}

/**
 * Generates the scale notes for a given Root and Mode.
 * @param root The root note (e.g. 'C', 'Eb')
 * @param mode The mode (e.g. 'Major', 'Minor')
 * @returns Array of 7 NoteNames representing the scale
 */
export function getScaleForKey(root: string, mode: KeyMode): NoteName[] {
    if (mode === 'Chromatic') {
        return NOTES_SHARP;
    }

    const rootNote = root as NoteName; // Assume valid
    const isSharp = useSharps(rootNote, mode);
    const chromatic = isSharp ? NOTES_SHARP : NOTES_FLAT;

    const rootIndex = chromatic.indexOf(rootNote);
    if (rootIndex === -1) return []; // Should not happen if root is valid

    let intervals: number[] = MAJOR_SCALE_INTERVALS;

    switch (mode) {
        case 'Major': intervals = MAJOR_SCALE_INTERVALS; break;
        case 'Minor': intervals = NATURAL_MINOR_INTERVALS; break;
        case 'Harmonic Minor': intervals = HARMONIC_MINOR_INTERVALS; break;
        case 'Melodic Minor': intervals = MELODIC_MINOR_INTERVALS; break;
        case 'Dorian': intervals = DORIAN_INTERVALS; break;
        case 'Mixolydian': intervals = MIXOLYDIAN_INTERVALS; break;
    }

    const scale = intervals.map(i => chromatic[(rootIndex + i) % 12]);
    return fixEnharmonics(scale, root, mode);
}

function fixEnharmonics(scale: NoteName[], root: string, mode: KeyMode): NoteName[] {
    // Gb Major and Eb Minor use Cb instead of B
    // Note: Melodic Minor doesn't use Cb because the 7th is raised to D
    if ((root === 'Gb' && mode === 'Major') ||
        (root === 'Eb' && (mode === 'Minor' || mode === 'Harmonic Minor'))) {
        scale = scale.map(n => n === 'B' ? 'Cb' : n);
    }

    // C# Major uses E# (F) and B# (C)
    if (root === 'C#' && mode === 'Major') {
        scale = scale.map(n => {
            if (n === 'F') return 'E#';
            if (n === 'C') return 'B#';
            return n;
        });
    }

    // F# Major uses E# (F)
    if (root === 'F#' && mode === 'Major') {
        scale = scale.map(n => n === 'F' ? 'E#' : n);
    }

    // Ab Minor uses Fb (E) and Cb (B)
    if (root === 'Ab' && (mode === 'Minor' || mode === 'Harmonic Minor' || mode === 'Melodic Minor')) {
        scale = scale.map(n => {
            if (n === 'E') return 'Fb';
            if (n === 'B') return 'Cb';
            return n;
        });
    }

    return scale;
}

/**
 * Returns the root note for the given mode.
 * Since we now select Root + Mode directly, the "Mode Root" IS the selected Root.
 * This helper is kept for compatibility or if we need relative modes later.
 * @param root The selected root
 * @param mode The selected mode
 */
export function getModeRoot(root: string, _mode: KeyMode): NoteName {
    return root as NoteName;
}

export function getNoteIndex(n: string): number {
    if (n === 'Cb') return 11; // B
    if (n === 'B#') return 0; // C
    if (n === 'Fb') return 4; // E
    if (n === 'E#') return 5; // F

    let idx = NOTES_SHARP.indexOf(n as NoteName);
    if (idx !== -1) return idx;
    idx = NOTES_FLAT.indexOf(n as NoteName);
    if (idx !== -1) return idx;
    return -1;
}

export function isEnharmonicMatch(n1: string, n2: string): boolean {
    if (n1 === n2) return true;

    const i1 = getNoteIndex(n1);
    const i2 = getNoteIndex(n2);

    return i1 !== -1 && i2 !== -1 && i1 === i2;
}

/**
 * Given a physical piano note and a musical context (root + mode),
 * return the contextually appropriate spelling.
 * 
 * For example:
 * - In Eb Minor, the note "B" should be spelled as "Cb"
 * - In C# Major, the note "C" should be spelled as "B#"
 * - In F# Major, the note "F" should be spelled as "E#"
 * 
 * @param physicalNote - The note name from the piano key (e.g., 'B', 'C', 'Eb')
 * @param root - The root note of the current key (e.g., 'Eb', 'C#')
 * @param mode - The mode (e.g., 'Major', 'Minor')
 * @returns The contextually correct spelling
 */
export function getContextualSpelling(physicalNote: NoteName, root: string, mode: KeyMode): NoteName {
    // Get the scale for this key
    const scale = getScaleForKey(root, mode);

    // Check if the physical note (or its enharmonic equivalent) is in the scale
    for (const scaleNote of scale) {
        if (isEnharmonicMatch(physicalNote, scaleNote)) {
            return scaleNote;
        }
    }

    // If not in scale (chromatic note), return the original
    // We could be smarter here and choose sharp vs flat based on key tendency
    return physicalNote;
}
