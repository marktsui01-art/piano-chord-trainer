// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { VirtualPiano } from './virtual-piano';

describe('VirtualPiano', () => {
  let container: HTMLElement;
  let piano: VirtualPiano;
  let callback: any;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="piano-container"></div>';
    container = document.getElementById('piano-container')!;
    callback = vi.fn();
    piano = new VirtualPiano(callback);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render keys into the container', () => {
    piano.render('piano-container');
    const keys = container.querySelectorAll('.piano-key');
    expect(keys.length).toBe(12); // Single octave

    // Check for specific keys (C4)
    const c4 = container.querySelector('[data-note="C"][data-octave="4"]');
    expect(c4).not.toBeNull();
    expect(c4?.classList.contains('white')).toBe(true);

    const cSharp4 = container.querySelector('[data-note="C#"][data-octave="4"]');
    expect(cSharp4).not.toBeNull();
    expect(cSharp4?.classList.contains('black')).toBe(true);
  });

  describe('Toggle Mode (Default/Chords)', () => {
    it('should toggle notes on click', () => {
      piano.render('piano-container');
      const key = container.querySelector('[data-note="C"][data-octave="4"]') as HTMLElement;

      // First click: Activate
      key.dispatchEvent(new MouseEvent('mousedown'));
      expect(callback).toHaveBeenCalledWith('C', true);
      expect(key.classList.contains('active')).toBe(true);

      // Second click: Deactivate
      key.dispatchEvent(new MouseEvent('mousedown'));
      expect(callback).toHaveBeenCalledWith('C', false);
      expect(key.classList.contains('active')).toBe(false);
    });

    it('should return contextually correct note name', () => {
      piano.render('piano-container');
      piano.setKeyContext('Eb', 'Minor');

      // B in Eb Minor is Cb
      const bKey = container.querySelector('[data-note="B"][data-octave="4"]') as HTMLElement;

      bKey.dispatchEvent(new MouseEvent('mousedown'));

      expect(callback).toHaveBeenCalledWith('Cb', true);
      expect(bKey.classList.contains('active')).toBe(true);
    });

    it('should clear all active notes', () => {
      piano.render('piano-container');
      const key = container.querySelector('[data-note="C"][data-octave="4"]') as HTMLElement;

      key.dispatchEvent(new MouseEvent('mousedown'));
      expect(key.classList.contains('active')).toBe(true);

      piano.clear();
      expect(key.classList.contains('active')).toBe(false);
    });
  });

  describe('Trigger Mode (Melody)', () => {
    beforeEach(() => {
      piano.setInteractionType('trigger');
    });

    it('should not keep key active after click', () => {
      piano.render('piano-container');
      const key = container.querySelector('[data-note="C"][data-octave="4"]') as HTMLElement;

      key.dispatchEvent(new MouseEvent('mousedown'));

      // Should call with true
      expect(callback).toHaveBeenCalledWith('C', true);

      // In trigger mode, we expect it might visually flash but not set 'active' in the persistent sense
      // or it might auto-remove.
      // Based on plan: "The key will not stick in an 'active' state"

      // Let's assume implementation will emit True then immediately False or just True?
      // "Press a key triggers the verification logic immediately"
      // If main logic handles verification, it might call flashKey.

      // However, we still want to ensure 'active' class isn't toggled ON permanently.
      expect(key.classList.contains('active')).toBe(false);
    });

    it('should support flashKey for visual feedback', () => {
      piano.render('piano-container');
      const key = container.querySelector('[data-note="C"][data-octave="4"]') as HTMLElement;

      piano.flashKey('C', 'correct', 300);

      expect(key.classList.contains('correct')).toBe(true);

      vi.advanceTimersByTime(300);

      expect(key.classList.contains('correct')).toBe(false);
    });
  });
});
