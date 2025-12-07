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
    private range: 'default' | 'low' | 'high' | 'wide' = 'default';
    private currentOctaveShift: number = 0;

    public setKeyContext(keyId: string, mode: KeyMode) {
        this.currentKeyId = keyId;
        this.currentMode = mode;
    }

    public setOptions(_enableInversions: boolean, range: 'default' | 'low' | 'high' | 'wide') {
        // Inversions not used in melody drill
        this.range = range;
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

        // Determine octave shift based on range setting
        switch (this.range) {
            case 'low':
                this.currentOctaveShift = -1;
                break;
            case 'high':
                this.currentOctaveShift = 1;
                break;
            case 'wide':
                // Randomly -1, 0, 1
                this.currentOctaveShift = Math.floor(Math.random() * 3) - 1;
                break;
            case 'default':
            default:
                this.currentOctaveShift = 0;
                break;
        }

        return { name: pattern.name };
    }

    public getVexFlowNotes(baseOctave: number): string[] {
        // Shift notes to be relative to baseOctave
        // pattern generates notes in Octave 4.
        // If baseOctave is 3 (Bass), we want notes to be lower (Shift -1 from 4).
        // Shift formula: baseOctave - 4 + this.currentOctaveShift

        const shift = baseOctave - 4 + this.currentOctaveShift;
        return this.sequence.map(n => `${n.name}/${n.octave + shift}`);
    }

    public getCurrentIndex(): number {
        return this.currentIndex;
    }

    public getPlaybackNotes(baseOctave: number): string[] {
        // Return full sequence for playback
        const shift = baseOctave - 4 + this.currentOctaveShift;
        return this.sequence.map(n => `${n.name}${n.octave + shift}`);
    }

    public getLastCorrectNote(): string | null {
        if (this.currentIndex > 0) {
            // Note: This returns the absolute generated note (Octave 4-based).
            // Visual feedback might be slightly off in octave if playback is shifted,
            // but the pitch class will be correct.
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
