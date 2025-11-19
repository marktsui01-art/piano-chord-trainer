import { Chord, C_MAJOR_TRIADS, C_MAJOR_SEVENTHS, NoteName } from './content';

export class DrillManager {
    private currentChord: Chord | null = null;
    private score: number = 0;
    private total: number = 0;

    constructor() {
    }

    public getQuestion(): Chord {
        // Randomly select a chord
        const allChords = [...C_MAJOR_TRIADS, ...C_MAJOR_SEVENTHS];
        this.currentChord = allChords[Math.floor(Math.random() * allChords.length)];
        return this.currentChord;
    }

    public checkAnswer(inputNotes: NoteName[]): boolean {
        if (!this.currentChord) return false;

        // Normalize and sort for comparison
        // This is a simplified check (ignoring octaves/inversions for now, checking pitch classes)
        const targetNotes = new Set(this.currentChord.notes);
        const inputSet = new Set(inputNotes);

        if (targetNotes.size !== inputSet.size) return false;

        for (let note of targetNotes) {
            if (!inputSet.has(note)) return false;
        }

        this.score++;
        this.total++;
        return true;
    }

    public getScore(): string {
        return `${this.score} / ${this.total}`;
    }

    public resetScore() {
        this.score = 0;
        this.total = 0;
    }
}
