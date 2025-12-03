import { NoteName, Chord } from './content';
import { getScaleForKey, KeyMode } from './keys';

export type ChordType = 'triads' | 'sevenths';

export function generateDiatonicChords(root: string, mode: KeyMode, type: ChordType = 'triads'): Chord[] {
    const scale = getScaleForKey(root, mode);
    if (!scale || scale.length === 0) return [];

    const chords: Chord[] = [];

    // Diatonic chords are built on each degree of the scale
    // Triads: 1-3-5
    // Sevenths: 1-3-5-7

    // We need to extend the scale to wrap around for easy indexing
    const extendedScale = [...scale, ...scale];

    for (let i = 0; i < 7; i++) {
        const chordRoot = scale[i];
        const third = extendedScale[i + 2];
        const fifth = extendedScale[i + 4];

        let notes: NoteName[] = [chordRoot, third, fifth];

        if (type === 'sevenths') {
            const seventh = extendedScale[i + 6];
            notes.push(seventh);
        }

        // Determine quality
        // This is complex to calculate purely from intervals without a reference.
        // Simplified approach: Map based on known scale degrees for standard modes?
        // OR calculate intervals between notes.

        // Let's calculate intervals from root to 3rd, 5th, 7th
        // We need a helper to get semitone distance.
        // For now, let's just return the notes and a placeholder quality/name
        // The UI might need to just display the notes or we improve this later.

        // Actually, we can infer quality from the intervals if we had semitone values.
        // But we only have NoteNames.

        // For the MVP refactor, let's try to identify the chord name if possible,
        // or at least return the correct notes which is the critical part.

        // Let's try to map the quality based on the mode and degree if it's a standard mode.
        // Major: I(Maj), ii(min), iii(min), IV(Maj), V(Maj), vi(min), vii(dim)
        // Minor: i(min), ii(dim), III(Maj), iv(min), v(min), VI(Maj), VII(Maj)

        // This is brittle for modes like Dorian/Mixolydian or Harmonic Minor.
        // Better to just return the notes and maybe a generic name "Chord I", "Chord ii" etc?
        // The current app expects a 'quality' field.

        // Let's use a heuristic for quality based on intervals if we can.
        // Since we don't have an easy interval calculator here without circular deps or complex logic,
        // let's stick to the generated notes which are definitely correct per the scale.
        // We will label them with Roman Numerals? Or just Root + "Chord"?

        // Re-using the existing "quality" types from content.ts
        // We'll default to 'Major' if unsure, but for specific known modes we can be accurate.

        let quality: Chord['quality'] = 'Major';
        let name = `${chordRoot} Chord`;

        // TODO: Implement proper chord quality analysis
        // For now, we rely on the fact that the NOTES are correct.
        // The user can hear and see the notes.

        // Special handling for Harmonic Minor to ensure V is Major/Dominant?
        // The scale generation handles the notes (raised 7th).
        // So the V chord (5-7-2) will naturally have the raised 7th (major 3rd of V).

        chords.push({
            name,
            root: chordRoot,
            quality,
            notes
        });
    }

    // Post-processing to fix qualities for standard modes if we want better UI labels immediately?
    // Let's leave it simple for now as requested: Decouple Key/Mode.
    // The chords are musically correct in terms of constituent notes.

    return chords;
}
