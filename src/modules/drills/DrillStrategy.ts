import { NoteName } from '../content';

export type DrillResult = 'correct' | 'incorrect' | 'continue';

export interface DrillQuestion {
    name: string;
}

export interface DrillStrategy {
    readonly isSequential: boolean;
    getQuestion(): DrillQuestion;
    checkAnswer(input: NoteName[]): DrillResult;
    getScore(): string;
    resetScore(): void;

    /**
     * Returns notes formatted for VexFlow (e.g. "C/4")
     */
    getVexFlowNotes(baseOctave: number): string[];

    /**
     * Returns notes formatted for Tone.js (e.g. "C4")
     */
    getPlaybackNotes(baseOctave: number): string[];
    getLastCorrectNote?(): string | null;
}
