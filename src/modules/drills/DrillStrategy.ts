import { NoteName } from '../content';
import { KeyMode } from '../keys';

export type DrillResult = 'correct' | 'incorrect' | 'continue' | null;

export interface DrillQuestion {
  name: string;
}

export interface DrillStrategy {
  readonly isSequential: boolean;
  getQuestion(): DrillQuestion;
  checkAnswer(input: NoteName[]): DrillResult;
  getScore(): string;
  resetScore(): void;

  // Optional method to set key context
  setKeyContext?(keyId: string, mode: KeyMode): void;

  // Optional method to set drill options
  setOptions?(enableInversions: boolean, range: 'default' | 'low' | 'high' | 'wide'): void;

  /**
   * Returns notes formatted for VexFlow (e.g. "C/4")
   */
  getVexFlowNotes(baseOctave: number): string[];

  /**
   * Returns notes formatted for Tone.js (e.g. "C4")
   */
  getPlaybackNotes(baseOctave: number): string[];

  /**
   * Returns the last correctly identified note (e.g. "C4")
   */
  getLastCorrectNote?(baseOctave: number): string | null;
}
