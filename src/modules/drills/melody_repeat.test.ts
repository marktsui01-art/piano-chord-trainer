import { describe, it, expect, beforeEach } from 'vitest';
import { MelodyDrill } from './MelodyDrill';

describe('MelodyDrill Repeated Notes', () => {
  let drill: MelodyDrill;

  beforeEach(() => {
    drill = new MelodyDrill();
    // Force a sequence: C4, C4, E4
    (drill as any).sequence = [
      { name: 'C', octave: 4 },
      { name: 'C', octave: 4 },
      { name: 'E', octave: 4 },
    ];
    (drill as any).currentIndex = 0;
    (drill as any).score = 0;
    (drill as any).total = 0;
  });

  it('should handle repeated notes correctly', () => {
    // 1. Play first C
    let result = drill.checkAnswer(['C']);
    expect(result).toBe('continue');
    expect(drill.getCurrentIndex()).toBe(1);

    // 2. Play C again (simulating held note or re-trigger without clearing?)
    // If input is still ['C'], it implies the user hasn't released.
    // MelodyDrill logic currently iterates through input.
    // If input is ['C'], and target is 'C', it advances.

    result = drill.checkAnswer(['C']);
    expect(result).toBe('continue');
    expect(drill.getCurrentIndex()).toBe(2);
  });
});
