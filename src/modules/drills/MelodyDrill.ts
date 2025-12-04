import { DrillStrategy, DrillQuestion, DrillResult } from './DrillStrategy';
import { NoteName } from '../content';
import { generatePattern } from './patterns';
import { KeyMode, isEnharmonicMatch } from '../keys';

export class MelodyDrill implements DrillStrategy {
    public readonly isSequential = true;
    private sequence: { name: NoteName; octave: number }[] = [];
    private currentIndex: number = 0;
    private score: number = 0;
    private total: number = 0;
    private currentKeyId: string = 'C';
    private currentMode: KeyMode = 'Major';

    public setKeyContext(keyId: string, mode: KeyMode) {
        this.currentKeyId = keyId;
        this.currentMode = mode;
    }

    private getDifficulty() {
        // Simple progression based on score
        if (this.score > 20) return 'advanced';
        if (this.score > 10) return 'intermediate';
        return 'beginner';
    }

    public getQuestion(): DrillQuestion {
        // Generate pattern based on current key context and random difficulty
        const pattern = generatePattern(this.currentKeyId, this.currentMode, this.getDifficulty());
        this.sequence = pattern.notes;
        this.currentIndex = 0;

        return { name: pattern.name };
    }

    public getVexFlowNotes(_baseOctave: number): string[] {
        // Render the full sequence
        return this.sequence.map(n => `${n.name}/${n.octave}`);
    }

    public getCurrentIndex(): number {
        return this.currentIndex;
    }

    public getPlaybackNotes(_baseOctave: number): string[] {
        // Return full sequence for playback
        return this.sequence.map(n => `${n.name}${n.octave}`);
    }

    public getLastCorrectNote(): string | null {
        if (this.currentIndex > 0) {
            const note = this.sequence[this.currentIndex - 1];
            return `${note.name}${note.octave}`;
        }
        return null;
    }

    public checkAnswer(inputNotes: NoteName[]): DrillResult {
        if (inputNotes.length === 0) return null;

        // Process input notes against the sequence

        let advanced = false;

        for (const note of inputNotes) {
            if (this.currentIndex >= this.sequence.length) break;

            const targetNote = this.sequence[this.currentIndex];
            if (isEnharmonicMatch(note, targetNote.name)) {
                this.currentIndex++;
                advanced = true;
            }
        }

        if (this.currentIndex >= this.sequence.length) {
            this.score++;
            this.total++;
            return 'correct';
        }

        if (advanced) {
            return 'continue';
        }

        // If we had input but didn't advance, it's incorrect.
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
