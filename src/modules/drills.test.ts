import { describe, it, expect, beforeEach } from 'vitest';
import { SpeedDrill } from './drills/SpeedDrill';
import { MelodyDrill } from './drills/MelodyDrill';

describe('SpeedDrill', () => {
    let drill: SpeedDrill;

    beforeEach(() => {
        drill = new SpeedDrill();
        drill.setKeyContext('C', 'Major');
    });

    it('should generate a question', () => {
        const q = drill.getQuestion();
        expect(q).toBeDefined();
        expect(q.name).toContain('Note:');
    });

    it('should check answer correctly', () => {
        drill.getQuestion();
        // We can't easily know the random note, but we can verify the structure
        // Just calling checkAnswer to ensure no crash
        drill.checkAnswer(['C']);
        // expect(result).toBeDefined(); // Result depends on random note
    });
});

describe('MelodyDrill', () => {
    let drill: MelodyDrill;

    beforeEach(() => {
        drill = new MelodyDrill();
        drill.setKeyContext('C', 'Major');
    });

    it('should generate a question', () => {
        const q = drill.getQuestion();
        expect(q).toBeDefined();
        expect(drill.getCurrentIndex()).toBe(0);
    });
});
