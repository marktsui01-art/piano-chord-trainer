import { NoteName, Chord } from './content';
import { ChordModule } from './state';
import { DrillStrategy, DrillQuestion, DrillResult } from './drills/DrillStrategy';
import { ChordDrill } from './drills/ChordDrill';
import { SpeedDrill } from './drills/SpeedDrill';
import { IntervalDrill } from './drills/IntervalDrill';
import { MelodyDrill } from './drills/MelodyDrill';

export class DrillManager {
  private strategy: DrillStrategy;
  private chordDrill: ChordDrill;
  private speedDrill: SpeedDrill;
  private intervalDrill: IntervalDrill;
  private melodyDrill: MelodyDrill;

  constructor() {
    this.chordDrill = new ChordDrill();
    this.speedDrill = new SpeedDrill();
    this.intervalDrill = new IntervalDrill();
    this.melodyDrill = new MelodyDrill();
    this.strategy = this.chordDrill; // Default strategy
  }

  public setModule(module: ChordModule) {
    if (module === 'speed') {
      this.strategy = this.speedDrill;
    } else if (module === 'interval') {
      this.strategy = this.intervalDrill;
    } else if (module === 'melody') {
      this.strategy = this.melodyDrill;
    } else {
      this.strategy = this.chordDrill;
      this.chordDrill.setModule(module);
    }
    this.strategy.resetScore();
  }

  public setOptions(enableInversions: boolean, enableWideRange: boolean) {
    this.chordDrill.setOptions(enableInversions, enableWideRange);
  }

  public getQuestion(): DrillQuestion {
    return this.strategy.getQuestion();
  }

  // specific to ChordDrill, used in main.ts to check if a chord exists
  public getCurrentChord(): Chord | null {
    return this.chordDrill.getCurrentChord();
  }

  public getVexFlowNotes(baseOctave: number): string[] {
    return this.strategy.getVexFlowNotes(baseOctave);
  }

  public get isSequential(): boolean {
    return this.strategy.isSequential;
  }

  public getCurrentIndex(): number | undefined {
    // Only MelodyDrill has getCurrentIndex
    if ('getCurrentIndex' in this.strategy && typeof this.strategy.getCurrentIndex === 'function') {
      return (this.strategy as any).getCurrentIndex();
    }
    return undefined;
  }

  public getCurrentPitches(baseOctave: number): string[] {
    return this.strategy.getPlaybackNotes(baseOctave);
  }

  public getLastCorrectNote(): string | null {
    if (this.strategy.getLastCorrectNote) {
      return this.strategy.getLastCorrectNote();
    }
    return null;
  }

  public checkAnswer(inputNotes: NoteName[]): DrillResult {
    return this.strategy.checkAnswer(inputNotes);
  }

  public getScore(): string {
    return this.strategy.getScore();
  }

  public resetScore() {
    this.strategy.resetScore();
  }
}
