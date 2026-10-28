import { mod12, pcOf, spellAbove, type SpelledNote } from './notes';
import { STANDARD_TUNING, openMidi, type FretPosition, type Tuning } from './fretboard';
import { INTERVALS } from './intervals';

/** Um grau da escala: número do grau (1–7) e distância em semitons da tônica. */
export interface ScaleDegree {
  degree: number;
  semitones: number;
}

export interface ScaleDef {
  id: string;
  name: string;
  degrees: ScaleDegree[];
}

const d = (degree: number, semitones: number): ScaleDegree => ({ degree, semitones });

export const SCALES: Record<string, ScaleDef> = {
  major: {
    id: 'major', name: 'Maior (jônia)',
    degrees: [d(1, 0), d(2, 2), d(3, 4), d(4, 5), d(5, 7), d(6, 9), d(7, 11)],
  },
  naturalMinor: {
    id: 'naturalMinor', name: 'Menor natural (eólia)',
    degrees: [d(1, 0), d(2, 2), d(3, 3), d(4, 5), d(5, 7), d(6, 8), d(7, 10)],
  },
  minorPentatonic: {
    id: 'minorPentatonic', name: 'Pentatônica menor',
    degrees: [d(1, 0), d(3, 3), d(4, 5), d(5, 7), d(7, 10)],
  },
  majorPentatonic: {
    id: 'majorPentatonic', name: 'Pentatônica maior',
    degrees: [d(1, 0), d(2, 2), d(3, 4), d(5, 7), d(6, 9)],
  },
  blues: {
    id: 'blues', name: 'Blues (pentatônica menor + b5)',
    degrees: [d(1, 0), d(3, 3), d(4, 5), d(5, 6), d(5, 7), d(7, 10)],
  },
};

export interface ScaleNote {
  note: SpelledNote;
  pc: number;
  degree: number;
  semitones: number;
  /** Rótulo do intervalo em relação à tônica (1, b3, 5…). */
  label: string;
}

export function scaleNotes(root: SpelledNote, scale: ScaleDef): ScaleNote[] {
  return scale.degrees.map((deg) => {
    const note = spellAbove(root, deg.degree, deg.semitones);
    return { note, pc: pcOf(note), degree: deg.degree, semitones: deg.semitones, label: INTERVALS[deg.semitones].short };
  });
}

export function scalePcs(rootPc: number, scale: ScaleDef): number[] {
  return scale.degrees.map((deg) => mod12(rootPc + deg.semitones));
}

/** Grafia convencional da tônica de cada tonalidade. */
const MAJOR_KEY_ROOTS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const MINOR_KEY_ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];

export function conventionalRoot(pc: number, quality: 'major' | 'minor'): SpelledNote {
  const name = (quality === 'major' ? MAJOR_KEY_ROOTS : MINOR_KEY_ROOTS)[mod12(pc)];
  return { letter: name[0] as SpelledNote['letter'], acc: name[1] === '#' ? 1 : name[1] === 'b' ? -1 : 0 };
}

export interface BoxNote extends FretPosition {
  label: string;
  isRoot: boolean;
}

/**
 * Desenhos ("boxes") de pentatônica no sistema de 2 notas por corda.
 *
 * Método: começa num grau da escala na 6ª corda e sobe pelas alturas da escala,
 * colocando duas notas em cada corda. Como as casas são calculadas pela altura
 * real de cada corda, o deslocamento entre as cordas Sol e Si sai correto
 * automaticamente — nada é desenhado à mão.
 *
 * `box` = 1..5. O box 1 da pentatônica menor começa na tônica; o box 1 da
 * pentatônica maior começa no 6º grau (mesmo desenho da relativa menor).
 */
export function pentatonicBox(rootPc: number, scaleId: 'minorPentatonic' | 'majorPentatonic', box: number, tuning: Tuning = STANDARD_TUNING): BoxNote[] {
  if (box < 1 || box > 5) throw new Error('Box deve ser de 1 a 5.');
  const scale = SCALES[scaleId];
  const offsets = scale.degrees.map((x) => x.semitones);
  // Para a pentatônica maior, o box 1 começa no 6º grau (índice 4).
  const startIdx = (scaleId === 'majorPentatonic' ? 4 + (box - 1) : box - 1) % 5;
  const low = openMidi(tuning.strings.length, tuning);
  const startPc = mod12(rootPc + offsets[startIdx]);
  // Os boxes seguem em ordem ao longo do braço a partir do box 1;
  // se passariam da casa 12, voltam uma oitava (mesmo desenho, mais grave).
  const firstIdx = scaleId === 'majorPentatonic' ? 4 : 0;
  const box1Fret = mod12(mod12(rootPc + offsets[firstIdx]) - low);
  let startFret = mod12(startPc - low);
  if (startFret < box1Fret && startFret + 12 <= 12) startFret += 12;
  const notes: BoxNote[] = [];
  let idx = startIdx;
  let midi = low + startFret;
  const n = tuning.strings.length;
  for (let s = n; s >= 1; s--) {
    const open = openMidi(s, tuning);
    for (let k = 0; k < 2; k++) {
      const fret = midi - open;
      const semis = offsets[idx];
      notes.push({ string: s, fret, midi, pc: mod12(midi), label: INTERVALS[semis].short, isRoot: semis === 0 });
      const nextIdx = (idx + 1) % 5;
      const step = mod12(offsets[nextIdx] - offsets[idx]);
      midi += step;
      idx = nextIdx;
    }
  }
  // Se alguma casa ficou negativa (pode acontecer com a corda Si), sobe uma oitava inteira.
  if (notes.some((x) => x.fret < 0)) return notes.map((x) => ({ ...x, fret: x.fret + 12, midi: x.midi + 12 }));
  return notes;
}
