import { Chord, C_MAJOR_TRIADS, C_MAJOR_SEVENTHS, NoteName } from './content';
import { ChordModule } from './state';

export class DrillManager {
  private currentChord: Chord | null = null;
  private score: number = 0;
  private total: number = 0;

  private currentModule: ChordModule = 'triads';

  constructor() {}

  public setModule(module: ChordModule) {
    this.currentModule = module;
    // Optionally reset current question or score here if desired,
    // but for now we just ensure the NEXT question comes from the new module.
  }

  public getQuestion(): Chord {
    // Select chords based on current module
    let availableChords: Chord[] = [];
    if (this.currentModule === 'triads') {
      availableChords = C_MAJOR_TRIADS;
    } else {
      availableChords = C_MAJOR_SEVENTHS;
    }

    this.currentChord = availableChords[Math.floor(Math.random() * availableChords.length)];
    return this.currentChord;
  }

  public getCurrentChord(): Chord | null {
    return this.currentChord;
  }

  public checkAnswer(inputNotes: NoteName[]): boolean {
    if (!this.currentChord) return false;

    // Normalize and sort for comparison
    // This is a simplified check (ignoring octaves/inversions for now, checking pitch classes)
    const targetNotes = new Set(this.currentChord.notes);
    const inputSet = new Set(inputNotes);

    if (targetNotes.size !== inputSet.size) return false;

    for (let note of targetNotes) {
      if (!inputSet.has(note)) return false;
    }

    this.score++;
    this.total++;
    return true;
  }

  public getScore(): string {
    return `${this.score} / ${this.total}`;
  }

  public resetScore() {
    this.score = 0;
    this.total = 0;
  }
}
