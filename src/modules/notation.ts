import Vex from 'vexflow';

// Helper to handle enharmonic spellings (internal note -> VexFlow key)
// e.g. In Eb Minor, 'B' (from internal array) should be rendered as 'Cb'
// In F# Major, 'F' should be 'E#'
function getVexFlowKey(noteString: string, keySignature?: string): string {
    if (!keySignature) return noteString;

    // Split note and octave (e.g. "B/4")
    const parts = noteString.split('/');
    if (parts.length !== 2) return noteString;

    let noteName = parts[0]; // "B", "F#", "Bb"
    const octave = parseInt(parts[1]);

    // Map based on Key Signature
    // Ebm: Key Signature has 6 flats (Bb, Eb, Ab, Db, Gb, Cb)
    // Internal notes use B instead of Cb
    if (keySignature === 'Ebm' || keySignature === 'Gb' || keySignature === 'Cb') {
        if (noteName === 'B') {
            return `cb/${octave}`; // Cb is enharmonically B, but visual is C
        }
    }

    // F# Major: Key Signature has 6 sharps (F#, C#, G#, D#, A#, E#)
    // Internal notes use F instead of E#
    // C# Major: 7 sharps (F#, C#, G#, D#, A#, E#, B#)
    // Internal notes use C instead of B#
    if (keySignature === 'F#' || keySignature === 'C#') {
        if (noteName === 'F') {
            return `e#/${octave}`;
        }
        if (keySignature === 'C#' && noteName === 'C') {
             return `b#/${octave - 1}`; // B# is C. But wait, B#3 is C4? Yes. C4 -> B#3.
             // This octave shift is tricky.
             // If internal is C4. B#3 is the same pitch.
             // If we just say "b#/4", that is a higher B#.
             // Correct logic: C4 (MIDI 60) = B#3.
        }
    }

    // Default: Return original
    return noteString;
}

export class NotationRenderer {
  private divId: string;
  private renderer: any = null;
  private context: any = null;

  constructor(divId: string) {
    this.divId = divId;
  }

  public render(
      notes: string[],
      clef: 'treble' | 'bass' = 'treble',
      sequential: boolean = false,
      currentNoteIndex?: number,
      keySignature?: string // e.g. 'C', 'G', 'F#m'
    ) {
    const div = document.getElementById(this.divId) as HTMLDivElement;
    if (!div) return;

    div.innerHTML = ''; // Clear previous

    const VF = Vex.Flow;
    this.renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

    // Resize based on length, add extra padding for key signature
    // Previous: Math.max(300, notes.length * 50 + 150);
    // Fix: Increase multiplier and base padding to prevent cutoff
    const width = Math.max(400, notes.length * 60 + 200);
    this.renderer.resize(width, 200);
    this.context = this.renderer.getContext();

    const stave = new VF.Stave(10, 40, width - 20);
    stave.addClef(clef);

    if (keySignature) {
        stave.addKeySignature(keySignature);
    }

    stave.setContext(this.context).draw();

    if (notes.length === 0) return;

    // Convert notes to VexFlow StaveNotes
    let staveNotes;
    let numBeats = 4;

    if (sequential) {
      staveNotes = notes.map((note, index) => {
        // Fix Enharmonic Spelling
        const spelledNote = getVexFlowKey(note, keySignature);

        const staveNote = new VF.StaveNote({ clef: clef, keys: [spelledNote], duration: 'q' });

        // Logic for Accidentals:
        // Only add accidentals if NO key signature is provided (legacy mode or C Major explicit)
        // OR if we wanted to support non-diatonic notes (which we don't for now).
        if (!keySignature || keySignature === 'C' || keySignature === 'Am') {
             if (note.includes('#')) {
                staveNote.addModifier(new VF.Accidental('#'), 0);
             } else if (note.includes('b')) {
                staveNote.addModifier(new VF.Accidental('b'), 0);
             }
        }

        // Apply styling based on cursor position
        if (currentNoteIndex !== undefined) {
          if (index < currentNoteIndex) {
            // Completed notes - gray them out
            staveNote.setStyle({ fillStyle: '#999', strokeStyle: '#999' });
          } else if (index === currentNoteIndex) {
            // Current note - highlight in blue
            staveNote.setStyle({ fillStyle: '#2196F3', strokeStyle: '#2196F3' });
          }
          // Future notes keep default black styling
        }

        return staveNote;
      });
      numBeats = notes.length;
    } else {
      // Non-sequential (Chords)
      // Fix enharmonics for chord notes too
      const spelledNotes = notes.map(n => getVexFlowKey(n, keySignature));

      const staveNote = new VF.StaveNote({ clef: clef, keys: spelledNotes, duration: 'w' });

      // Add accidentals for chords only if no key signature
      if (!keySignature || keySignature === 'C' || keySignature === 'Am') {
          notes.forEach((note, index) => {
            if (note.includes('#')) {
              staveNote.addModifier(new VF.Accidental('#'), index);
            } else if (note.includes('b')) {
              staveNote.addModifier(new VF.Accidental('b'), index);
            }
          });
      }

      staveNotes = [staveNote];
      numBeats = 4;
    }

    const voice = new VF.Voice({ num_beats: numBeats, beat_value: 4 });
    voice.addTickables(staveNotes);

    new VF.Formatter().joinVoices([voice]).format([voice], width - 50);
    voice.draw(this.context, stave);
  }
}
