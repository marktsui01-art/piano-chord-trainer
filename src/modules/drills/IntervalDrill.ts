import { DrillStrategy, DrillQuestion, DrillResult } from './DrillStrategy';
import { NoteName } from '../content';
import { KeyMode, getScaleForKey, NOTES_SHARP, isEnharmonicMatch } from '../keys';

const INTERVAL_NAMES = [
    'Perfect Unison',
    'Minor 2nd', 'Major 2nd',
    'Minor 3rd', 'Major 3rd',
    'Perfect 4th',
    'Tritone',
    'Perfect 5th',
    'Minor 6th', 'Major 6th',
    'Minor 7th', 'Major 7th',
    'Perfect Octave'
];

export class IntervalDrill implements DrillStrategy {
    public readonly isSequential = true;

    private currentKeyId: string = 'C';
    private currentMode: KeyMode = 'Major';
    private range: 'default' | 'low' | 'high' | 'wide' = 'default';

    private currentStartNote: NoteName = 'C';
    private currentTargetNote: NoteName = 'G';
    private currentStartOctave: number = 4;
    private currentTargetOctave: number = 4;
    private currentIntervalName: string = '';

    private currentIndex: number = 0;
    private currentOctaveShift: number = 0;

    private score: number = 0;
    private total: number = 0;

    public setKeyContext(keyId: string, mode: KeyMode) {
        this.currentKeyId = keyId;
        this.currentMode = mode;
    }

    public setOptions(_enableInversions: boolean, range: 'default' | 'low' | 'high' | 'wide') {
        this.range = range;
    }

    public getQuestion(): DrillQuestion {
        // Reset state
        this.currentIndex = 0;

        // Determine Octave Shift based on Range
        this.calculateOctaveShift();

        if (this.currentMode === 'Chromatic') {
            this.generateChromaticQuestion();
        } else {
            this.generateDiatonicQuestion();
        }

        return { name: `Interval: ${this.currentIntervalName}` };
    }

    private calculateOctaveShift() {
        switch (this.range) {
            case 'low':
                this.currentOctaveShift = -1;
                break;
            case 'high':
                this.currentOctaveShift = 1;
                break;
            case 'wide':
                // Randomly -1, 0, 1
                const rand = Math.random();
                if (rand < 0.33) this.currentOctaveShift = -1;
                else if (rand < 0.66) this.currentOctaveShift = 0;
                else this.currentOctaveShift = 1;
                break;
            case 'default':
            default:
                this.currentOctaveShift = 0;
                break;
        }
    }

    private generateChromaticQuestion() {
        // Random start note (0-11)
        const startIdx = Math.floor(Math.random() * 12);
        this.currentStartNote = NOTES_SHARP[startIdx];

        // Random interval (1-12 semitones)
        // We avoid Unison (0) for now as it's trivial, but can include if desired.
        // Let's do 1 to 12.
        const intervalSemitones = Math.floor(Math.random() * 12) + 1; // 1 to 12

        const targetIdx = (startIdx + intervalSemitones) % 12;
        this.currentTargetNote = NOTES_SHARP[targetIdx];

        this.currentIntervalName = INTERVAL_NAMES[intervalSemitones];

        // Calculate octaves (relative to base 4)
        this.currentStartOctave = 4 + this.currentOctaveShift;
        this.currentTargetOctave = this.currentStartOctave + (startIdx + intervalSemitones >= 12 ? 1 : 0);
    }

    private generateDiatonicQuestion() {
        const scale = getScaleForKey(this.currentKeyId, this.currentMode);

        // Fallback if scale generation fails
        if (!scale || scale.length === 0) {
            this.currentStartNote = 'C';
            this.currentTargetNote = 'C';
            this.currentIntervalName = 'Error';
            return;
        }

        // Random start index in scale
        const startIdx = Math.floor(Math.random() * scale.length);
        this.currentStartNote = scale[startIdx];

        // Random interval degree (1 to 7 steps) i.e. 2nd to Octave
        // 0 steps = Unison (1st)
        // 1 step = 2nd
        // ...
        // 7 steps = Octave (8th)
        const intervalSteps = Math.floor(Math.random() * 7) + 1; // 1 to 7

        const targetIdx = (startIdx + intervalSteps) % scale.length;
        this.currentTargetNote = scale[targetIdx];

        // Determine interval name
        // We need to calculate semitone distance to get quality (Major/Minor/Perfect)
        const semitoneDist = this.getSemitoneDistance(this.currentStartNote, this.currentTargetNote);
        // Adjust for octave crossing if calculating purely by distance
        // The distance function handles 0-11 wrapping, but we need true interval

        // A simpler way: map steps to generic name "2nd", "3rd", "4th", "5th", "6th", "7th", "Octave"
        // And maybe add quality if we want.
        // Let's rely on semitones for the specific name because "Major 3rd" is more useful than "3rd".

        let actualSemitones = semitoneDist;
        // If start + steps wraps around scale length, it's likely an octave up (or more semitones)
        // Wait, getSemitoneDistance returns 0-11.
        if (intervalSteps === 7) actualSemitones = 12; // Octave

        // Corner case: Tritone in major scale (F to B is 6 semitones).
        // 4th step (index 3 to 6).

        // Let's trust the semitone distance map, except for Octave.
        if (actualSemitones === 0 && intervalSteps > 0) actualSemitones = 12;

        this.currentIntervalName = INTERVAL_NAMES[actualSemitones] || 'Unknown';

        // Calculate octaves
        this.currentStartOctave = 4 + this.currentOctaveShift;
        // Check if we crossed the scale boundary (which usually aligns with octave boundary in C major, but not always)
        // Actually simpler: if target pitch index is lower than start pitch index, we crossed an octave.
        // But we need to use chromatic indices for this check.
        const startChromIdx = this.getNoteIndex(this.currentStartNote);
        const targetChromIdx = this.getNoteIndex(this.currentTargetNote);

        this.currentTargetOctave = this.currentStartOctave + (startChromIdx + actualSemitones >= 12 ? 1 : 0);
        // Alternative check: if (startIdx + intervalSteps >= scale.length) -> usually implies octave crossing?
        // Not necessarily for modes starting on other notes.
        // Let's stick to chromatic logic:
        if (targetChromIdx < startChromIdx && intervalSteps > 0) {
             // Wrapped around 12
             // handled by logic above?
             // targetChromIdx (e.g. 2) < startChromIdx (e.g. 10). Semitones = 4. 10+4 = 14.
             // targetOctave = start + 1. Correct.
        }

        // Special case: Octave (Same note, different octave)
        if (intervalSteps === 7) {
             this.currentTargetOctave = this.currentStartOctave + 1;
        }
    }

