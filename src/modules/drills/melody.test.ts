import { describe, it, expect, beforeEach } from 'vitest';
import { MelodyDrill } from './MelodyDrill';

describe('MelodyDrill', () => {
  let drill: MelodyDrill;

  beforeEach(() => {
    drill = new MelodyDrill();
    // Force a known pattern for testing: C-D-E-F-G
    // We can't easily force the random generator, but we can check the sequence after getQuestion
    // drill.setDifficulty('beginner'); // REMOVED: Method no longer exists
    drill.getQuestion();
  });

  it('should advance one step for a single correct note', () => {
    // Find the first note
    const sequence = (drill as any).sequence;
    const firstNote = sequence[0].name;

    const result = drill.checkAnswer([firstNote]);

    // If the sequence is only 1 note long (unlikely but possible with random), it would be 'correct'
    if (sequence.length === 1) {
      expect(result).toBe('correct');
    } else {
      expect(result).toBe('continue');
    }

    expect(drill.getCurrentIndex()).toBe(1);
  });

  it('should advance multiple steps for multiple correct notes in sequence', () => {
    const sequence = (drill as any).sequence;
    // Ensure we have at least 3 notes for this test
    if (sequence.length < 3) {
      (drill as any).sequence = [
        { name: 'C', octave: 4 },
        { name: 'D', octave: 4 },
        { name: 'E', octave: 4 },
      ];
      (drill as any).currentIndex = 0;
    }

    const firstNote = (drill as any).sequence[0].name;
    const secondNote = (drill as any).sequence[1].name;

    // Simulate typing two notes quickly or pasting
    const result = drill.checkAnswer([firstNote, secondNote]);

    expect(result).toBe('continue');
    expect(drill.getCurrentIndex()).toBe(2);
  });

  it('should handle repeated notes correctly', () => {
    // We need a pattern with repeated notes.
    // Since we can't force it, we'll manually set the sequence for this test
    (drill as any).sequence = [
      { name: 'C', octave: 4 },
      { name: 'C', octave: 4 },
      { name: 'D', octave: 4 },
    ];
    (drill as any).currentIndex = 0;

    // Simulate typing "CC"
    const result = drill.checkAnswer(['C', 'C']);

    expect(result).toBe('continue');
    expect(drill.getCurrentIndex()).toBe(2);
  });

  it('should stop processing if a note is incorrect', () => {
    // Force a known sequence: C-D-E
    (drill as any).sequence = [
      { name: 'C', octave: 4 },
      { name: 'D', octave: 4 },
      { name: 'E', octave: 4 },
    ];
    (drill as any).currentIndex = 0;

    // 'C' matches target 'C'. Index -> 1 (Target 'D').
    // 'C' != 'D'. Ignored.
    // 'D' matches target 'D'. Index -> 2.
    const result = drill.checkAnswer(['C', 'C', 'D']);

    expect(drill.getCurrentIndex()).toBe(2);
    expect(result).toBe('continue');
  });
});
