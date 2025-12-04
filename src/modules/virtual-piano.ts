import { NoteName } from './content';
import { getContextualSpelling, KeyMode } from './keys';

export type NoteToggleCallback = (note: NoteName, active: boolean) => void;

export class VirtualPiano {
    private container: HTMLElement | null = null;
    private onNoteToggled: NoteToggleCallback;
    private activeNotes: Set<NoteName> = new Set();

    // Musical context for enharmonic spelling
    private currentRoot: string = 'C';
    private currentMode: KeyMode = 'Major';

    // Define the range of notes to render (1 octave: C4 to B4)
    private readonly notes: { note: NoteName; octave: number; type: 'white' | 'black' }[] = [
        { note: 'C', octave: 4, type: 'white' },
        { note: 'C#', octave: 4, type: 'black' },
        { note: 'D', octave: 4, type: 'white' },
        { note: 'D#', octave: 4, type: 'black' },
        { note: 'E', octave: 4, type: 'white' },
        { note: 'F', octave: 4, type: 'white' },
        { note: 'F#', octave: 4, type: 'black' },
        { note: 'G', octave: 4, type: 'white' },
        { note: 'G#', octave: 4, type: 'black' },
        { note: 'A', octave: 4, type: 'white' },
        { note: 'A#', octave: 4, type: 'black' },
        { note: 'B', octave: 4, type: 'white' },
    ];

    constructor(onNoteToggled: NoteToggleCallback) {
        this.onNoteToggled = onNoteToggled;
    }

    /**
     * Set the current musical context for enharmonic spelling
     */
    public setKeyContext(root: string, mode: KeyMode) {
        this.currentRoot = root;
        this.currentMode = mode;
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

    private handleInteraction(e: Event, physicalNote: NoteName) {
        e.preventDefault(); // Prevent default touch behaviors (scrolling/zooming)

        // Convert the physical piano key to the contextually appropriate spelling
        const contextualNote = getContextualSpelling(physicalNote, this.currentRoot, this.currentMode);

        // Toggle logic using the contextual spelling
        const isActive = this.activeNotes.has(contextualNote);
        if (isActive) {
            this.activeNotes.delete(contextualNote);
        } else {
            this.activeNotes.add(contextualNote);
        }

        this.updateKeyVisuals(physicalNote);
        this.onNoteToggled(contextualNote, !isActive);
    }

    private updateKeyVisuals(note: NoteName) {
        if (!this.container) return;

        // Find the canonical physical note for the given note
        // The notes array defines the canonical physical notes (e.g. 'C#', 'Eb' is not in notes, but 'D#' is)
        // Wait, 'D#' is in notes. 'Eb' is not.
        // We need to map any incoming note to the canonical note used in this.notes
        const canonicalNote = this.getCanonicalNote(note);

        // Since we are showing single octave but accepting notes from any octave,
        // we select all keys matching the note name, regardless of octave.
        const keys = this.container.querySelectorAll(`[data-note="${canonicalNote}"]`);

        // We need to know if the note is active.
        // But `activeNotes` stores contextual spellings (e.g. Cb).
        // `note` passed here is usually the physical note from interaction, OR contextual?
        // In handleInteraction: updateKeyVisuals(physicalNote)
        // physicalNote comes from the DOM element, so it IS the canonical note.

        // But if updateKeyVisuals is called from elsewhere? It is private.
        // It is only called from handleInteraction.

        // However, handleInteraction toggles activeNotes with contextualNote.
        // Then calls updateKeyVisuals with physicalNote.
        // inside updateKeyVisuals, it checks `this.activeNotes.has(note)`.
        // If `note` is physicalNote (e.g. 'B'), but activeNotes has 'Cb', then has('B') is false.
        // So the key does not get 'active' class.

        // We need to check if the canonical note corresponds to any active note.
        const isActive = Array.from(this.activeNotes).some(activeNote =>
            this.getCanonicalNote(activeNote) === canonicalNote
        );

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

        const canonicalNote = this.getCanonicalNote(note);

        const keys = this.container.querySelectorAll(`[data-note="${canonicalNote}"]`);
        keys.forEach(k => {
            k.classList.remove('correct', 'incorrect');
            k.classList.add(type);
        });
    }

    private getCanonicalNote(note: NoteName): NoteName {
        // Map common enharmonics to our canonical sharp-based names
        if (note === 'Cb') return 'B';
        if (note === 'B#') return 'C';
        if (note === 'Fb') return 'E';
        if (note === 'E#') return 'F';

        if (note === 'Db') return 'C#';
        if (note === 'Eb') return 'D#';
        if (note === 'Gb') return 'F#';
        if (note === 'Ab') return 'G#';
        if (note === 'Bb') return 'A#';

        // Add logic to check if it matches existing canonical notes
        // Our canonical notes are sharps (C#, D#, F#, G#, A#)
        // So flats should be converted.

        // Double checks for less common ones if needed, but the above covers 12TET.

        return note;
    }
}
