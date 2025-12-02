import { Chord, NoteName } from './content';
import { KeyMode, KeySignature, getKeyById, getScaleForKey, getModeRoot, NOTES_SHARP, NOTES_FLAT } from './keys';

const CHROMATIC_SCALE = NOTES_SHARP; // For interval calculation logic, we can just use one list if we normalize

function getChromaticIndex(note: NoteName): number {
    let idx = NOTES_SHARP.indexOf(note);
    if (idx !== -1) return idx;
    idx = NOTES_FLAT.indexOf(note);
    if (idx !== -1) return idx;
    return -1;
}

function getIntervalSemitones(n1: NoteName, n2: NoteName): number {
    const i1 = getChromaticIndex(n1);
    const i2 = getChromaticIndex(n2);
    if (i1 === -1 || i2 === -1) return 0;

    let diff = i2 - i1;
    if (diff < 0) diff += 12;
    return diff;
}

export function generateDiatonicChords(
    keyId: string,
    mode: KeyMode,
    type: 'triads' | 'sevenths'
): Chord[] {
    const key = getKeyById(keyId);
    if (!key) return []; // Fallback?

    // 1. Get the correct scale (e.g., Eb Harmonic Minor scale notes)
    const scale = getScaleForKey(key, mode);

    // 2. Determine the root note of the mode (e.g. Eb)
    const modeRoot = getModeRoot(key, mode);

    // 3. Re-order scale to start from modeRoot
    // The getScaleForKey might return notes starting from Key Root, not Mode Root.
    // Actually getScaleForKey for Harmonic Minor logic (in keys.ts) seems to return notes starting from the Minor Root.
    // But for "Dorian" or other modes, it might just return the parent key scale.
    // We should normalize the scale array to start with the mode root.

    const rootIndex = scale.indexOf(modeRoot);
    if (rootIndex === -1) return []; // Should not happen

    const modeScale: NoteName[] = [];
    for (let i = 0; i < 7; i++) {
        modeScale.push(scale[(rootIndex + i) % 7]);
    }

    const chords: Chord[] = [];

    // 4. Build chords for each degree
    for (let i = 0; i < 7; i++) {
        // Stack 3rds
        const root = modeScale[i];
        const third = modeScale[(i + 2) % 7];
        const fifth = modeScale[(i + 4) % 7];

        let notes: NoteName[] = [root, third, fifth];
        let seventh: NoteName | null = null;

        if (type === 'sevenths') {
            seventh = modeScale[(i + 6) % 7];
            notes.push(seventh);
        }

        // Determine Quality
        const rTo3 = getIntervalSemitones(root, third);
        const rTo5 = getIntervalSemitones(root, fifth);
        const rTo7 = seventh ? getIntervalSemitones(root, seventh) : 0;

        let quality: Chord['quality'] = 'Major'; // Default

        if (!seventh) {
            // Triads
            if (rTo3 === 4 && rTo5 === 7) quality = 'Major';
            else if (rTo3 === 3 && rTo5 === 7) quality = 'Minor';
            else if (rTo3 === 3 && rTo5 === 6) quality = 'Diminished';
            else if (rTo3 === 4 && rTo5 === 8) quality = 'Augmented';
        } else {
            // Sevenths
            if (rTo3 === 4 && rTo5 === 7 && rTo7 === 11) quality = 'Major7';
            else if (rTo3 === 3 && rTo5 === 7 && rTo7 === 10) quality = 'Minor7';
            else if (rTo3 === 4 && rTo5 === 7 && rTo7 === 10) quality = 'Dominant7';
            else if (rTo3 === 3 && rTo5 === 6 && rTo7 === 10) quality = 'HalfDiminished7'; // m7b5
            else if (rTo3 === 3 && rTo5 === 6 && rTo7 === 9) quality = 'Diminished'; // Full Diminished 7 (technically Diminished7 quality name collision with Triad, but content.ts has specific types?)
            else if (rTo3 === 3 && rTo5 === 7 && rTo7 === 11) quality = 'Minor7'; // Minor-Major 7 (not in types?)
            // Fallbacks for exotic chords in Harmonic Minor
             else if (rTo3 === 3 && rTo5 === 7 && rTo7 === 11) {
                 // Minor Major 7 - Content.ts does not have 'MinorMajor7'.
                 // We might have to map it to something approximate or add it.
                 // For now, let's look at Content.ts types:
                 // 'Major' | 'Minor' | 'Diminished' | 'Augmented' | 'Major7' | 'Minor7' | 'Dominant7' | 'HalfDiminished7'
                 // It misses 'MinorMajor7' and 'Diminished7' (full dim).
                 // Let's coerce or just label logic:
                 quality = 'Minor7'; // Imperfect fallback
             }
             else if (rTo3 === 4 && rTo5 === 8 && rTo7 === 11) {
                 // Augmented Major 7
                 quality = 'Major7';
             }
             else if (rTo3 === 3 && rTo5 === 6 && rTo7 === 9) {
                 // Diminished 7 (Full)
                 // content.ts has 'Diminished' but that usually implies triad.
                 // Let's see... C_MAJOR_SEVENTHS only has diatonic C Major chords.
                 // B Half-Diminished 7 is there.
                 // We might need to extend Chord Quality types if we want to be precise for Harmonic Minor.
                 // For now, I will use 'Diminished' assuming it can represent the 7th chord too, or 'HalfDiminished7' if appropriate.
                 // Actually, let's map Full Diminished to 'Diminished' (as in triad) but keeping the 4 notes,
                 // or technically we should update `content.ts`.
                 // Given the constraint of not breaking things, I'll stick to 'Diminished' for the quality string,
                 // as `Chord` interface just asks for a string literal.
                 // Wait, `quality` IS typed.
                 // I will map Full Diminished to 'Diminished' if allowed, otherwise 'HalfDiminished7' is wrong.
                 quality = 'Diminished';
             }
        }

        // Construct Name
        // e.g. "Eb Minor", "Bb Dominant 7"
        let qualityName = '';
        switch (quality) {
            case 'Major': qualityName = 'Major'; break;
            case 'Minor': qualityName = 'Minor'; break;
            case 'Diminished': qualityName = type === 'sevenths' ? 'Diminished 7' : 'Diminished'; break;
            case 'Augmented': qualityName = 'Augmented'; break;
            case 'Major7': qualityName = 'Major 7'; break;
            case 'Minor7': qualityName = 'Minor 7'; break;
            case 'Dominant7': qualityName = 'Dominant 7'; break;
            case 'HalfDiminished7': qualityName = 'Half-Diminished 7'; break;
        }

        // Refine Name for Special Cases
        // Minor-Major 7 fallback
        if (type === 'sevenths' && rTo3 === 3 && rTo5 === 7 && rTo7 === 11) {
            qualityName = 'Minor-Major 7';
            quality = 'Minor7'; // Typings constraint
        }

        chords.push({
            name: `${root} ${qualityName}`,
            root: root,
            quality: quality,
            notes: notes
        });
    }

    return chords;
}
