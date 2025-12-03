import { describe, it, expect } from 'vitest';
import { getRequiredAccidental } from './notation';

describe('Notation Logic', () => {
    describe('getRequiredAccidental', () => {
        it('should return natural for D in Eb Minor (where D is usually Db)', () => {
            // Eb Minor key sig has Db. Note is D (natural). Should show natural sign.
            expect(getRequiredAccidental('D', 'Ebm')).toBe('n');
        });

        it('should return natural for D/4 in Eb Minor (VexFlow format)', () => {
            expect(getRequiredAccidental('D/4', 'Ebm')).toBe('n');
        });

        it('should return null for Db in Eb Minor (matches key)', () => {
            expect(getRequiredAccidental('Db', 'Ebm')).toBe(null);
        });

        it('should return null for Db/5 in Eb Minor (matches key)', () => {
            expect(getRequiredAccidental('Db/5', 'Ebm')).toBe(null);
        });

        it('should return sharp for F# in C Major', () => {
            expect(getRequiredAccidental('F#', 'C')).toBe('#');
        });

        it('should return flat for Bb in C Major', () => {
            expect(getRequiredAccidental('Bb', 'C')).toBe('b');
        });

        it('should return natural for B in F Major (where B is usually Bb)', () => {
            expect(getRequiredAccidental('B', 'F')).toBe('n');
        });

        it('should return null for Bb in F Major (matches key)', () => {
            expect(getRequiredAccidental('Bb', 'F')).toBe(null);
        });

        it('should return null for F# in G Major (matches key)', () => {
            expect(getRequiredAccidental('F#', 'G')).toBe(null);
        });

        it('should return natural for F in G Major (where F is usually F#)', () => {
            expect(getRequiredAccidental('F', 'G')).toBe('n');
        });

        it('should handle complex VexFlow strings', () => {
            expect(getRequiredAccidental('D/4', 'Ebm')).toBe('n');
            expect(getRequiredAccidental('Db/4', 'Ebm')).toBe(null);
        });
    });
});
