import { NoteName } from '../content';
import { DrillStrategy, DrillQuestion, DrillResult } from './DrillStrategy';
import { getKeyById, getScaleForKey, KeyMode } from '../keys';

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

    public setKeyContext(keyId: string, _mode: KeyMode) {
        this.currentKeyId = keyId;
    }

    public getQuestion(): DrillQuestion {
        // Generate random note WITHIN the key
        const key = getKeyById(this.currentKeyId);
        const scale = key ? key.scale : ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as NoteName[];

        // Pick random note from scale
        const name = scale[Math.floor(Math.random() * scale.length)];

        // Octave 3, 4, 5
        const octave = 3 + Math.floor(Math.random() * 3);

        this.currentNote = { name, octave };
        return { name: `Note: ${name}` };
    }

    public checkAnswer(input: NoteName[]): DrillResult {
        if (!this.currentNote) return 'incorrect';
        // Check if input contains the target note name (Pitch Class match)
        const correct = input.includes(this.currentNote.name);
        if (correct) {
            this.score++;
            this.total++;
            return 'correct';
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

    public getVexFlowNotes(_baseOctave: number): string[] {
        if (!this.currentNote) return [];
        // Ignore baseOctave, use note's specific octave
        return [`${this.currentNote.name}/${this.currentNote.octave}`];
    }

    public getPlaybackNotes(_baseOctave: number): string[] {
        if (!this.currentNote) return [];
        return [`${this.currentNote.name}${this.currentNote.octave}`];
    }
}
