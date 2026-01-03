import { NoteName, Chord } from './content';
import { getScaleForKey, KeyMode, getNoteIndex } from './keys';

export type ChordType = 'triads' | 'sevenths';

export function generateDiatonicChords(
  root: string,
  mode: KeyMode,
  type: ChordType = 'triads'
): Chord[] {
  const scale = getScaleForKey(root, mode);
  if (!scale || scale.length === 0) return [];

  const chords: Chord[] = [];

  // Diatonic chords are built on each degree of the scale
  // Triads: 1-3-5
  // Sevenths: 1-3-5-7

  // We need to extend the scale to wrap around for easy indexing
  const extendedScale = [...scale, ...scale];

  for (let i = 0; i < 7; i++) {
    const chordRoot = scale[i];
    const third = extendedScale[i + 2];
    const fifth = extendedScale[i + 4];

    let notes: NoteName[] = [chordRoot, third, fifth];

    if (type === 'sevenths') {
      const seventh = extendedScale[i + 6];
      notes.push(seventh);
    }

    // Determine quality based on intervals
    const getInterval = (n1: string, n2: string): number => {
      const i1 = getNoteIndex(n1);
      const i2 = getNoteIndex(n2);
      if (i1 === -1 || i2 === -1) return 0;
      let diff = i2 - i1;
      if (diff < 0) diff += 12;
      return diff;
    };

    const int3 = getInterval(chordRoot, third);
    const int5 = getInterval(chordRoot, fifth);

    let quality: Chord['quality'] = 'Major';

    if (int3 === 4 && int5 === 7) quality = 'Major';
    else if (int3 === 3 && int5 === 7) quality = 'Minor';
    else if (int3 === 3 && int5 === 6) quality = 'Diminished';
    else if (int3 === 4 && int5 === 8) quality = 'Augmented';

    if (type === 'sevenths') {
      const seventh = extendedScale[i + 6];
      const int7 = getInterval(chordRoot, seventh);

      if (quality === 'Major') {
        if (int7 === 11) quality = 'Major7';
        else if (int7 === 10) quality = 'Dominant7';
      } else if (quality === 'Minor') {
        if (int7 === 10) quality = 'Minor7';
        else if (int7 === 11) quality = 'MinorMajor7';
      } else if (quality === 'Diminished') {
        if (int7 === 10)
          quality = 'HalfDiminished7'; // m7b5
        else if (int7 === 9) quality = 'Diminished7';
      } else if (quality === 'Augmented') {
        if (int7 === 10) quality = 'Augmented7';
        else if (int7 === 11) quality = 'AugmentedMajor7';
      }
    }

    let name = `${chordRoot} ${quality}`;
    // Clean up name for standard triads
    if (quality === 'Major') name = `${chordRoot} Major`;
    if (quality === 'Minor') name = `${chordRoot} Minor`;
    if (quality === 'Diminished') name = `${chordRoot} Diminished`;
    if (quality === 'Augmented') name = `${chordRoot} Augmented`;

    // Fix for "Dominant7" -> "Dominant 7" spacing in UI if needed, or keep as ID
    if (quality === 'Dominant7') name = `${chordRoot} Dominant 7`;
    if (quality === 'Major7') name = `${chordRoot} Major 7`;
    if (quality === 'Minor7') name = `${chordRoot} Minor 7`;
    if (quality === 'HalfDiminished7') name = `${chordRoot} Half-Diminished 7`;
    if (quality === 'Diminished7') name = `${chordRoot} Diminished 7`;

    chords.push({
      name,
      root: chordRoot,
      quality,
      notes,
    });
  }

  return chords;
}
