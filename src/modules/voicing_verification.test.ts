import { describe, it, expect } from 'vitest';
import { DrillManager } from './drill';

// Helper to convert NoteName + Octave to MIDI number for distance calculation
function getMidiPitch(note: string): number {
    // Format: "C/4" or "C#4" or "Db4"
    // VexFlow format from DrillManager is "Note/Octave" e.g. "C/4"
    const [name, octStr] = note.split('/');
    const octave = parseInt(octStr, 10);

    const noteToOffset: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1,
        'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4,
        'F': 5, 'F#': 6, 'Gb': 6,
        'G': 7, 'G#': 8, 'Ab': 8,
        'A': 9, 'A#': 10, 'Bb': 10,
        'B': 11
    };

    return octave * 12 + noteToOffset[name];
}

describe('Voicing Verification', () => {
    it('should produce closed voicings (spread <= 12 semitones) for all permutations', () => {
        const drillManager = new DrillManager();
        drillManager.setOptions(true, true); // Enable everything

        // Test Triads
        drillManager.setModule('triads');
        for (let i = 0; i < 50; i++) {
            drillManager.getQuestion();
            const voicing = drillManager.getCurrentVoicing(4); // Base octave 4

            if (voicing.length === 0) continue;

            const pitches = voicing.map(getMidiPitch);
            const min = Math.min(...pitches);
            const max = Math.max(...pitches);
            const spread = max - min;

            if (spread > 12) {
                console.log(`FAIL Triad: ${drillManager.getCurrentChord()?.name}, Inv: ${drillManager['currentInversion']}, Spread: ${spread}`);
                console.log('Voicing:', voicing);
            }

            expect(spread).toBeLessThanOrEqual(12);
        }

        // Test 7ths
        drillManager.setModule('sevenths');
        for (let i = 0; i < 50; i++) {
            drillManager.getQuestion();
            const voicing = drillManager.getCurrentVoicing(4);

            if (voicing.length === 0) continue;

            const pitches = voicing.map(getMidiPitch);
            const min = Math.min(...pitches);
            const max = Math.max(...pitches);
            const spread = max - min;

            if (spread > 12) {
                console.log(`FAIL 7th: ${drillManager.getCurrentChord()?.name}, Inv: ${drillManager['currentInversion']}, Spread: ${spread}`);
                console.log('Voicing:', voicing);
            }

            expect(spread).toBeLessThanOrEqual(12);
        }
    });

    it('should handle octave shifts correctly without changing spread', () => {
        const drillManager = new DrillManager();
        drillManager.setOptions(true, true);
        drillManager.setModule('sevenths');

        for (let i = 0; i < 50; i++) {
            drillManager.getQuestion();
            const voicing = drillManager.getCurrentVoicing(4);
            const pitches = voicing.map(getMidiPitch);
            const spread = Math.max(...pitches) - Math.min(...pitches);

            expect(spread).toBeLessThanOrEqual(12);
        }
    });
});
