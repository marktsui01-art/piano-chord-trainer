import { NoteName } from '../content';
import { DrillStrategy, DrillQuestion, DrillResult } from './DrillStrategy';

interface Interval {
    name: string;
    semitones: number;
}

const INTERVALS: Interval[] = [
    { name: 'Minor 2nd', semitones: 1 },
    { name: 'Major 2nd', semitones: 2 },
    { name: 'Minor 3rd', semitones: 3 },
    { name: 'Major 3rd', semitones: 4 },
    { name: 'Perfect 4th', semitones: 5 },
    { name: 'Tritone', semitones: 6 },
    { name: 'Perfect 5th', semitones: 7 },
    { name: 'Minor 6th', semitones: 8 },
    { name: 'Major 6th', semitones: 9 },
    { name: 'Minor 7th', semitones: 10 },
    { name: 'Major 7th', semitones: 11 },
    { name: 'Octave', semitones: 12 }
];

const CHROMATIC_SCALE: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export class IntervalDrill implements DrillStrategy {
    public readonly isSequential = false;
    private currentRoot: { name: NoteName, octave: number } | null = null;
    private currentInterval: Interval | null = null;
    private targetNote: { name: NoteName, octave: number } | null = null;

    private score: number = 0;
    private total: number = 0;

    public getQuestion(): DrillQuestion {
        // Random Root (C3 to C5)
        const rootName = CHROMATIC_SCALE[Math.floor(Math.random() * CHROMATIC_SCALE.length)];
        const rootOctave = 3 + Math.floor(Math.random() * 2); // 3 or 4

        // Random Interval
        const interval = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];

        // Calculate Target
        const rootIndex = CHROMATIC_SCALE.indexOf(rootName);
        let targetIndex = rootIndex + interval.semitones;
        let targetOctave = rootOctave + Math.floor(targetIndex / 12);
        targetIndex = targetIndex % 12;
        const targetName = CHROMATIC_SCALE[targetIndex];

        this.currentRoot = { name: rootName, octave: rootOctave };
        this.currentInterval = interval;
        this.targetNote = { name: targetName, octave: targetOctave };

        return { name: `${interval.name} above ${rootName}` };
    }

    public checkAnswer(input: NoteName[]): DrillResult {
        if (!this.targetNote) return 'incorrect';
        // Check if input contains target note
        if (input.includes(this.targetNote.name)) {
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

    public getVexFlowNotes(baseOctave: number): string[] {
        if (!this.currentRoot) return [];
        // Show Root note
        return [`${this.currentRoot.name}/${this.currentRoot.octave}`];
    }

    public getPlaybackNotes(baseOctave: number): string[] {
        if (!this.currentRoot || !this.targetNote) return [];
        // Play Root then Target? Or just Root?
        // Let's play Root so user hears it.
        return [`${this.currentRoot.name}${this.currentRoot.octave}`];
    }
}
