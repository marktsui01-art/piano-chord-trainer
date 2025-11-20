import { Chord, C_MAJOR_TRIADS, C_MAJOR_SEVENTHS } from './content';
import { ChordModule } from './state';

export class LessonManager {
  private currentIndex: number = 0;
  private currentModule: ChordModule = 'triads';
  private chords: Chord[] = [];

  constructor() {
    this.loadModule();
  }

  public setModule(module: ChordModule) {
    this.currentModule = module;
    this.loadModule();
    this.currentIndex = 0;
  }

  private loadModule() {
    if (this.currentModule === 'triads') {
      this.chords = C_MAJOR_TRIADS;
    } else {
      this.chords = C_MAJOR_SEVENTHS;
    }
  }

  public getCurrentChord(): Chord {
    return this.chords[this.currentIndex];
  }

  public next(): Chord {
    this.currentIndex = (this.currentIndex + 1) % this.chords.length;
    return this.getCurrentChord();
  }

  public previous(): Chord {
    this.currentIndex = (this.currentIndex - 1 + this.chords.length) % this.chords.length;
    return this.getCurrentChord();
  }
}
