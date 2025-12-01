import Vex from 'vexflow';

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
    const width = Math.max(300, notes.length * 50 + 150);
    this.renderer.resize(width, 200);
    this.context = this.renderer.getContext();

    const stave = new VF.Stave(10, 40, width - 20);
    stave.addClef(clef);

    if (keySignature) {
        stave.addKeySignature(keySignature);
    }

    stave.setContext(this.context).draw();

    if (notes.length === 0) return;

    // Helper to check if a note is in the key signature
    // This is tricky because VexFlow expects us to manage accidentals manually for StaveNotes,
    // even if a Key Signature is present, *unless* we use the KeyManager (complex)
    // OR we just manually check against the key spec.
    // However, the standard VexFlow behavior is:
    // If you add an Accidental modifier, it shows it.
    // If you DON'T add an Accidental modifier, it doesn't show it.
    // So, if we have a Key of G (F#), and the note is F#, we just pass "F#/4" to StaveNote
    // and DO NOT add an accidental modifier. VexFlow will render the note head on the F line/space
    // and the musician implies it's sharp because of the key sig.
    //
    // BUT: If the note is F (natural) in Key of G, we DO need a natural sign.
    // AND: If the note is F# in Key of C, we DO need a sharp sign.

    // SIMPLIFICATION:
    // The requirement is "Strictly Diatonic".
    // This means all notes passed in *should* match the key signature perfectly.
    // Therefore, we should NEVER need to add accidental modifiers for these drills.
    // We just need to make sure we don't accidentally add them based on the string name (e.g. 'F#').

    // Convert notes to VexFlow StaveNotes
    let staveNotes;
    let numBeats = 4;

    if (sequential) {
      staveNotes = notes.map((note, index) => {
        // Note string format: "C#/4" or "C/4"
        // VexFlow StaveNote keys argument expects "c/4", "c#/4", etc.

        // We strip the accidental from the key prop passed to StaveNote if we want to rely on Key Signature?
        // No, VexFlow StaveNote needs to know the pitch class. "f#" means it sits on the F line/space.
        // It does NOT automatically render the sharp symbol unless you addModifier.
        // So "f#/4" without modifier = Note head on F line.
        // If Key Sig has F#, then it is read as F#. Correct.

        const staveNote = new VF.StaveNote({ clef: clef, keys: [note], duration: 'q' });

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
      const staveNote = new VF.StaveNote({ clef: clef, keys: notes, duration: 'w' });

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
