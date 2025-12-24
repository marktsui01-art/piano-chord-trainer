import { Chord, NoteName } from '../content';
import { ChordModule } from '../state';
import { DrillStrategy, DrillQuestion, DrillResult } from './DrillStrategy';
import { KeyMode, isEnharmonicMatch } from '../keys';
import { generateDiatonicChords } from '../chords';

export class ChordDrill implements DrillStrategy {
  public readonly isSequential = false;
  private currentChord: Chord | null = null;
  private currentInversion: number = 0;
  private currentOctaveShift: number = 0;

  private score: number = 0;
  private total: number = 0;

  private currentModule: ChordModule = 'triads';
  private currentKeyId: string = 'C';
  private currentMode: KeyMode = 'Major';

  public enableInversions: boolean = false;
  public range: 'default' | 'low' | 'high' | 'wide' = 'default';

  // Track input state for incremental feedback
  private previousInputNotes: NoteName[] = [];
  private lastMatchedPitch: string | null = null;

  public setModule(module: ChordModule) {
    this.currentModule = module;
  }

  public setKeyContext(keyId: string, mode: KeyMode) {
    this.currentKeyId = keyId;
    this.currentMode = mode;
  }

  public setOptions(enableInversions: boolean, range: 'default' | 'low' | 'high' | 'wide') {
    this.enableInversions = enableInversions;
    this.range = range;
  }

  public getQuestion(): DrillQuestion {
    // Select chords based on current module
    const type = this.currentModule === 'sevenths' ? 'sevenths' : 'triads';

    let availableChords: Chord[] = generateDiatonicChords(
      this.currentKeyId,
      this.currentMode,
      type
    );

    if (availableChords.length === 0) {
      // Fallback (e.g. if key invalid)
      // But generateDiatonicChords guarantees array return
      return { name: 'Invalid Key/Mode' };
    }

    // Avoid repeating the same question if possible
    let nextChord: Chord;
    do {
      nextChord = availableChords[Math.floor(Math.random() * availableChords.length)];
    } while (
      availableChords.length > 1 &&
      this.currentChord &&
      nextChord.name === this.currentChord.name
    );

    this.currentChord = nextChord;
    this.previousInputNotes = [];
    this.lastMatchedPitch = null;

    // Randomize Inversion
    if (this.enableInversions) {
      const maxInversion = this.currentModule === 'triads' ? 2 : 3;
      this.currentInversion = Math.floor(Math.random() * (maxInversion + 1));
    } else {
      this.currentInversion = 0;
    }

    // Determine Octave Shift based on Range
    switch (this.range) {
      case 'low':
        this.currentOctaveShift = -1;
        break;
      case 'high':
        this.currentOctaveShift = 1;
        break;
      case 'wide':
        const rand = Math.random();
        if (rand < 0.33) this.currentOctaveShift = -1;
        else if (rand < 0.66) this.currentOctaveShift = 0;
        else this.currentOctaveShift = 1;
        break;
      case 'default':
      default:
        this.currentOctaveShift = 0;
        break;
    }

    return { name: this.currentChord.name };
  }

  public getCurrentChord(): Chord | null {
    return this.currentChord;
  }

  public getVexFlowNotes(baseOctave: number): string[] {
    const workingNotes = this.getNormalizedNotes();
    return workingNotes.map((n) => `${n.name}/${baseOctave + n.octaveOffset}`);
  }

  public getPlaybackNotes(baseOctave: number): string[] {
    const workingNotes = this.getNormalizedNotes();
    return workingNotes.map((n) => `${n.name}${baseOctave + n.octaveOffset}`);
  }

  private getNormalizedNotes(): { name: NoteName; octaveOffset: number }[] {
    if (!this.currentChord) return [];

    const notes = [...this.currentChord.notes];
    const noteOrder: NoteName[] = [
      'C',
      'C#',
      'Db',
      'D',
      'D#',
      'Eb',
      'E',
      'F',
      'F#',
      'Gb',
      'G',
      'G#',
      'Ab',
      'A',
      'A#',
      'Bb',
      'B',
    ];

    let workingNotes: { name: NoteName; octaveOffset: number }[] = [];
    let currentOctaveOffset = 0;
    let lastNoteIndex = -1;

    for (const note of notes) {
      const index = noteOrder.indexOf(note);
      if (lastNoteIndex !== -1 && index < lastNoteIndex) {
        currentOctaveOffset++;
      }
      workingNotes.push({ name: note, octaveOffset: currentOctaveOffset });
      lastNoteIndex = index;
    }

    // Apply Inversion
    for (let i = 0; i < this.currentInversion; i++) {
      const first = workingNotes.shift();
      if (first) {
        first.octaveOffset += 1;
        workingNotes.push(first);
      }
    }

    // Apply Global Octave Shift
    workingNotes.forEach((n) => (n.octaveOffset += this.currentOctaveShift));

    return workingNotes;
  }

  public getLastCorrectNote(baseOctave: number): string | null {
    // If we have a cached matched pitch (NoteName), map it to the actual playback pitch
    // We need to re-calculate the pitch because we don't store the baseOctave.
    // Actually, we store lastMatchedPitch as just the NoteName?
    // No, we should store the NoteName and find the corresponding pitch in context.

    if (!this.lastMatchedPitch) return null;

    // Find the matching pitch in the current voicing
    const normalized = this.getNormalizedNotes();
    // normalized has { name, octaveOffset }

    // Find the item that corresponds to lastMatchedPitch (NoteName)
    // Note: lastMatchedPitch here is the NoteName string e.g. 'C'
    const match = normalized.find((n) => isEnharmonicMatch(n.name, this.lastMatchedPitch!));

    if (match) {
      return `${match.name}${baseOctave + match.octaveOffset}`;
    }
    return null;
  }

  public checkAnswer(inputNotes: NoteName[]): DrillResult {
    if (!this.currentChord) return 'incorrect';

    const targetNotes = this.currentChord.notes;

    // Check for new correct note to trigger feedback
    // We look for a note in inputNotes that is NOT in previousInputNotes
    // AND is part of the target chord.
    const newNotes = inputNotes.filter((n) => !this.previousInputNotes.includes(n));

    // Update previous state immediately (for next call)
    // Wait, if it's incorrect, do we update? Yes, input state is input state.
    this.previousInputNotes = [...inputNotes];

    // Did we find a new correct note?
    const newCorrectNote = newNotes.find((n) =>
      targetNotes.some((target) => isEnharmonicMatch(n, target))
    );

    if (newCorrectNote) {
      this.lastMatchedPitch = newCorrectNote;
    }

    // Check if every target note has an enharmonic match in input
    const allTargetsFound = targetNotes.every((target) =>
      inputNotes.some((input) => isEnharmonicMatch(input, target))
    );

    // And check if every input note matches a target (no extra notes)
    const allInputsValid = inputNotes.every((input) =>
      targetNotes.some((target) => isEnharmonicMatch(input, target))
    );

    if (allTargetsFound && allInputsValid) {
      this.score++;
      this.total++;
      return 'correct';
    }

    if (allInputsValid) {
      return 'continue';
    }

    return 'incorrect';
  }

  public getScore(): string {
    return `${this.score} / ${this.total}`;
  }

  public resetScore() {
    this.score = 0;
    this.total = 0;
  }
}
