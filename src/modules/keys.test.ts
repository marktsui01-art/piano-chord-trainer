import { describe, it, expect } from 'vitest';
import { getKeyRootById, getModeRoot, getScaleForKey } from './keys';

describe('Keys Module', () => {
    it('should retrieve key roots correctly', () => {
        const key = getKeyRootById('C');
        expect(key).toBeDefined();
        expect(key?.root).toBe('C');

        const keyEb = getKeyRootById('Eb');
        expect(keyEb?.root).toBe('Eb');
    });

    it('should return correct scale for C Major', () => {
        const scale = getScaleForKey('C', 'Major');
        expect(scale).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    });

    it('should return correct scale for A Minor', () => {
        const scale = getScaleForKey('A', 'Minor');
        expect(scale).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    });

    it('should return correct scale for Eb Minor', () => {
        const scale = getScaleForKey('Eb', 'Minor');
        // Eb Minor: Eb F Gb Ab Bb Cb Db
        // Note: Cb is now supported
        expect(scale).toEqual(['Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb', 'Db']);
    });

    it('should return correct scale for C Harmonic Minor', () => {
        const scale = getScaleForKey('C', 'Harmonic Minor');
        // C D Eb F G Ab B
        expect(scale).toEqual(['C', 'D', 'Eb', 'F', 'G', 'Ab', 'B']);
    });

    it('getModeRoot should simply return the root', () => {
        expect(getModeRoot('C', 'Major')).toBe('C');
        expect(getModeRoot('A', 'Minor')).toBe('A');
    });
});
