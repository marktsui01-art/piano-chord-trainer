import { describe, it, expect } from 'vitest';
import { InputManager } from './input';

describe('InputManager', () => {
  const inputManager = new InputManager(() => {});

  it('parses simple space-separated notes', () => {
    expect(inputManager.processTextInput('C E G')).toEqual(['C', 'E', 'G']);
  });

  it('parses comma-separated notes', () => {
    expect(inputManager.processTextInput('C, E, G')).toEqual(['C', 'E', 'G']);
  });

  it('parses compact notes', () => {
    expect(inputManager.processTextInput('CEG')).toEqual(['C', 'E', 'G']);
  });

  it('handles accidentals', () => {
    expect(inputManager.processTextInput('C# EB F#')).toEqual(['C#', 'Eb', 'F#']);
  });

  it('is case insensitive', () => {
    expect(inputManager.processTextInput('c e g')).toEqual(['C', 'E', 'G']);
  });

  it('handles mixed separators', () => {
    expect(inputManager.processTextInput('C, E G')).toEqual(['C', 'E', 'G']);
  });

  it('ignores invalid characters', () => {
    expect(inputManager.processTextInput('C H Z G')).toEqual(['C', 'G']);
  });
});
