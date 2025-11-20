import { PitchDetector } from 'pitchy';
import { NoteName } from './content';

export class AudioInputManager {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private detector: PitchDetector<Float32Array> | null = null;
    private inputBuffer: Float32Array | null = null;
    private isListening: boolean = false;
    private onNoteDetected: (note: NoteName) => void;

    // Stabilization
    private lastNote: string | null = null;
    private lastNoteTime: number = 0;
    private stableNoteThreshold: number = 100; // ms to hold note
    private minVolumeDecibels: number = -30; // Minimum volume to detect

    constructor(onNoteDetected: (note: NoteName) => void) {
        this.onNoteDetected = onNoteDetected;
    }

    public async start() {
        if (this.isListening) return;

        try {
            this.audioContext = new window.AudioContext();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            source.connect(this.analyser);

            this.detector = PitchDetector.forFloat32Array(this.analyser.fftSize);
            this.inputBuffer = new Float32Array(this.detector.inputLength);

            this.isListening = true;
            this.loop();
        } catch (err) {
            console.error("Error accessing microphone:", err);
            throw err;
        }
    }

    public stop() {
        this.isListening = false;
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    private loop = () => {
        if (!this.isListening || !this.analyser || !this.detector || !this.inputBuffer) return;

        this.analyser.getFloatTimeDomainData(this.inputBuffer as any);
        const [pitch, clarity] = this.detector.findPitch(this.inputBuffer, this.audioContext!.sampleRate);

        // Check volume (RMS)
        let sum = 0;
        for (let i = 0; i < this.inputBuffer.length; i++) {
            sum += this.inputBuffer[i] * this.inputBuffer[i];
        }
        const rms = Math.sqrt(sum / this.inputBuffer.length);
        const db = 20 * Math.log10(rms);

        if (clarity > 0.9 && db > this.minVolumeDecibels) {
            const note = this.frequencyToNote(pitch);
            this.handleDetectedNote(note);
        } else {
            this.lastNote = null; // Reset if silence or unclear
        }

        requestAnimationFrame(this.loop);
    };

    private handleDetectedNote(note: string) {
        const now = Date.now();
        if (note === this.lastNote) {
            if (now - this.lastNoteTime > this.stableNoteThreshold) {
                // Note is stable!
                // We only want to emit the note name (e.g. "C"), not the octave for now
                // But wait, our NoteName type is just the letter (e.g. "C", "F#")
                // So let's strip the octave.
                const noteName = note.slice(0, -1) as NoteName;
                this.onNoteDetected(noteName);

                // Update time so we don't spam, but we keep detecting it
                // Actually, we might want to debounce emitting the SAME note repeatedly
                // For now, let the InputManager handle the "set" logic
            }
        } else {
            this.lastNote = note;
            this.lastNoteTime = now;
        }
    }

    private frequencyToNote(frequency: number): string {
        const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const pitch = 12 * (Math.log(frequency / 440) / Math.log(2)) + 69;
        const noteIndex = Math.round(pitch) % 12;
        const octave = Math.floor(Math.round(pitch) / 12) - 1;
        return noteStrings[noteIndex] + octave;
    }
}
