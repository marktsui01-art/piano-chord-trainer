import { NoteName, Chord } from './content';
import { ChordModule } from './state';
import { DrillStrategy, DrillQuestion, DrillResult } from './drills/DrillStrategy';
import { ChordDrill } from './drills/ChordDrill';
import { SpeedDrill } from './drills/SpeedDrill';
import { IntervalDrill } from './drills/IntervalDrill';
import { MelodyDrill } from './drills/MelodyDrill';
import { KeyMode } from './keys';

export class DrillManager {
  private strategy: DrillStrategy;
  private chordDrill: ChordDrill;
  private speedDrill: SpeedDrill;
  private intervalDrill: IntervalDrill;
  private melodyDrill: MelodyDrill;

  private enableInversions: boolean = false;
  private range: 'default' | 'low' | 'high' | 'wide' = 'default';

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

    // Apply current options to the new strategy
    if (this.strategy.setOptions) {
      this.strategy.setOptions(this.enableInversions, this.range);
    }

    this.strategy.resetScore();
  }

  public setStrategy(strategyName: 'chord' | 'melody' | 'speed' | 'interval') {
    switch (strategyName) {
      case 'melody': this.strategy = this.melodyDrill; break;
      case 'speed': this.strategy = this.speedDrill; break;
      case 'interval': this.strategy = this.intervalDrill; break;
      case 'chord':
      default:
        this.strategy = this.chordDrill; break;
    }

    // Apply current options to the new strategy
    if (this.strategy.setOptions) {
      this.strategy.setOptions(this.enableInversions, this.range);
    }

    this.strategy.resetScore();
  }

  public setOptions(enableInversions: boolean, range: 'default' | 'low' | 'high' | 'wide') {
    this.enableInversions = enableInversions;
    this.range = range;

    if (this.strategy.setOptions) {
      this.strategy.setOptions(enableInversions, range);
    }
  }

  public getQuestion(keyId: string = 'C', mode: KeyMode = 'Major'): DrillQuestion {
    // Pass key context to strategy if supported
    if (this.strategy.setKeyContext) {
      this.strategy.setKeyContext(keyId, mode);
    }
    return this.strategy.getQuestion();
  }

  // specific to ChordDrill, used in main.ts to check if a chord exists
  public getCurrentChord(): Chord | null {
    return this.chordDrill.getCurrentChord();
  }

  public getVexFlowNotes(baseOctave: number): string[] {
    const notes = this.strategy.getVexFlowNotes(baseOctave);
    console.log(`[DrillManager] VexFlow notes: ${JSON.stringify(notes)}`);
    return notes;
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

  public getLastCorrectNote(baseOctave: number): string | null {
    if (this.strategy.getLastCorrectNote) {
      return this.strategy.getLastCorrectNote(baseOctave);
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
