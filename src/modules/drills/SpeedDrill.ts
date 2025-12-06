import { NoteName } from '../content';
import { DrillStrategy, DrillQuestion, DrillResult } from './DrillStrategy';
import { KeyMode, getScaleForKey, isEnharmonicMatch } from '../keys';

interface SpeedNote {
    name: NoteName;
    octaveOffset: number;
}

export class SpeedDrill implements DrillStrategy {
    public readonly isSequential = false;
    private currentNote: SpeedNote | null = null;
    private score: number = 0;
    private total: number = 0;
    private currentKeyId: string = 'C';
    private currentMode: KeyMode = 'Major';
    private enableWideRange: boolean = false;

    public setKeyContext(keyId: string, mode: KeyMode) {
        this.currentKeyId = keyId;
        this.currentMode = mode;
    }

    public setOptions(_enableInversions: boolean, enableWideRange: boolean) {
        // Inversions not used in speed drill
        this.enableWideRange = enableWideRange;
    }

    public getQuestion(): DrillQuestion {
        // Generate random note WITHIN the key
        const scale = getScaleForKey(this.currentKeyId, this.currentMode);

        // Fallback if scale empty
        const effectiveScale = scale.length > 0 ? scale : ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as NoteName[];

        // Pick random note from scale
        const name = effectiveScale[Math.floor(Math.random() * effectiveScale.length)];

        // Calculate octave offset based on wide range setting
        // Normal range (0): Notes stay near base octave
        // Wide range (-1, 0, 1): Notes can be one octave lower or higher
        let octaveOffset = 0;
        if (this.enableWideRange) {
             // -1, 0, 1
             octaveOffset = Math.floor(Math.random() * 3) - 1;
        }

        this.currentNote = { name, octaveOffset };
        return { name: `Note: ${name}` };
    }

    public getVexFlowNotes(baseOctave: number): string[] {
        if (!this.currentNote) return [];
        return [`${this.currentNote.name}/${baseOctave + this.currentNote.octaveOffset}`];
    }

    public getPlaybackNotes(baseOctave: number): string[] {
        if (!this.currentNote) return [];
        return [`${this.currentNote.name}${baseOctave + this.currentNote.octaveOffset}`];
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
