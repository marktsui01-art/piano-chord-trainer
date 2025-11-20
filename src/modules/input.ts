import { WebMidi, Input } from 'webmidi';
import { NoteName } from './content';

export type InputEventCallback = (notes: NoteName[]) => void;

export class InputManager {
  private midiInput: Input | null = null;
  private activeNotes: Set<NoteName> = new Set();
  private onNotesChanged: InputEventCallback;

  constructor(onNotesChanged: InputEventCallback) {
    this.onNotesChanged = onNotesChanged;
    this.initMidi();
    this.initKeyboard();
  }

  private async initMidi() {
    try {
      await WebMidi.enable();
      if (WebMidi.inputs.length > 0) {
        this.midiInput = WebMidi.inputs[0];
        console.log(`MIDI Input connected: ${this.midiInput.name}`);
        this.setupMidiListeners();
      } else {
        console.log('No MIDI inputs found.');
      }

      WebMidi.addListener('connected', (e) => {
        if (e.port instanceof Input && !this.midiInput) {
          this.midiInput = e.port;
          console.log(`MIDI Input connected: ${this.midiInput.name}`);
          this.setupMidiListeners();
        }
      });
    } catch (err) {
      console.warn('WebMidi could not be enabled:', err);
    }
  }

  private setupMidiListeners() {
    if (!this.midiInput) return;

    this.midiInput.addListener('noteon', (e) => {
      const noteName = (e.note.name + (e.note.accidental || '')) as NoteName;
      this.activeNotes.add(noteName);
      this.emitNotes();
    });

    this.midiInput.addListener('noteoff', (e) => {
      const noteName = (e.note.name + (e.note.accidental || '')) as NoteName;
      this.activeNotes.delete(noteName);
      this.emitNotes();
    });
  }

  private initKeyboard() {
    // Listen for specific text input field if we decide to use one,
    // or global keydown for "virtual piano" keys if requested.
    // For now, based on requirements, we need a text fallback.
    // This might be handled by the UI component calling a method here,
    // but let's expose a method to process text input.
  }

  public processTextInput(text: string): NoteName[] {
    const cleanText = text.toUpperCase();
    // Match note names: A-G followed optionally by # or B (flat)
    const matches = cleanText.match(/[A-G][#B]?/g);

    if (!matches) return [];

    const notes: NoteName[] = [];
    const validNoteNames = new Set<string>([
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
    ]);

    matches.forEach((m) => {
      let note = m;
      // Normalize flats: "EB" -> "Eb"
      if (note.length === 2 && note[1] === 'B') {
        note = note[0] + 'b';
      }

      if (validNoteNames.has(note)) {
        notes.push(note as NoteName);
      }
    });

    return notes;
  }

  // Method to simulate input from UI (virtual keyboard or text input)
  public setVirtualInput(notes: NoteName[]) {
    this.activeNotes.clear();
    notes.forEach((n) => this.activeNotes.add(n));
    this.emitNotes();
  }

  private emitNotes() {
    this.onNotesChanged(Array.from(this.activeNotes));
  }
}
