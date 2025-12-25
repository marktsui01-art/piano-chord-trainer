import { describe, it, expect, beforeEach } from 'vitest';
import { IntervalDrill } from './IntervalDrill';
import { NoteName } from '../content';

describe('IntervalDrill', () => {
    let drill: IntervalDrill;

    beforeEach(() => {
        drill = new IntervalDrill();
    });

    it('should initialize with correct defaults', () => {
        expect(drill.isSequential).toBe(true);
        expect(drill.getScore()).toBe('0 / 0');
    });

    it('should generate a diatonic question in C Major', () => {
        drill.setKeyContext('C', 'Major');
        const question = drill.getQuestion();

        expect(question.name).toContain('Interval:');

        // Notes should be white keys (natural) for C Major
        // Note: getVexFlowNotes depends on private state, so we check indirect or access private if needed.
        // Or we check playback notes.
        const notes = drill.getPlaybackNotes(4);
        expect(notes.length).toBe(2);

        // Ensure no sharps or flats in C Major
        notes.forEach(note => {
            // Note format is "C4", "G4", etc.
            const pitch = note.slice(0, -1);
            expect(pitch).not.toContain('#');
            expect(pitch).not.toContain('b');
        });
    });

    it('should generate a chromatic question when mode is Chromatic', () => {
        drill.setKeyContext('C', 'Chromatic');
        // Run multiple times to ensure we get some accidentals eventually
        let hasAccidental = false;
        for(let i=0; i<20; i++) {
            drill.getQuestion();
            const notes = drill.getPlaybackNotes(4);
            notes.forEach(note => {
                if (note.includes('#') || note.includes('b')) hasAccidental = true;
            });
        }
        // Statistically likely
        expect(hasAccidental).toBe(true);
    });

    it('should handle sequential input correctly', () => {
        drill.setKeyContext('C', 'Major');
        drill.getQuestion();

        // Peek at the expected answer
        // We can't easily peek private state, but we can iterate to find the answer?
        // No, that's hacking.
        // Let's rely on the fact that we can get playback notes.
        const notes = drill.getPlaybackNotes(4);
        const startNote = notes[0].slice(0, -1) as NoteName;
        const targetNote = notes[1].slice(0, -1) as NoteName;

        // 1. Wrong input
        expect(drill.checkAnswer(['C#'])).toBe('incorrect');

        // 2. Correct first input
        expect(drill.checkAnswer([startNote])).toBe('continue');

        // 3. Verify getLastCorrectNote returns start note
        expect(drill.getLastCorrectNote(4)).toBe(notes[0]);

        // 4. Correct second input
        expect(drill.checkAnswer([targetNote])).toBe('correct');

        // 5. Verify score updated
        expect(drill.getScore()).toBe('1 / 1');
    });

    it('should apply range settings', () => {
        drill.setOptions(false, 'high'); // Octave Shift +1
        drill.getQuestion();

        const notes = drill.getPlaybackNotes(4);
        const startOctave = parseInt(notes[0].slice(-1));

        // Default starts at 4. High should be 5.
        expect(startOctave).toBeGreaterThanOrEqual(5);

        drill.setOptions(false, 'low'); // Octave Shift -1
        drill.getQuestion();
        const lowNotes = drill.getPlaybackNotes(4);
        const lowStartOctave = parseInt(lowNotes[0].slice(-1));
        expect(lowStartOctave).toBeLessThanOrEqual(3);
    });
});
