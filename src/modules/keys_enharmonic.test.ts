import { describe, it, expect } from 'vitest';
import { getScaleForKey, isEnharmonicMatch } from './keys';

describe('Keys Verification - Enharmonics', () => {
    it('generates Gb Major correctly with Cb', () => {
        const scale = getScaleForKey('Gb', 'Major');
        // Gb Major: Gb Ab Bb Cb Db Eb F
        expect(scale).toEqual(['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F']);
    });

    it('generates Eb Minor correctly with Cb', () => {
        const scale = getScaleForKey('Eb', 'Minor');
        // Eb Minor: Eb F Gb Ab Bb Cb Db
        expect(scale).toEqual(['Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb', 'Db']);
    });

    it('generates C# Major correctly with E# and B#', () => {
        const scale = getScaleForKey('C#', 'Major');
        // C# Major: C# D# E# F# G# A# B#
        expect(scale).toEqual(['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#']);
    });

    it('generates F# Major correctly with E#', () => {
        const scale = getScaleForKey('F#', 'Major');
        // F# Major: F# G# A# B C# D# E#
        expect(scale).toEqual(['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#']);
    });

    it('generates Ab Minor correctly with Fb and Cb', () => {
        const scale = getScaleForKey('Ab', 'Minor');
        // Ab Minor: Ab Bb Cb Db Eb Fb Gb
        expect(scale).toEqual(['Ab', 'Bb', 'Cb', 'Db', 'Eb', 'Fb', 'Gb']);
    });

    it('identifies enharmonic matches correctly', () => {
        expect(isEnharmonicMatch('B', 'Cb')).toBe(true);
        expect(isEnharmonicMatch('Cb', 'B')).toBe(true);
        expect(isEnharmonicMatch('C', 'B#')).toBe(true);
        expect(isEnharmonicMatch('B#', 'C')).toBe(true);
        expect(isEnharmonicMatch('F', 'E#')).toBe(true);
        expect(isEnharmonicMatch('E#', 'F')).toBe(true);
        expect(isEnharmonicMatch('E', 'Fb')).toBe(true);
        expect(isEnharmonicMatch('Fb', 'E')).toBe(true);
        expect(isEnharmonicMatch('C#', 'Db')).toBe(true);
        expect(isEnharmonicMatch('C', 'D')).toBe(false);
    });
});
