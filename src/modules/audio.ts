import * as Tone from 'tone';
import { NoteName } from './content';

export class AudioManager {
  private synth: Tone.PolySynth;
  private feedbackSynth: Tone.Synth;

  constructor() {
    this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    this.feedbackSynth = new Tone.Synth().toDestination();
    this.synth.volume.value = -10; // Lower volume slightly
  }

  public async start(): Promise<boolean> {
    try {
      await Tone.start();
      console.log('✓ Audio context started successfully');
      return true;
    } catch (err) {
      console.error('⚠ Failed to start audio context:', err);
      return false;
    }
  }

  public playChord(notes: NoteName[], duration: string = '1n') {
    // Convert NoteNames to frequencies or just string notation (e.g. "C4")
    // For simplicity, we'll assume octave 4 for now if not specified,
    // but ideally we should accept full note strings (e.g. "C4").
    const fullNotes = notes.map((n) => n + '4');
    this.synth.triggerAttackRelease(fullNotes, duration);
  }

  public playNotes(notes: string[], duration: string = '8n') {
    this.synth.triggerAttackRelease(notes, duration);
  }

  public playCorrect() {
    this.feedbackSynth.triggerAttackRelease('C5', '8n');
    setTimeout(() => this.feedbackSynth.triggerAttackRelease('E5', '8n'), 100);
  }

  public playIncorrect() {
    this.feedbackSynth.triggerAttackRelease('G2', '4n');
  }
}
