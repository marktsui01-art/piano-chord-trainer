import { describe, it, expect, beforeEach } from 'vitest';
import { DrillManager } from './drill';
import { C_MAJOR_TRIADS, C_MAJOR_SEVENTHS } from './content';

describe('DrillManager', () => {
    let drillManager: DrillManager;

    beforeEach(() => {
        drillManager = new DrillManager();
    });

    describe('getQuestion', () => {
        it('should return a chord from triads by default', () => {
            const chord = drillManager.getQuestion();
            expect(C_MAJOR_TRIADS).toContainEqual(chord);
        });

        it('should return a chord from sevenths when module is set to sevenths', () => {
            drillManager.setModule('sevenths');
            const chord = drillManager.getQuestion();
            expect(C_MAJOR_SEVENTHS).toContainEqual(chord);
        });

        it('should not return the same chord twice in a row', () => {
            const firstChord = drillManager.getQuestion();
            const secondChord = drillManager.getQuestion();

            // If there's only one chord, this test doesn't apply
            if (C_MAJOR_TRIADS.length > 1) {
                expect(secondChord).not.toBe(firstChord);
            }
        });
    });

    describe('getCurrentChord', () => {
        it('should return null before any question is generated', () => {
            expect(drillManager.getCurrentChord()).toBeNull();
        });

        it('should return the current chord after getQuestion is called', () => {
            const chord = drillManager.getQuestion();
            expect(drillManager.getCurrentChord()).toBe(chord);
        });
    });

    describe('checkAnswer', () => {
        it('should return true for correct answer', () => {
            const chord = drillManager.getQuestion();
            const isCorrect = drillManager.checkAnswer(chord.notes);
            expect(isCorrect).toBe(true);
        });

        it('should return false for incorrect answer', () => {
            drillManager.getQuestion();
            const isCorrect = drillManager.checkAnswer(['C', 'D', 'E']);
            expect(isCorrect).toBe(false);
        });

        it('should return false for partial answer', () => {
            drillManager.getQuestion();
            const isCorrect = drillManager.checkAnswer(['C', 'E']);
            expect(isCorrect).toBe(false);
        });

        it('should accept notes in any order', () => {
            const chord = drillManager.getQuestion();
            const shuffled = [...chord.notes].reverse();
            const isCorrect = drillManager.checkAnswer(shuffled);
            expect(isCorrect).toBe(true);
        });
    });

    describe('scoring', () => {
        it('should track correct answers', () => {
            const chord = drillManager.getQuestion();
            drillManager.checkAnswer(chord.notes);
            expect(drillManager.getScore()).toBe('1 / 1');
        });

        it('should not increment score for incorrect answers', () => {
            drillManager.getQuestion();
            drillManager.checkAnswer(['C', 'D', 'E']);
            expect(drillManager.getScore()).toBe('0 / 0');
        });

        it('should reset score', () => {
            const chord = drillManager.getQuestion();
            drillManager.checkAnswer(chord.notes);
            drillManager.resetScore();
            expect(drillManager.getScore()).toBe('0 / 0');
        });
    });
});
