import { NoteName } from './content';

export type NoteToggleCallback = (note: NoteName, active: boolean) => void;

export class VirtualPiano {
    private container: HTMLElement | null = null;
    private onNoteToggled: NoteToggleCallback;
    private activeNotes: Set<NoteName> = new Set();

    // Define the range of notes to render (approx 1.5 octaves: C3 to G4)
    // We'll use a fixed range for now as per requirements
    private readonly notes: { note: NoteName; octave: number; type: 'white' | 'black' }[] = [
        { note: 'C', octave: 3, type: 'white' },
        { note: 'C#', octave: 3, type: 'black' },
        { note: 'D', octave: 3, type: 'white' },
        { note: 'D#', octave: 3, type: 'black' },
        { note: 'E', octave: 3, type: 'white' },
        { note: 'F', octave: 3, type: 'white' },
        { note: 'F#', octave: 3, type: 'black' },
        { note: 'G', octave: 3, type: 'white' },
        { note: 'G#', octave: 3, type: 'black' },
        { note: 'A', octave: 3, type: 'white' },
        { note: 'A#', octave: 3, type: 'black' },
        { note: 'B', octave: 3, type: 'white' },
        { note: 'C', octave: 4, type: 'white' },
        { note: 'C#', octave: 4, type: 'black' },
        { note: 'D', octave: 4, type: 'white' },
        { note: 'D#', octave: 4, type: 'black' },
        { note: 'E', octave: 4, type: 'white' },
        { note: 'F', octave: 4, type: 'white' },
        { note: 'F#', octave: 4, type: 'black' },
        { note: 'G', octave: 4, type: 'white' },
    ];

    constructor(onNoteToggled: NoteToggleCallback) {
        this.onNoteToggled = onNoteToggled;
    }

    public render(containerId: string) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`VirtualPiano: Container #${containerId} not found.`);
            return;
        }
        this.container = container;
        this.container.innerHTML = '';
        this.container.classList.add('virtual-piano');

        this.notes.forEach((n) => {
            const key = document.createElement('div');
            key.classList.add('piano-key', n.type);
            key.dataset.note = n.note;
            key.dataset.octave = n.octave.toString();

            // Label for C notes to help orientation
            if (n.note === 'C') {
                const label = document.createElement('span');
                label.classList.add('key-label');
                label.textContent = `C${n.octave}`;
                key.appendChild(label);
            }

            key.addEventListener('mousedown', (e) => this.handleInteraction(e, n.note));
            key.addEventListener('touchstart', (e) => this.handleInteraction(e, n.note));

            this.container!.appendChild(key);
        });
    }

    private handleInteraction(e: Event, note: NoteName) {
        e.preventDefault(); // Prevent default touch behaviors (scrolling/zooming)

        // Toggle logic
        const isActive = this.activeNotes.has(note);
        if (isActive) {
            this.activeNotes.delete(note);
        } else {
            this.activeNotes.add(note);
        }

        this.updateKeyVisuals(note);
        this.onNoteToggled(note, !isActive);
    }

    private updateKeyVisuals(note: NoteName) {
        if (!this.container) return;

        // Map enharmonics for visual selection
        let targetNote = note;
        if (note === 'Cb') targetNote = 'B';
        else if (note === 'B#') targetNote = 'C';
        else if (note === 'Fb') targetNote = 'E';
        else if (note === 'E#') targetNote = 'F';

        const keys = this.container.querySelectorAll(`[data-note="${targetNote}"]`);
        const isActive = this.activeNotes.has(note);

        keys.forEach(k => {
            if (isActive) {
                k.classList.add('active');
            } else {
                k.classList.remove('active');
            }
        });
    }

    public clear() {
        this.activeNotes.clear();
        if (this.container) {
            const keys = this.container.querySelectorAll('.piano-key');
            keys.forEach(k => k.classList.remove('active', 'correct', 'incorrect'));
        }
    }

    public highlightNote(note: NoteName, type: 'correct' | 'incorrect') {
        if (!this.container) return;

        let targetNote = note;
        if (note === 'Cb') targetNote = 'B';
        else if (note === 'B#') targetNote = 'C';
        else if (note === 'Fb') targetNote = 'E';
        else if (note === 'E#') targetNote = 'F';

        const keys = this.container.querySelectorAll(`[data-note="${targetNote}"]`);
        keys.forEach(k => {
            k.classList.remove('correct', 'incorrect');
            k.classList.add(type);
        });
    }
}
