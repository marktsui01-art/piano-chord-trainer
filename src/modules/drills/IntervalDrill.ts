import { NoteName } from '../content';
import { DrillStrategy, DrillQuestion, DrillResult } from './DrillStrategy';
import { getKeyById, KeyMode } from '../keys';

interface Interval {
    name: string;
    steps: number; // Scale steps (e.g. 2nd = 1 step)
}

const DIATONIC_INTERVALS: Interval[] = [
    { name: '2nd', steps: 1 },
    { name: '3rd', steps: 2 },
    { name: '4th', steps: 3 },
    { name: '5th', steps: 4 },
    { name: '6th', steps: 5 },
    { name: '7th', steps: 6 },
    { name: 'Octave', steps: 7 }
];

export class IntervalDrill implements DrillStrategy {
    public readonly isSequential = false;
    private currentRoot: { name: NoteName, octave: number } | null = null;
    private targetNote: { name: NoteName, octave: number } | null = null;
    private currentKeyId: string = 'C';

    private score: number = 0;
    private total: number = 0;

    public setKeyContext(keyId: string, _mode: KeyMode) {
        this.currentKeyId = keyId;
    }

    public getQuestion(): DrillQuestion {
        const key = getKeyById(this.currentKeyId);
        const scale = key ? key.scale : ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as NoteName[];

        // Random Root from Key Scale (C3 to C5 approx)
        const rootIndex = Math.floor(Math.random() * scale.length);
        const rootName = scale[rootIndex];
        const rootOctave = 3 + Math.floor(Math.random() * 2); // 3 or 4

        // Random Diatonic Interval
        const interval = DIATONIC_INTERVALS[Math.floor(Math.random() * DIATONIC_INTERVALS.length)];

        // Calculate Target
        // We need to walk up the scale 'interval.steps' times
        const targetScaleIndex = rootIndex + interval.steps;
        const targetName = scale[targetScaleIndex % scale.length];

        // Calculate octave wrap
        const octaveShift = Math.floor(targetScaleIndex / scale.length);
        const targetOctave = rootOctave + octaveShift;

        this.currentRoot = { name: rootName, octave: rootOctave };
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

    public getVexFlowNotes(_baseOctave: number): string[] {
        if (!this.currentRoot) return [];
        // Show Root note
        return [`${this.currentRoot.name}/${this.currentRoot.octave}`];
    }

    public getPlaybackNotes(_baseOctave: number): string[] {
        if (!this.currentRoot || !this.targetNote) return [];
        // Play Root so user hears it
        return [`${this.currentRoot.name}${this.currentRoot.octave}`];
    }
}
