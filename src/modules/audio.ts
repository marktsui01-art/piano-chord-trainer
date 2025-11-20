import * as Tone from 'tone';
import { NoteName } from './content';

export class AudioManager {
  private sampler: Tone.Sampler;
  private feedbackSynth: Tone.Synth;
  private isLoaded: boolean = false;

  constructor(onLoad?: () => void) {
    this.feedbackSynth = new Tone.Synth().toDestination();

    this.sampler = new Tone.Sampler({
      urls: {
        A0: 'A0.mp3',
        C1: 'C1.mp3',
        'D#1': 'Ds1.mp3',
        'F#1': 'Fs1.mp3',
        A1: 'A1.mp3',
        C2: 'C2.mp3',
        'D#2': 'Ds2.mp3',
        'F#2': 'Fs2.mp3',
        A2: 'A2.mp3',
        C3: 'C3.mp3',
        'D#3': 'Ds3.mp3',
        'F#3': 'Fs3.mp3',
        A3: 'A3.mp3',
        C4: 'C4.mp3',
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',
        C5: 'C5.mp3',
        'D#5': 'Ds5.mp3',
        'F#5': 'Fs5.mp3',
        A5: 'A5.mp3',
        C6: 'C6.mp3',
        'D#6': 'Ds6.mp3',
        'F#6': 'Fs6.mp3',
        A6: 'A6.mp3',
        C7: 'C7.mp3',
        'D#7': 'Ds7.mp3',
        'F#7': 'Fs7.mp3',
        A7: 'A7.mp3',
        C8: 'C8.mp3',
      },
      release: 1,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      onload: () => {
        this.isLoaded = true;
        console.log('✓ Piano samples loaded');
        if (onLoad) onLoad();
      },
    }).toDestination();

    this.sampler.volume.value = -5;
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

  public playChord(notes: NoteName[], duration: string = '2n') {
    if (!this.isLoaded) {
      console.warn('⚠ Piano samples not loaded yet');
      return;
    }
    // Default to octave 4 for chords
    const fullNotes = notes.map((n) => n + '4');
    this.sampler.triggerAttackRelease(fullNotes, duration);
  }

  public playNotes(notes: string[], duration: string = '8n') {
    if (!this.isLoaded) return;
    this.sampler.triggerAttackRelease(notes, duration);
  }

  public playCorrect() {
    // Keep feedback synth for distinct sound
    this.feedbackSynth.triggerAttackRelease('C5', '8n');
    setTimeout(() => this.feedbackSynth.triggerAttackRelease('E5', '8n'), 100);
  }

  public playIncorrect() {
    this.feedbackSynth.triggerAttackRelease('G2', '4n');
  }
}
