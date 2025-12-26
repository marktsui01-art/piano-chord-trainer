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
      const question = drillManager.getQuestion();
      const chordNames = C_MAJOR_TRIADS.map((c) => c.name);
      expect(chordNames).toContain(question.name);
    });

    it('should return a chord from sevenths when module is set to sevenths', () => {
      drillManager.setModule('sevenths');
      const question = drillManager.getQuestion();
      const chordNames = C_MAJOR_SEVENTHS.map((c) => c.name);
      expect(chordNames).toContain(question.name);
    });

    it('should not return the same chord twice in a row', () => {
      const firstQuestion = drillManager.getQuestion();
      const secondQuestion = drillManager.getQuestion();

      // If there's only one chord, this test doesn't apply
      if (C_MAJOR_TRIADS.length > 1) {
        expect(secondQuestion.name).not.toBe(firstQuestion.name);
      }
    });
  });

  describe('getCurrentChord', () => {
    it('should return null before any question is generated', () => {
      expect(drillManager.getCurrentChord()).toBeNull();
    });

    it('should return the current chord after getQuestion is called', () => {
      drillManager.getQuestion();
      const currentChord = drillManager.getCurrentChord();
      expect(currentChord).not.toBeNull();
    });
  });

  describe('checkAnswer', () => {
    it('should return correct for correct answer', () => {
      drillManager.getQuestion();
      const currentChord = drillManager.getCurrentChord();
      const result = drillManager.checkAnswer(currentChord!.notes);
      expect(result).toBe('correct');
    });

    it('should return incorrect for incorrect answer', () => {
      drillManager.getQuestion();
      // We need to ensure we pass notes that are NOT in the chord.
      // But we don't know the chord.
      // Let's pass a nonsense note that is never in C Major scale? 'C#' is in scale? No.
      // C Major: C D E F G A B.
      // So C# is definitely incorrect.
      const result = drillManager.checkAnswer(['C#']);
      expect(result).toBe('incorrect');
    });

    it('should return continue for partial answer', () => {
      drillManager.getQuestion();
      const currentChord = drillManager.getCurrentChord();
      // Take subset
      if (currentChord && currentChord.notes.length > 1) {
        const subset = [currentChord.notes[0]];
        const result = drillManager.checkAnswer(subset);
        expect(result).toBe('continue');
      }
    });

    it('should accept notes in any order', () => {
      drillManager.getQuestion();
      const currentChord = drillManager.getCurrentChord();
      const shuffled = [...currentChord!.notes].reverse();
      const result = drillManager.checkAnswer(shuffled);
      expect(result).toBe('correct');
    });
  });

  describe('scoring', () => {
    it('should track correct answers', () => {
      drillManager.getQuestion();
      const currentChord = drillManager.getCurrentChord();
      drillManager.checkAnswer(currentChord!.notes);
      expect(drillManager.getScore()).toBe('1 / 1');
    });

    it('should not increment score for incorrect answers', () => {
      drillManager.getQuestion();
      // Use invalid note
      drillManager.checkAnswer(['C#']);
      expect(drillManager.getScore()).toBe('0 / 0');
    });

    it('should reset score', () => {
      drillManager.getQuestion();
      const currentChord = drillManager.getCurrentChord();
      drillManager.checkAnswer(currentChord!.notes);
      drillManager.resetScore();
      expect(drillManager.getScore()).toBe('0 / 0');
    });
  });
});
