import { NoteName } from '../content';
import { DrillStrategy, DrillQuestion, DrillResult } from './DrillStrategy';
import { KeyMode, getScaleForKey, isEnharmonicMatch } from '../keys';

interface SpeedNote {
    name: NoteName;
    octave: number;
}

export class SpeedDrill implements DrillStrategy {
    public readonly isSequential = false;
    private currentNote: SpeedNote | null = null;
    private score: number = 0;
    private total: number = 0;
    private currentKeyId: string = 'C';
    private currentMode: KeyMode = 'Major';

    public setKeyContext(keyId: string, mode: KeyMode) {
        this.currentKeyId = keyId;
        this.currentMode = mode;
    }

    public getQuestion(): DrillQuestion {
        // Generate random note WITHIN the key
        const scale = getScaleForKey(this.currentKeyId, this.currentMode);

        // Fallback if scale empty
        const effectiveScale = scale.length > 0 ? scale : ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as NoteName[];

        // Pick random note from scale
        const name = effectiveScale[Math.floor(Math.random() * effectiveScale.length)];

        // Octave 3, 4, 5
        const octave = 3 + Math.floor(Math.random() * 3);

        this.currentNote = { name, octave };
        return { name: `Note: ${name}` };
    }

    public getVexFlowNotes(_baseOctave: number): string[] {
        if (!this.currentNote) return [];
        return [`${this.currentNote.name}/${this.currentNote.octave}`];
    }

    public getPlaybackNotes(_baseOctave: number): string[] {
        if (!this.currentNote) return [];
        return [`${this.currentNote.name}${this.currentNote.octave}`];
    }

    public checkAnswer(inputNotes: NoteName[]): DrillResult {
        if (!this.currentNote) return null;

        // Check if the correct note is held
        const correct = inputNotes.some(n => isEnharmonicMatch(n, this.currentNote!.name));

        if (correct) {
            this.score++;
            this.total++;
            return 'correct';
        }

        // If any note is pressed but it's wrong
        if (inputNotes.length > 0) {
            return 'incorrect';
        }

        return null;
    }

    public getScore(): string {
        return `${this.score} / ${this.total}`;
    }

    public resetScore() {
        this.score = 0;
        this.total = 0;
    }
}
