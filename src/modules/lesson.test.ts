import { describe, it, expect, beforeEach } from 'vitest';
import { LessonManager } from './lesson';
import { C_MAJOR_TRIADS, C_MAJOR_SEVENTHS } from './content';

describe('LessonManager', () => {
  let lessonManager: LessonManager;

  beforeEach(() => {
    lessonManager = new LessonManager();
    // Ensure default context matches the constants (C Major)
    lessonManager.setKeyContext('C', 'Major');
  });

  describe('getCurrentChord', () => {
    it('should return the first triad by default', () => {
      const chord = lessonManager.getCurrentChord();
      // Use toEqual for deep equality because objects are regenerated
      expect(chord).toEqual(C_MAJOR_TRIADS[0]);
    });

    it('should return the first seventh chord when module is set to sevenths', () => {
      lessonManager.setModule('sevenths');
      const chord = lessonManager.getCurrentChord();
      expect(chord).toEqual(C_MAJOR_SEVENTHS[0]);
    });
  });

  describe('next', () => {
    it('should advance to the next chord', () => {
      lessonManager.next();
      const chord = lessonManager.getCurrentChord();
      expect(chord).toEqual(C_MAJOR_TRIADS[1]);
    });

    it('should wrap around to the first chord after the last', () => {
      // Navigate to the last chord
      for (let i = 0; i < C_MAJOR_TRIADS.length; i++) {
        lessonManager.next();
      }
      const chord = lessonManager.getCurrentChord();
      expect(chord).toEqual(C_MAJOR_TRIADS[0]);
    });
  });

  describe('previous', () => {
    it('should go back to the previous chord', () => {
      lessonManager.next();
      lessonManager.previous();
      const chord = lessonManager.getCurrentChord();
      expect(chord).toEqual(C_MAJOR_TRIADS[0]);
    });

    it('should wrap around to the last chord when going back from the first', () => {
      lessonManager.previous();
      const chord = lessonManager.getCurrentChord();
      expect(chord).toEqual(C_MAJOR_TRIADS[C_MAJOR_TRIADS.length - 1]);
    });
  });

  describe('setModule', () => {
    it('should reset to the first chord when changing modules', () => {
      lessonManager.next();
      lessonManager.next();
      lessonManager.setModule('sevenths');
      const chord = lessonManager.getCurrentChord();
      expect(chord).toEqual(C_MAJOR_SEVENTHS[0]);
    });
  });
});
