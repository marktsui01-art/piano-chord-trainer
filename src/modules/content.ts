export type NoteName =
  | 'C'
  | 'C#'
  | 'Db'
  | 'D'
  | 'D#'
  | 'Eb'
  | 'E'
  | 'F'
  | 'F#'
  | 'Gb'
  | 'G'
  | 'G#'
  | 'Ab'
  | 'A'
  | 'A#'
  | 'Bb'
  | 'B'
  | 'Cb'
  | 'B#'
  | 'E#'
  | 'Fb';

export interface Note {
  name: NoteName;
  octave: number;
}

export interface Chord {
  name: string;
  root: NoteName;
  quality:
  | 'Major'
  | 'Minor'
  | 'Diminished'
  | 'Augmented'
  | 'Major7'
  | 'Minor7'
  | 'Dominant7'
  | 'HalfDiminished7';
  notes: NoteName[]; // Root position notes (no octave)
}

export const C_MAJOR_TRIADS: Chord[] = [
  { name: 'C Major', root: 'C', quality: 'Major', notes: ['C', 'E', 'G'] },
  { name: 'D Minor', root: 'D', quality: 'Minor', notes: ['D', 'F', 'A'] },
  { name: 'E Minor', root: 'E', quality: 'Minor', notes: ['E', 'G', 'B'] },
  { name: 'F Major', root: 'F', quality: 'Major', notes: ['F', 'A', 'C'] },
  { name: 'G Major', root: 'G', quality: 'Major', notes: ['G', 'B', 'D'] },
  { name: 'A Minor', root: 'A', quality: 'Minor', notes: ['A', 'C', 'E'] },
  { name: 'B Diminished', root: 'B', quality: 'Diminished', notes: ['B', 'D', 'F'] },
];

export const C_MAJOR_SEVENTHS: Chord[] = [
  { name: 'C Major 7', root: 'C', quality: 'Major7', notes: ['C', 'E', 'G', 'B'] },
  { name: 'D Minor 7', root: 'D', quality: 'Minor7', notes: ['D', 'F', 'A', 'C'] },
  { name: 'E Minor 7', root: 'E', quality: 'Minor7', notes: ['E', 'G', 'B', 'D'] },
  { name: 'F Major 7', root: 'F', quality: 'Major7', notes: ['F', 'A', 'C', 'E'] },
  { name: 'G Dominant 7', root: 'G', quality: 'Dominant7', notes: ['G', 'B', 'D', 'F'] },
  { name: 'A Minor 7', root: 'A', quality: 'Minor7', notes: ['A', 'C', 'E', 'G'] },
  {
    name: 'B Half-Diminished 7',
    root: 'B',
    quality: 'HalfDiminished7',
    notes: ['B', 'D', 'F', 'A'],
  },
];
