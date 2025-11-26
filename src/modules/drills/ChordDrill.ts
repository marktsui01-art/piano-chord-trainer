import { Chord, C_MAJOR_TRIADS, C_MAJOR_SEVENTHS, NoteName } from '../content';
import { ChordModule } from '../state';
import { DrillStrategy, DrillQuestion, DrillResult } from './DrillStrategy';

export class ChordDrill implements DrillStrategy {
    public readonly isSequential = false;
    private currentChord: Chord | null = null;
    private currentInversion: number = 0;
    private currentOctaveShift: number = 0;

    private score: number = 0;
    private total: number = 0;

    private currentModule: ChordModule = 'triads';
    public enableInversions: boolean = false;
    public enableWideRange: boolean = false;

    public setModule(module: ChordModule) {
        this.currentModule = module;
    }

    public setOptions(enableInversions: boolean, enableWideRange: boolean) {
        this.enableInversions = enableInversions;
        this.enableWideRange = enableWideRange;
    }

    public getQuestion(): DrillQuestion {
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
            const rand = Math.random();
            if (rand < 0.33) this.currentOctaveShift = -1;
            else if (rand < 0.66) this.currentOctaveShift = 0;
            else this.currentOctaveShift = 1;
        } else {
            this.currentOctaveShift = 0;
        }

        return { name: this.currentChord.name };
    }

    public getCurrentChord(): Chord | null {
        return this.currentChord;
    }

    public getVexFlowNotes(baseOctave: number): string[] {
        const workingNotes = this.getNormalizedNotes();
        return workingNotes.map(n => `${n.name}/${baseOctave + n.octaveOffset}`);
    }

    public getPlaybackNotes(baseOctave: number): string[] {
        const workingNotes = this.getNormalizedNotes();
        return workingNotes.map(n => `${n.name}${baseOctave + n.octaveOffset}`);
    }

    private getNormalizedNotes(): { name: NoteName; octaveOffset: number }[] {
        if (!this.currentChord) return [];

        const notes = [...this.currentChord.notes];
        const noteOrder: NoteName[] = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

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
        workingNotes.forEach(n => n.octaveOffset += this.currentOctaveShift);

        return workingNotes;
    }

    public checkAnswer(inputNotes: NoteName[]): DrillResult {
        if (!this.currentChord) return 'incorrect';

        const targetNotes = new Set(this.currentChord.notes);
        const inputSet = new Set(inputNotes);

        if (targetNotes.size !== inputSet.size) return 'incorrect';

        for (let note of targetNotes) {
            if (!inputSet.has(note)) return 'incorrect';
        }

        this.score++;
        this.total++;
        return 'correct';
    }

    public getScore(): string {
        return `${this.score} / ${this.total}`;
    }

    public resetScore() {
        this.score = 0;
        this.total = 0;
    }
}
