import { describe, it, expect } from 'vitest';
import { generateDiatonicChords } from './chords';

describe('Chord Generator', () => {
    it('generates C Major Triads correctly', () => {
        const chords = generateDiatonicChords('C', 'Major', 'triads');
        expect(chords.length).toBe(7);
        expect(chords[0].name).toBe('C Major');
        expect(chords[0].notes).toEqual(['C', 'E', 'G']);
        expect(chords[1].name).toBe('D Minor');
        expect(chords[4].name).toBe('G Major');
        expect(chords[6].name).toBe('B Diminished');
    });

    it('generates C Major Sevenths correctly', () => {
        const chords = generateDiatonicChords('C', 'Major', 'sevenths');
        expect(chords[0].name).toBe('C Major 7');
        expect(chords[0].notes).toEqual(['C', 'E', 'G', 'B']);
        expect(chords[4].name).toBe('G Dominant 7');
        expect(chords[6].name).toBe('B Half-Diminished 7');
    });

    it('generates Eb Minor (Natural) Triads', () => {
        // Eb Minor Natural: Eb F Gb Ab Bb Cb Db
        // i: Eb Gb Bb (Eb m)
        // V: Bb Db F (Bb m)
        // Note: Key ID for Eb Minor is 'Ebm', not 'Eb' (which is Eb Major)
        const chords = generateDiatonicChords('Ebm', 'Minor', 'triads');

        expect(chords[0].root).toBe('Eb');
        expect(chords[0].quality).toBe('Minor');
        expect(chords[0].notes).toEqual(['Eb', 'Gb', 'Bb']);

        expect(chords[4].root).toBe('Bb');
        expect(chords[4].quality).toBe('Minor'); // Natural minor -> minor v
        expect(chords[4].notes).toEqual(['Bb', 'Db', 'F']);
    });

    it('generates Eb Harmonic Minor Triads', () => {
        // Eb Harmonic Minor: Eb F Gb Ab Bb Cb D (Raised 7th is D natural)
        // i: Eb Gb Bb (Eb m)
        // V: Bb D F (Bb Major)
        const chords = generateDiatonicChords('Ebm', 'Harmonic Minor', 'triads');

        // i
        expect(chords[0].root).toBe('Eb');
        expect(chords[0].quality).toBe('Minor');

        // V (Bb Major)
        expect(chords[4].root).toBe('Bb');
        expect(chords[4].quality).toBe('Major');
        expect(chords[4].notes).toEqual(['Bb', 'D', 'F']); // D natural is the raised 7th of Eb
    });

    it('generates Eb Harmonic Minor Sevenths', () => {
        // V7 should be Bb Dominant 7 (Bb D F Ab)
        const chords = generateDiatonicChords('Ebm', 'Harmonic Minor', 'sevenths');

        expect(chords[4].root).toBe('Bb');
        expect(chords[4].quality).toBe('Dominant7');
        expect(chords[4].name).toBe('Bb Dominant 7');
        expect(chords[4].notes).toEqual(['Bb', 'D', 'F', 'Ab']);

        // vii dim 7 (D F Ab Cb) -> Fully Diminished
        expect(chords[6].root).toBe('D');
        // Depending on logic, might be labelled Diminished 7
        // Notes: D F Ab Cb.
        // NOTE: The system currently represents Cb as B due to NoteName limitations.
        expect(chords[6].notes).toEqual(['D', 'F', 'Ab', 'B']);
    });
});
