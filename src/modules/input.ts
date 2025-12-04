import { WebMidi, Input } from 'webmidi';
import { NoteName } from './content';
import { AudioInputManager } from './audio-input';

export type InputEventCallback = (notes: NoteName[]) => void;

export class InputManager {
  private midiInput: Input | null = null;
  private activeNotes: Set<NoteName> = new Set();
  private onNotesChanged: InputEventCallback;

  // Audio Input
  private audioInput: AudioInputManager | null = null;
  private isMicEnabled: boolean = false;

  constructor(onNotesChanged: InputEventCallback) {
    this.onNotesChanged = onNotesChanged;
    this.initMidi();
    this.initKeyboard();
  }

  public async enableMicrophone() {
    if (this.isMicEnabled) return;

    this.audioInput = new AudioInputManager((note) => {
      this.handleAudioNote(note);
    });

    try {
      await this.audioInput.start();
      this.isMicEnabled = true;
      console.log("✓ Microphone Input enabled");
    } catch (err) {
      console.error("Failed to enable microphone", err);
      throw err;
    }
  }

  private handleAudioNote(note: NoteName) {
    // For audio input, we "accumulate" notes because it's monophonic.
    // If the user plays C, then E, then G, we want to build the chord C-E-G.
    // We don't remove the note when they stop playing it (unlike MIDI noteoff).
    // The user will need to "Clear" or the game logic will reset on correct answer.

    if (!this.activeNotes.has(note)) {
      this.activeNotes.add(note);
      this.emitNotes();
    }
  }

  public resetInput(emit: boolean = true) {
    this.activeNotes.clear();
    if (emit) {
      this.emitNotes();
    }
  }

  private async initMidi() {
    try {
      await WebMidi.enable();
      if (WebMidi.inputs.length > 0) {
        this.midiInput = WebMidi.inputs[0];
        console.log(`✓ MIDI Input connected: ${this.midiInput.name}`);
        this.setupMidiListeners();
      } else {
        console.log('ℹ No MIDI inputs found. Text input is available as fallback.');
      }

      WebMidi.addListener('connected', (e) => {
        if (e.port instanceof Input && !this.midiInput) {
          this.midiInput = e.port;
          console.log(`✓ MIDI Input connected: ${this.midiInput.name}`);
          this.setupMidiListeners();
        }
      });

      WebMidi.addListener('disconnected', (e) => {
        if (e.port === this.midiInput) {
          console.log('⚠ MIDI Input disconnected. Using text input fallback.');
          this.midiInput = null;
        }
      });
    } catch (err) {
      console.warn(
        '⚠ WebMidi could not be enabled. This is normal if no MIDI device is connected. Text input is available.',
        err
      );
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
      // Only remove if we are NOT in "accumulation mode" (which we are effectively in if mic is on?)
      // Actually, MIDI should behave normally (hold to play). 
      // Audio input is the one that needs accumulation.
      // But if we mix them, it might be weird. 
      // Let's keep MIDI standard: lift key = remove note.
      // Audio input notes will stick until reset.
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
    // Updated regex to include Cb, B#, E#, Fb
    // Actually our NoteName type includes these now, but we need to parse them.
    // Simple regex for A-G followed by optional # or b.
    const matches = cleanText.match(/[A-G][#b]?/gi);

    if (!matches) return [];

    const notes: NoteName[] = [];
    // We need to validate against our allowed NoteNames.
    // Since we added Cb, B#, E#, Fb, we should check if they are valid.

    // Let's rely on the fact that our NoteName type is string union.
    // We can just cast if it looks like a note, but better to validate.

    // For simplicity, let's just pass through anything that looks like a note
    // and let the downstream logic handle it (or filter by valid NoteNames).

    matches.forEach((m) => {
      // Normalize case: "Eb"
      let note = m.charAt(0).toUpperCase();
      if (m.length > 1) {
        note += m.charAt(1).toLowerCase(); // "b" or "#" (though # is usually same case)
        // Actually usually # is kept as #.
        if (m.charAt(1) === '#') note = m.charAt(0).toUpperCase() + '#';
      }

      notes.push(note as NoteName);
    });

    return notes;
  }

  // Method to simulate input from UI (virtual keyboard or text input)
  public setVirtualInput(notes: NoteName[]) {
    this.activeNotes.clear();
    notes.forEach((n) => this.activeNotes.add(n));
    this.emitNotes();
  }

  public toggleNote(note: NoteName, active: boolean) {
    if (active) {
      this.activeNotes.add(note);
    } else {
      this.activeNotes.delete(note);
    }
    this.emitNotes();
  }

  public handleNoteOn(note: NoteName) {
    this.activeNotes.add(note);
    this.emitNotes();
  }

  public handleNoteOff(note: NoteName) {
    this.activeNotes.delete(note);
    this.emitNotes();
  }

  private emitNotes() {
    this.onNotesChanged(Array.from(this.activeNotes));
  }
}
