import { NoteName } from './content';
import { getContextualSpelling, KeyMode } from './keys';

export type NoteToggleCallback = (note: NoteName, active: boolean) => void;

export class VirtualPiano {
    private container: HTMLElement | null = null;
    private onNoteToggled: NoteToggleCallback;
    private activeNotes: Set<NoteName> = new Set();
    private interactionMode: 'toggle' | 'trigger' = 'toggle';

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

    /**
     * Set interaction mode: 'toggle' (default) or 'trigger'
     */
    public setInteractionType(type: 'toggle' | 'trigger') {
        this.interactionMode = type;
        this.clear(); // Clear state when switching modes
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

        if (this.interactionMode === 'toggle') {
            // Toggle logic (Original)
            const isActive = this.activeNotes.has(contextualNote);
            if (isActive) {
                this.activeNotes.delete(contextualNote);
            } else {
                this.activeNotes.add(contextualNote);
            }
            this.updateKeyVisuals(physicalNote);
            this.onNoteToggled(contextualNote, !isActive);
        } else {
            // Trigger logic (New)
            // Trigger "Note On" (True)
            // Note: We don't modify activeNotes here because we don't want it to stick visually as 'active' (green toggle).
            // Instead, we rely on the drill logic to call flashKey() for feedback.
            // Or, if we want instantaneous local feedback, we could flash it temporarily?
            // The requirement says "Light up, be verified and then fade away".
            // Verification happens in the callback.

            this.onNoteToggled(contextualNote, true);
            // Immediately send false to indicate "key release" logic for the purpose of the engine?
            // But the drill engine handles "one at a time".
            // If we send true, the drill checks it.
            // If we don't send false, the input manager might think it's still held?
            // But input manager for virtual piano just calls toggleNote.
            // Let's assume onNoteToggled handles it.
        }
    }

    private updateKeyVisuals(note: NoteName) {
        if (!this.container) return;

        const canonicalNote = this.getCanonicalNote(note);
        const keys = this.container.querySelectorAll(`[data-note="${canonicalNote}"]`);

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

    /**
     * Temporarily flashes a key with a specific style (correct/incorrect)
     */
    public flashKey(note: NoteName, type: 'correct' | 'incorrect', duration: number = 300) {
        if (!this.container) return;

        const canonicalNote = this.getCanonicalNote(note);
        const keys = this.container.querySelectorAll(`[data-note="${canonicalNote}"]`);

        keys.forEach(k => {
            // Remove conflicts
            k.classList.remove('active', 'correct', 'incorrect');

            // Add flash class
            k.classList.add(type);

            // Remove after duration
            setTimeout(() => {
                k.classList.remove(type);
            }, duration);
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

        return note;
    }
}
