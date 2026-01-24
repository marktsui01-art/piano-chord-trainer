import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RhythmGame } from './rhythm-game';
import { AudioManager } from './audio';
import * as Tone from 'tone';

// Mock Tone
vi.mock('tone', () => ({
  Transport: {
    stop: vi.fn(),
    cancel: vi.fn(),
    start: vi.fn(),
    bpm: { value: 0 },
    schedule: vi.fn(),
    progress: 0 // Default
  },
  start: vi.fn().mockResolvedValue(undefined),
  MembraneSynth: class {
    toDestination() { return this; }
    volume = { value: 0 };
    triggerAttackRelease = vi.fn();
  },
  MetalSynth: class {
    toDestination() { return this; }
    volume = { value: 0 };
    triggerAttackRelease = vi.fn();
  },
  Synth: class {
    toDestination() { return this; }
    volume = { value: 0 };
    triggerAttackRelease = vi.fn();
  },
  Sampler: class {
    toDestination() { return this; }
    volume = { value: 0 };
    triggerAttackRelease = vi.fn();
  }
}));

// Mock AudioManager
vi.mock('./audio', () => {
  return {
    AudioManager: class {
      playRankedNote = vi.fn();
      playIncorrect = vi.fn();
      playDrum = vi.fn();
    }
  };
});

describe('RhythmGame', () => {
  let game: RhythmGame;
  let audioManager: AudioManager;

  beforeEach(() => {
    audioManager = new AudioManager();
    game = new RhythmGame(audioManager);

    // Mock Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'test-canvas';
    document.body.appendChild(canvas);
    game.init('test-canvas');
  });

  it('should initialize and start', async () => {
    await game.start();
    expect(Tone.Transport.start).toHaveBeenCalled();
  });

  it('should handle input correctly (Easy Mode)', async () => {
    await game.start();
    game.setDifficulty('easy');

    // Simulate time at 0 (Target is at 0)
    // We need to hack the Transport.progress if possible, or just trust logic.
    // Since we can't easily change the mocked Transport.progress property dynamically in this setup without complex mock:
    // We rely on the fact that default mocked progress is 0 (from factory above).

    // Hit at 0.0
    game.handleInput('left', 0);
    // Should hit target at 0.0
    expect(audioManager.playRankedNote).toHaveBeenCalledWith('left', 0, '32n');
  });

  it('should switch to hard mode and respect lanes', async () => {
      await game.start();
      game.setDifficulty('hard');
      // Hard mode: Left pattern is {time: 0, lane: 0}, {time: 0.5, lane: 1}

      // Mock progress 0
      // Hit lane 1 (Wrong lane for time 0)
      game.handleInput('left', 1);
      // Should miss
      expect(audioManager.playIncorrect).toHaveBeenCalled();

      // Hit lane 0 (Correct lane for time 0)
      game.handleInput('left', 0);
      expect(audioManager.playRankedNote).toHaveBeenCalled();
  });
});