    private getNoteIndex(note: string): number {
        // Helper wrapper around standard index finding
        let idx = NOTES_SHARP.indexOf(note as NoteName);
        if (idx === -1) {
            // Try flat equivalent?
            // NoteName type is strict, but let's be safe.
            // We can iterate NOTES_SHARP and check enharmonic
             for (let i = 0; i < 12; i++) {
                 if (isEnharmonicMatch(note, NOTES_SHARP[i])) return i;
             }
        }
        return idx;
    }

    private getSemitoneDistance(n1: string, n2: string): number {
        const i1 = this.getNoteIndex(n1);
        const i2 = this.getNoteIndex(n2);
        if (i1 === -1 || i2 === -1) return 0;
        let diff = i2 - i1;
        if (diff < 0) diff += 12;
        return diff;
    }

    public getVexFlowNotes(baseOctave: number): string[] {
        // Shift relative to the baseOctave provided by renderer
        // The renderer passes a baseOctave (e.g. 4 for Treble, 3 for Bass).
        // Our stored octaves (currentStartOctave) are relative to "standard" 4.
        // If we computed currentStartOctave = 4 (default), and baseOctave is 4, we print 4.
        // If baseOctave is 3 (Low range setting in UI might trigger different clef?),
        // actually DrillManager handles clearing based on range?
        // No, `getVexFlowNotes` argument `baseOctave` is determined by the View/Renderer.

        // Wait, MelodyDrill does: `baseOctave - 4 + this.currentOctaveShift`.
        // My `currentStartOctave` already includes `currentOctaveShift` relative to 4.
        // So I just need to adjust for the `baseOctave` passed in relative to 4.

        const relativeOffset = baseOctave - 4; // e.g. if base is 3, offset is -1.

        // Actually, if the renderer asks for notes for "Bass Clef" (base 3), and my note is C4.
        // I should return C4.
        // The Vexflow renderer likely just draws what I tell it.
        // If I say "C/4", it draws Middle C.

        // Let's verify MelodyDrill again.
        // `return this.sequence.map(n => \`\${n.name}/\${n.octave + shift}\`);`
        // where `shift = baseOctave - 4 + this.currentOctaveShift`.
        // sequence notes have `octave` (usually 4).

        // So if I have C4. baseOctave=4. shift=0. Result C4.
        // If baseOctave=3 (Bass). shift=-1. Result C3.

        // My `currentStartOctave` acts as the absolute octave if base was 4.
        // So I should apply `baseOctave - 4`.

        const shift = baseOctave - 4;

        return [
            `${this.currentStartNote}/${this.currentStartOctave + shift}`,
            `${this.currentTargetNote}/${this.currentTargetOctave + shift}`
        ];
    }

    public getPlaybackNotes(baseOctave: number): string[] {
        const shift = baseOctave - 4;
        return [
            `${this.currentStartNote}${this.currentStartOctave + shift}`,
            `${this.currentTargetNote}${this.currentTargetOctave + shift}`
        ];
    }

    public getLastCorrectNote(baseOctave: number): string | null {
        const shift = baseOctave - 4;

        if (this.currentIndex === 1) {
            // We just correctly played the first note
            return `${this.currentStartNote}${this.currentStartOctave + shift}`;
        }
        if (this.currentIndex === 2) {
             // We just correctly played the second note
             return `${this.currentTargetNote}${this.currentTargetOctave + shift}`;
        }
        return null;
    }

    public checkAnswer(inputNotes: NoteName[]): DrillResult {
        if (inputNotes.length === 0) return null;

        let advanced = false;

        // Check against current target
        let target: string | null = null;
        if (this.currentIndex === 0) target = this.currentStartNote;
        else if (this.currentIndex === 1) target = this.currentTargetNote;

        if (target) {
             for (const note of inputNotes) {
                if (isEnharmonicMatch(note, target)) {
                    this.currentIndex++;
                    advanced = true;
                    break; // Advance one step per check
                }
            }
        }

        if (this.currentIndex >= 2) {
            this.score++;
            this.total++;
            return 'correct';
        }

        if (advanced) {
            return 'continue';
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
}
