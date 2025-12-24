import { DrillStrategy, DrillQuestion, DrillResult } from './DrillStrategy';
import { NoteName } from '../content';
import { KeyMode } from '../keys';

export class IntervalDrill implements DrillStrategy {
  public readonly isSequential = false;
  private currentInterval: string = '';
  private startNote: NoteName = 'C';
  private targetNote: NoteName = 'G';
  private score: number = 0;
  private total: number = 0;

  public setKeyContext(_keyId: string, _mode: KeyMode) {
    // Interval drill might be key-agnostic or use key for context
  }

  public setOptions(_enableInversions: boolean, _range: 'default' | 'low' | 'high' | 'wide') {
    // Not implemented yet for Interval Drill
  }

  public getQuestion(): DrillQuestion {
    // Simplified for now
    this.currentInterval = 'Perfect 5th';
    this.startNote = 'C';
    this.targetNote = 'G';

    return { name: `Interval: ${this.currentInterval} from ${this.startNote}` };
  }

  public getVexFlowNotes(baseOctave: number): string[] {
    return [`${this.startNote}/${baseOctave}`, `${this.targetNote}/${baseOctave}`];
  }

  public getPlaybackNotes(baseOctave: number): string[] {
    return [`${this.startNote}${baseOctave}`, `${this.targetNote}${baseOctave}`];
  }

  public getLastCorrectNote(baseOctave: number): string | null {
    // Assume the target note is the one they just entered to complete the interval
    return `${this.targetNote}${baseOctave}`;
  }

  public checkAnswer(inputNotes: NoteName[]): DrillResult {
    if (inputNotes.includes(this.targetNote)) {
      this.score++;
      this.total++;
      return 'correct';
    }
    return null;
  }

  public getScore(): string {
    return `${this.score} / ${this.total}`;
  }

  public resetScore() {
    this.score = 0;
    this.total = 0;
  }
}
