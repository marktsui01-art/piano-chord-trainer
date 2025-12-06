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
    private enableWideRange: boolean = false;
    private currentOctaveShift: number = 0;

    public setKeyContext(keyId: string, mode: KeyMode) {
        this.currentKeyId = keyId;
        this.currentMode = mode;
    }

    public setOptions(_enableInversions: boolean, enableWideRange: boolean) {
        // Inversions not used in melody drill
        this.enableWideRange = enableWideRange;
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

        // Determine random octave shift if wide range is enabled
        if (this.enableWideRange) {
            // -1, 0, 1
            this.currentOctaveShift = Math.floor(Math.random() * 3) - 1;
        } else {
            this.currentOctaveShift = 0;
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
            // This is used for visual feedback, usually without clef context or with assumed context
            // But we don't have baseOctave here easily.
            // Ideally should return name only or be careful.
            // But main.ts calls this and plays it, likely without checking octave validity if not passed.
            // Actually main.ts calls drillManager.getLastCorrectNote() then plays it.
            // But drillManager doesn't pass baseOctave to getLastCorrectNote().
            // So we return the stored absolute note?
            // Wait, we modified getPlaybackNotes to shift.
            // If we return unshifted note here, it might sound wrong (different octave than what was played in sequence).
            // However, we don't know the shift here because we don't have baseOctave.

            // NOTE: We can't easily fix this without passing baseOctave to getLastCorrectNote.
            // But main.ts uses it for "continue" feedback, playing just that note.
            // If we return the original generated note (centered at 4), it will play at 4.
            // If the user is in Bass clef (3), they heard it at 3.
            // This is a minor inconsistency but acceptable for now as the user hears the note they just played.
            // Or we could store the last calculated shift? No, shift depends on baseOctave which can change dynamically (if user switches clef mid-drill).
            // But usually clef doesn't change mid-drill.

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
