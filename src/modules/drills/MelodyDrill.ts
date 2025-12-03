import { NoteName } from '../content';
import { DrillStrategy, DrillQuestion, DrillResult } from './DrillStrategy';
import { generatePattern, Difficulty } from './patterns';
import { KeyMode, getKeyById, areNotesEnharmonic } from '../keys';

export class MelodyDrill implements DrillStrategy {
    public readonly isSequential = true;
    private sequence: { name: NoteName, octave: number }[] = [];
    private currentIndex: number = 0;

    // Default context
    private currentKeyId: string = 'C';
    private currentMode: KeyMode = 'Major';

    private score: number = 0;
    private total: number = 0;

    public setKeyContext(keyId: string, mode: KeyMode) {
        this.currentKeyId = keyId;
        this.currentMode = mode;
    }

    private getDifficulty(): Difficulty {
        // Map key difficulty to pattern difficulty?
        // Or just random for now as before?
        // The user asked for "longer sequences up to 16 notes".
        // Let's use the key difficulty to influence it slightly, or just random
        // Actually, let's pick based on random for variety
        const r = Math.random();
        if (r < 0.33) return 'beginner';
        if (r < 0.66) return 'intermediate';
        return 'advanced';
    }

    public getQuestion(): DrillQuestion {
        // Generate pattern based on current key context and random difficulty
        const pattern = generatePattern(this.currentKeyId, this.currentMode, this.getDifficulty());
        this.sequence = pattern.notes;
        this.currentIndex = 0;

        // Improve name display
        const key = getKeyById(this.currentKeyId);
        const displayName = key ? `${pattern.name} (${key.root} ${key.type})` : pattern.name;

        return { name: displayName };
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

            // Check if this note matches the current target (using enharmonic check)
            if (areNotesEnharmonic(note, target.name)) {
                console.log(`[MelodyDrill] Match found: ${note} (Target: ${target.name}). Advancing index.`);
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

    public getVexFlowNotes(_baseOctave: number): string[] {
        // Return all notes in the sequence
        return this.sequence.map(n => `${n.name}/${n.octave}`);
    }

    public getPlaybackNotes(_baseOctave: number): string[] {
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
