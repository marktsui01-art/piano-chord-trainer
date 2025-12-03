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

/**
 * Get the key signature's accidentals for a given key
 * Returns a map of note letters to their accidentals in the key signature
 */
function getKeySignatureAccidentals(keySignature: string): Map<string, string> {
  const accidentals = new Map<string, string>();

  const keyAccidentals: Record<string, string[]> = {
    'C': [], 'Am': [],
    'G': ['F#'], 'Em': ['F#'],
    'D': ['F#', 'C#'], 'Bm': ['F#', 'C#'],
    'A': ['F#', 'C#', 'G#'], 'F#m': ['F#', 'C#', 'G#'],
    'E': ['F#', 'C#', 'G#', 'D#'], 'C#m': ['F#', 'C#', 'G#', 'D#'],
    'B': ['F#', 'C#', 'G#', 'D#', 'A#'], 'G#m': ['F#', 'C#', 'G#', 'D#', 'A#'],
    'F#': ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'], 'D#m': ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'],
    'C#': ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'], 'A#m': ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'],

    'F': ['Bb'], 'Dm': ['Bb'],
    'Bb': ['Bb', 'Eb'], 'Gm': ['Bb', 'Eb'],
    'Eb': ['Bb', 'Eb', 'Ab'], 'Cm': ['Bb', 'Eb', 'Ab'],
    'Ab': ['Bb', 'Eb', 'Ab', 'Db'], 'Fm': ['Bb', 'Eb', 'Ab', 'Db'],
    'Db': ['Bb', 'Eb', 'Ab', 'Db', 'Gb'], 'Bbm': ['Bb', 'Eb', 'Ab', 'Db', 'Gb'],
    'Gb': ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'], 'Ebm': ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'],
    'Cb': ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'], 'Abm': ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'],
  };

  const sig = keyAccidentals[keySignature] || [];

  for (const noteWithAccidental of sig) {
    const letter = noteWithAccidental[0];
    const accidental = noteWithAccidental.substring(1); // '#' or 'b'
    accidentals.set(letter, accidental);
  }

  return accidentals;
}

/**
 * Determine what accidental (if any) should be displayed for a note
 * @param noteName - The note name (e.g., "D", "Db", "D#")
 * @param keySignature - The key signature (e.g., "Ebm")
 * @returns The accidental to display ('n' for natural, '#', 'b', or null if none needed)
 */
function getRequiredAccidental(noteName: string, keySignature?: string): string | null {
  if (!keySignature) {
    // No key signature - show accidentals as written
    if (noteName.includes('#')) return '#';
    if (noteName.includes('b')) return 'b';
    return null;
  }

  const keyAccidentals = getKeySignatureAccidentals(keySignature);

  // Handle VexFlow format "Note/Octave" (e.g. "D/4", "Eb/5")
  const parts = noteName.split('/');
  const noteOnly = parts[0]; // "D", "Eb", "F#"

  const noteLetter = noteOnly[0];
  const noteAccidental = noteOnly.length > 1 ? noteOnly.substring(1) : '';

  const keyImpliedAccidental = keyAccidentals.get(noteLetter) || '';

  // If the note's accidental differs from what the key signature implies, show it
  if (noteAccidental !== keyImpliedAccidental) {
    if (noteAccidental === '') return 'n'; // Natural sign needed
    if (noteAccidental === '#') return '#';
    if (noteAccidental === 'b') return 'b';
  }

  return null; // No accidental needed
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

        // Add accidental if needed (including naturals!)
        const accidental = getRequiredAccidental(note, keySignature);
        if (accidental) {
          staveNote.addModifier(new VF.Accidental(accidental), 0);
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

      // Add accidentals for each note in the chord (including naturals!)
      notes.forEach((note, index) => {
        const accidental = getRequiredAccidental(note, keySignature);
        if (accidental) {
          staveNote.addModifier(new VF.Accidental(accidental), index);
        }
      });

      staveNotes = [staveNote];
      numBeats = 4;
    }

    const voice = new VF.Voice({ num_beats: numBeats, beat_value: 4 });
    voice.addTickables(staveNotes);

    new VF.Formatter().joinVoices([voice]).format([voice], width - 50);
    voice.draw(this.context, stave);
  }
}
