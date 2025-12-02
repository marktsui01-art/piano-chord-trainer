import { Chord } from './content';
import { ChordModule } from './state';
import { KeyMode } from './keys';
import { generateDiatonicChords } from './chords';

export class LessonManager {
  private currentIndex: number = 0;
  private currentModule: ChordModule = 'triads';
  private currentKeyId: string = 'C';
  private currentMode: KeyMode = 'Major';
  private chords: Chord[] = [];

  constructor() {
    this.loadModule();
  }

  public setModule(module: ChordModule) {
    this.currentModule = module;
    this.loadModule();
    this.currentIndex = 0;
  }

  public setKeyContext(keyId: string, mode: KeyMode) {
    this.currentKeyId = keyId;
    this.currentMode = mode;
    this.loadModule();
    this.currentIndex = 0;
  }

  private loadModule() {
    const type = this.currentModule === 'sevenths' ? 'sevenths' : 'triads';

    // Check if we are in a mode where chords make sense (triads or sevenths)
    // If user selects 'speed' or other drills, this might not be relevant,
    // but LessonManager is usually only active for lesson view.

    this.chords = generateDiatonicChords(this.currentKeyId, this.currentMode, type);

    // Fallback if empty (shouldn't happen with valid keys)
    if (this.chords.length === 0) {
        // Fallback to C Major just to show something? Or keep empty?
        // Let's keep empty or handle gracefully.
        // Actually generateDiatonicChords returns empty on invalid key.
    }
  }

  public getCurrentChord(): Chord | null {
    if (this.chords.length === 0) return null;
    return this.chords[this.currentIndex];
  }

  public next(): Chord | null {
    if (this.chords.length === 0) return null;
    this.currentIndex = (this.currentIndex + 1) % this.chords.length;
    return this.getCurrentChord();
  }

  public previous(): Chord | null {
    if (this.chords.length === 0) return null;
    this.currentIndex = (this.currentIndex - 1 + this.chords.length) % this.chords.length;
    return this.getCurrentChord();
  }
}
