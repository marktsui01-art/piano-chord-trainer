import { Chord, C_MAJOR_TRIADS, C_MAJOR_SEVENTHS, NoteName } from './content';
import { ChordModule } from './state';

export class DrillManager {
  private currentChord: Chord | null = null;
  private currentInversion: number = 0;
  private currentOctaveShift: number = 0; // -1, 0, 1

  private score: number = 0;
  private total: number = 0;

  private currentModule: ChordModule = 'triads';

  // Settings
  public enableInversions: boolean = false;
  public enableWideRange: boolean = false;

  constructor() { }

  public setModule(module: ChordModule) {
    this.currentModule = module;
  }

  public setOptions(enableInversions: boolean, enableWideRange: boolean) {
    this.enableInversions = enableInversions;
    this.enableWideRange = enableWideRange;
  }

  public getQuestion(): Chord {
    // Select chords based on current module
    let availableChords: Chord[] = [];
    if (this.currentModule === 'triads') {
      availableChords = C_MAJOR_TRIADS;
    } else {
      availableChords = C_MAJOR_SEVENTHS;
    }

    // Avoid repeating the same question if possible
    let nextChord: Chord;
    do {
      nextChord = availableChords[Math.floor(Math.random() * availableChords.length)];
    } while (availableChords.length > 1 && this.currentChord && nextChord === this.currentChord);

    this.currentChord = nextChord;

    // Randomize Inversion
    if (this.enableInversions) {
      const maxInversion = this.currentModule === 'triads' ? 2 : 3;
      this.currentInversion = Math.floor(Math.random() * (maxInversion + 1));
    } else {
      this.currentInversion = 0;
    }

    // Randomize Octave Shift (Ledger Lines)
    if (this.enableWideRange) {
      // Randomly choose -1, 0, or 1
      const rand = Math.random();
      if (rand < 0.33) this.currentOctaveShift = -1;
      else if (rand < 0.66) this.currentOctaveShift = 0;
      else this.currentOctaveShift = 1;
    } else {
      this.currentOctaveShift = 0;
    }

    return this.currentChord;
  }

  public getCurrentChord(): Chord | null {
    return this.currentChord;
  }

  /**
   * Returns the notes formatted for VexFlow rendering, accounting for inversion and octave shift.
   * e.g. ["C/4", "E/4", "G/4"]
   */
  public getCurrentVoicing(baseOctave: number): string[] {
    const workingNotes = this.getNormalizedNotes();
    // Format for VexFlow
    return workingNotes.map(n => `${n.name}/${baseOctave + n.octaveOffset}`);
  }

  /**
   * Returns the notes formatted for Tone.js playback.
   * e.g. ["C4", "E4", "G4"]
   */
  public getCurrentPitches(baseOctave: number): string[] {
    const workingNotes = this.getNormalizedNotes();
    // Format for Tone.js (No slash)
    return workingNotes.map(n => `${n.name}${baseOctave + n.octaveOffset}`);
  }

  private getNormalizedNotes(): { name: NoteName; octaveOffset: number }[] {
    if (!this.currentChord) return [];

    const notes = [...this.currentChord.notes];

    // 1. Normalize Root Position to be ascending
    // e.g. B, D, F -> B4, D5, F5 (not B4, D4, F4)
    const noteOrder: NoteName[] = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

    let workingNotes: { name: NoteName; octaveOffset: number }[] = [];
    let currentOctaveOffset = 0;
    let lastNoteIndex = -1;

    for (const note of notes) {
      const index = noteOrder.indexOf(note);
      // If we wrapped around (e.g. B -> D), increment octave
      if (lastNoteIndex !== -1 && index < lastNoteIndex) { // lastNoteIndex !== -1 to avoid incrementing for the very first note
        currentOctaveOffset++;
      }
      workingNotes.push({ name: note, octaveOffset: currentOctaveOffset });
      lastNoteIndex = index;
    }

    // 2. Apply Inversion
    for (let i = 0; i < this.currentInversion; i++) {
      const first = workingNotes.shift();
      if (first) {
        // When moving to the top, it must be higher than the current top
        // The current top is the last element
        // We can't just add 1 to its OWN offset, we need to ensure it's above the last note.
        // But simply adding 1 to the *previous* offset usually works for simple inversions?
        // Let's trace:
        // Root: B(0), D(1), F(1).
        // Inv 1: D(1), F(1), B(what?).
        // B(0) -> B(1) would make it B(1). Is B(1) > F(1)? Yes.
        // So adding 1 to its original offset is correct IF it was the bottom.

        first.octaveOffset += 1;
        workingNotes.push(first);
      }
    }

    // 3. Apply Global Octave Shift
    workingNotes.forEach(n => n.octaveOffset += this.currentOctaveShift);

    return workingNotes;
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
