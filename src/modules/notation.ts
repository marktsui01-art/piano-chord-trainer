import Vex from 'vexflow';

export class NotationRenderer {
  private divId: string;
  private renderer: any = null;
  private context: any = null;

  constructor(divId: string) {
    this.divId = divId;
  }

  public render(notes: string[], clef: 'treble' | 'bass' = 'treble', sequential: boolean = false, currentNoteIndex?: number) {
    const div = document.getElementById(this.divId) as HTMLDivElement;
    if (!div) return;

    div.innerHTML = ''; // Clear previous

    const VF = Vex.Flow;
    this.renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    this.renderer.resize(Math.max(300, notes.length * 50 + 100), 200); // Resize based on length
    this.context = this.renderer.getContext();

    const stave = new VF.Stave(10, 40, Math.max(250, notes.length * 50));
    stave.addClef(clef);
    stave.setContext(this.context).draw();

    if (notes.length === 0) return;

    // Convert notes to VexFlow StaveNotes
    let staveNotes;
    let numBeats = 4;

    if (sequential) {
      staveNotes = notes.map((note, index) => {
        const staveNote = new VF.StaveNote({ clef: clef, keys: [note], duration: 'q' });

        // Add accidentals if needed
        if (note.includes('#')) {
          staveNote.addModifier(new VF.Accidental('#'), 0);
        } else if (note.includes('b')) {
          staveNote.addModifier(new VF.Accidental('b'), 0);
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

      // Add accidentals for chords
      notes.forEach((note, index) => {
        if (note.includes('#')) {
          staveNote.addModifier(new VF.Accidental('#'), index);
        } else if (note.includes('b')) {
          staveNote.addModifier(new VF.Accidental('b'), index);
        }
      });

      staveNotes = [staveNote];
      numBeats = 4;
    }

    const voice = new VF.Voice({ num_beats: numBeats, beat_value: 4 });
    voice.addTickables(staveNotes);

    new VF.Formatter().joinVoices([voice]).format([voice], 200);
    voice.draw(this.context, stave);
  }
}
