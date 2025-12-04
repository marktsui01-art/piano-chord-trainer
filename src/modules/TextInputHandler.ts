import { NoteName } from './content';

export type TextSubmitCallback = (notes: NoteName[]) => void;

export class TextInputHandler {
    private buffer: string = '';
    private timer: any = null;
    private readonly delay: number;
    private onSubmit: TextSubmitCallback;

    constructor(onSubmit: TextSubmitCallback, delay: number = 300) {
        this.onSubmit = onSubmit;
        this.delay = delay;
    }

    public handleInput(char: string) {
        // Stop any pending timer
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        // If char is space, flush immediately
        if (char === ' ') {
            this.flush();
            return;
        }

        this.buffer += char;

        // Check if buffer is a complete note that cannot be extended
        // e.g. "Eb", "C#", "F#"
        const lastChar = this.buffer.slice(-1);
        if (lastChar === '#' || lastChar === 'b') {
            this.flush();
            return;
        }

        // Set timer to flush after delay
        this.timer = setTimeout(() => {
            this.flush();
        }, this.delay);
    }

    public flush() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        if (this.buffer.length === 0) return;

        const currentBuffer = this.buffer;
        this.buffer = ''; // Reset buffer immediately

        const cleanText = currentBuffer.toUpperCase();
        // Regex matches A-G followed optionally by # or b (case insensitive)
        const matches = cleanText.match(/[A-G][#b]?/gi);

        if (matches) {
            const notes: NoteName[] = [];
            matches.forEach(m => {
                 // Normalize case: "Eb"
                let note = m.charAt(0).toUpperCase();
                if (m.length > 1) {
                    const accidental = m.charAt(1).toLowerCase();
                    if (accidental === 'b') note += 'b';
                    if (accidental === '#') note += '#';
                }
                notes.push(note as NoteName);
            });

            if (notes.length > 0) {
                this.onSubmit(notes);
            }
        }
    }
}
