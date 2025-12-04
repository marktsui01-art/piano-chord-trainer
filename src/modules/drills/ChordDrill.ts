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
    public enableWideRange: boolean = false;

    public setModule(module: ChordModule) {
        this.currentModule = module;
    }

    public setKeyContext(keyId: string, mode: KeyMode) {
        this.currentKeyId = keyId;
        this.currentMode = mode;
    }

    public setOptions(enableInversions: boolean, enableWideRange: boolean) {
        this.enableInversions = enableInversions;
        this.enableWideRange = enableWideRange;
    }

    public getQuestion(): DrillQuestion {
        // Select chords based on current module
        const type = this.currentModule === 'sevenths' ? 'sevenths' : 'triads';

        let availableChords: Chord[] = generateDiatonicChords(this.currentKeyId, this.currentMode, type);

        if (availableChords.length === 0) {
            // Fallback (e.g. if key invalid)
            // But generateDiatonicChords guarantees array return
            return { name: "Invalid Key/Mode" };
        }

        // Avoid repeating the same question if possible
        let nextChord: Chord;
        do {
            nextChord = availableChords[Math.floor(Math.random() * availableChords.length)];
        } while (availableChords.length > 1 && this.currentChord && nextChord.name === this.currentChord.name);

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

        const targetNotes = this.currentChord.notes;

        // Check if every target note has an enharmonic match in input
        const allTargetsFound = targetNotes.every(target =>
            inputNotes.some(input => isEnharmonicMatch(input, target))
        );

        // And check if every input note matches a target (no extra notes)
        const allInputsValid = inputNotes.every(input =>
            targetNotes.some(target => isEnharmonicMatch(input, target))
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
