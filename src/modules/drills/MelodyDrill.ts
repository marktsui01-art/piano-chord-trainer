import { NoteName } from '../content';
import { DrillStrategy, DrillQuestion, DrillResult } from './DrillStrategy';
import { generatePattern, Difficulty } from './patterns';

export class MelodyDrill implements DrillStrategy {
    public readonly isSequential = true;
    private sequence: { name: NoteName, octave: number }[] = [];
    private currentIndex: number = 0;
    private difficulty: Difficulty = 'beginner';

    private score: number = 0;
    private total: number = 0;

    public setDifficulty(difficulty: Difficulty) {
        this.difficulty = difficulty;
    }

    public getQuestion(): DrillQuestion {
        // Generate pattern based on difficulty
        const pattern = generatePattern(this.difficulty);
        this.sequence = pattern.notes;
        this.currentIndex = 0;

        return { name: pattern.name };
    }

    public getCurrentIndex(): number {
        return this.currentIndex;
    }

    public checkAnswer(input: NoteName[]): DrillResult {
        if (this.sequence.length === 0) return 'incorrect';

        let advanced = false;

        console.log(`[MelodyDrill] Checking answer. Input: ${JSON.stringify(input)}, Current Target: ${this.sequence[this.currentIndex].name}`);

        // Iterate through input notes to handle sequential input (e.g. fast typing or pasting)
        for (const note of input) {
            // If we've finished the sequence, stop processing
            if (this.currentIndex >= this.sequence.length) break;

            const target = this.sequence[this.currentIndex];

            // Check if this note matches the current target
            if (note === target.name) {
                console.log(`[MelodyDrill] Match found: ${note}. Advancing index.`);
                this.currentIndex++;
                advanced = true;

                // If we finished the sequence, we can return correct immediately
                if (this.currentIndex >= this.sequence.length) {
                    this.score++;
                    this.total++;
                    return 'correct';
                }
            } else {
                console.log(`[MelodyDrill] Mismatch: ${note} != ${target.name}. Ignored.`);
            }
        }

        if (advanced) return 'continue';

        if (input.length === 0) return 'continue';
        return 'incorrect';
    }

    public getScore(): string {
        return `${this.score} / ${this.total}`;
    }

    public resetScore() {
        this.score = 0;
        this.total = 0;
    }

    public getVexFlowNotes(baseOctave: number): string[] {
        // Return all notes in the sequence
        return this.sequence.map(n => `${n.name}/${n.octave}`);
    }

    public getPlaybackNotes(baseOctave: number): string[] {
        // Play the whole melody as a preview
        return this.sequence.map(n => `${n.name}${n.octave}`);
    }

    public getLastCorrectNote(): string | null {
        if (this.currentIndex > 0 && this.sequence.length > 0) {
            const note = this.sequence[this.currentIndex - 1];
            return `${note.name}${note.octave}`;
        }
        return null;
    }
}
