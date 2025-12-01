
import { describe, it, expect } from 'vitest';
import { getKeyById, getModeRoot } from './keys';

describe('Keys Module', () => {
    it('should return correct root for Major Key + Major Mode', () => {
        const key = getKeyById('C'); // C Major
        expect(key).toBeDefined();
        if (!key) return;

        const root = getModeRoot(key, 'Major');
        expect(root).toBe('C');
    });

    it('should return correct root for Major Key + Minor Mode (Relative Minor)', () => {
        const key = getKeyById('C'); // C Major
        expect(key).toBeDefined();
        if (!key) return;

        const root = getModeRoot(key, 'Minor');
        expect(root).toBe('A'); // Relative minor of C is A
    });

    it('should return correct root for Minor Key + Minor Mode', () => {
        const key = getKeyById('Am'); // A Minor
        expect(key).toBeDefined();
        if (!key) return;

        const root = getModeRoot(key, 'Minor');
        expect(root).toBe('A');
    });

    it('should return correct root for Minor Key + Major Mode (Relative Major)', () => {
        const key = getKeyById('Am'); // A Minor
        expect(key).toBeDefined();
        if (!key) return;

        // If I select Am, and then Major Mode, I expect C (Relative Major)
        // OR maybe it's invalid? But let's see what it returns.
        const root = getModeRoot(key, 'Major');

        // Current implementation likely returns A (scale[0]), which is wrong if we want Relative Major (C)
        // If we want Parallel Major (A Major), that's a different key signature entirely.
        // Assuming the intent is Relative Modes:
        // Am Scale: A B C D E F G
        // Major (Ionian) is C.
        expect(root).toBe('C');
    });
});
