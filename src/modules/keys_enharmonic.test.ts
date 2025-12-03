import { describe, it, expect } from 'vitest';
import { getScaleForKey, isEnharmonicMatch } from './keys';

describe('Keys Verification - Enharmonics', () => {
    it('generates Gb Major correctly with Cb', () => {
        const scale = getScaleForKey('Gb', 'Major');
        expect(scale).toContain('Cb');
        expect(scale).not.toContain('B');
    });

    it('generates Eb Minor correctly with Cb', () => {
        const scale = getScaleForKey('Eb', 'Minor');
        expect(scale).toContain('Cb');
        expect(scale).not.toContain('B');
    });

    it('generates Eb Harmonic Minor correctly with Cb', () => {
        const scale = getScaleForKey('Eb', 'Harmonic Minor');
        expect(scale).toContain('Cb');
        expect(scale).not.toContain('B');
        expect(scale).toEqual(['Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb', 'D']);
    });

    it('generates Eb Melodic Minor correctly (no Cb due to raised 6th/7th)', () => {
        const scale = getScaleForKey('Eb', 'Melodic Minor');
        // Melodic minor raises the 6th and 7th: Eb F Gb Ab Bb C D
        expect(scale).toEqual(['Eb', 'F', 'Gb', 'Ab', 'Bb', 'C', 'D']);
        expect(scale).not.toContain('Cb'); // Raised 7th is D, not Cb
    });

    it('generates C# Major correctly with E# and B#', () => {
        const scale = getScaleForKey('C#', 'Major');
        expect(scale).toContain('E#');
        expect(scale).toContain('B#');
        expect(scale).not.toContain('F');
        expect(scale).not.toContain('C');
    });

    it('generates F# Major correctly with E#', () => {
        const scale = getScaleForKey('F#', 'Major');
        expect(scale).toContain('E#');
        expect(scale).not.toContain('F');
    });

    it('generates Ab Minor correctly with Fb and Cb', () => {
        const scale = getScaleForKey('Ab', 'Minor');
        expect(scale).toContain('Fb');
        expect(scale).toContain('Cb');
        expect(scale).not.toContain('E');
        expect(scale).not.toContain('B');
    });

    it('identifies enharmonic matches correctly', () => {
        expect(isEnharmonicMatch('Cb', 'B')).toBe(true);
        expect(isEnharmonicMatch('B#', 'C')).toBe(true);
        expect(isEnharmonicMatch('E#', 'F')).toBe(true);
        expect(isEnharmonicMatch('Fb', 'E')).toBe(true);
        expect(isEnharmonicMatch('C', 'C')).toBe(true);
        expect(isEnharmonicMatch('C', 'D')).toBe(false);
    });
});
