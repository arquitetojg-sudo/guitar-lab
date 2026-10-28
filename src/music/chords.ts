import { formatNote, mod12, pcOf, spellAbove, type Naming, type SpelledNote } from './notes';
import { INTERVALS } from './intervals';
import { SCALES, scaleNotes, type ScaleDef } from './scales';

export interface ChordTone {
  degree: number;
  semitones: number;
}

export interface ChordQuality {
  id: string;
  name: string;
  /** Sufixo de cifra: '' (maior), 'm', '°', '+', '5', '7M', 'm7', '7', 'm7(b5)' */
  symbol: string;
  tones: ChordTone[];
}

const t = (degree: number, semitones: number): ChordTone => ({ degree, semitones });

export const CHORD_QUALITIES: Record<string, ChordQuality> = {
  major: { id: 'major', name: 'Maior', symbol: '', tones: [t(1, 0), t(3, 4), t(5, 7)] },
  minor: { id: 'minor', name: 'Menor', symbol: 'm', tones: [t(1, 0), t(3, 3), t(5, 7)] },
  dim: { id: 'dim', name: 'Diminuto', symbol: '°', tones: [t(1, 0), t(3, 3), t(5, 6)] },
  aug: { id: 'aug', name: 'Aumentado', symbol: '+', tones: [t(1, 0), t(3, 4), t(5, 8)] },
  power: { id: 'power', name: 'Power chord (quinta)', symbol: '5', tones: [t(1, 0), t(5, 7)] },
  maj7: { id: 'maj7', name: 'Maior com sétima maior', symbol: '7M', tones: [t(1, 0), t(3, 4), t(5, 7), t(7, 11)] },
  m7: { id: 'm7', name: 'Menor com sétima', symbol: 'm7', tones: [t(1, 0), t(3, 3), t(5, 7), t(7, 10)] },
  dom7: { id: 'dom7', name: 'Dominante (sétima)', symbol: '7', tones: [t(1, 0), t(3, 4), t(5, 7), t(7, 10)] },
  m7b5: { id: 'm7b5', name: 'Meio-diminuto', symbol: 'm7(b5)', tones: [t(1, 0), t(3, 3), t(5, 6), t(7, 10)] },
};

export interface ChordNote {
  note: SpelledNote;
  pc: number;
  /** Função no acorde: 1, b3, 3, 5, b5, #5, 7, b7 */
  label: string;
}

function toneLabel(tone: ChordTone): string {
  if (tone.degree === 5 && tone.semitones === 8) return '#5';
  return INTERVALS[tone.semitones].short;
}

export function chordNotes(root: SpelledNote, quality: ChordQuality): ChordNote[] {
  return quality.tones.map((tone) => {
    const note = spellAbove(root, tone.degree, tone.semitones);
    return { note, pc: pcOf(note), label: toneLabel(tone) };
  });
}

/** Cifra (padrão no Brasil usa letras: Am, F#m, G7). */
export function chordSymbol(root: SpelledNote, quality: ChordQuality, naming: Naming = 'en'): string {
  return formatNote(root, naming === 'both' ? 'en' : naming) + quality.symbol;
}

/** Identifica a qualidade de um acorde a partir dos semitons acima da fundamental. */
export function identifyQuality(semitones: number[]): ChordQuality | undefined {
  const key = [...new Set(semitones.map(mod12))].sort((a, b) => a - b).join(',');
  return Object.values(CHORD_QUALITIES).find(
    (q) => q.tones.map((x) => x.semitones).sort((a, b) => a - b).join(',') === key,
  );
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

export interface HarmonicFieldChord {
  degree: number;
  roman: string;
  root: SpelledNote;
  quality: ChordQuality;
  notes: ChordNote[];
  /** Função tonal principal: tônica, subdominante ou dominante. */
  fn: 'Tônica' | 'Subdominante' | 'Dominante';
}

function romanFor(degree: number, quality: ChordQuality): string {
  const base = ROMAN[degree - 1];
  const minorish = ['minor', 'dim', 'm7', 'm7b5'].includes(quality.id);
  let r = minorish ? base.toLowerCase() : base;
  if (quality.id === 'dim') r += '°';
  else if (quality.id === 'aug') r += '+';
  else if (quality.symbol && quality.id !== 'major' && quality.id !== 'minor') {
    r += quality.id === 'm7' ? '7' : quality.id === 'm7b5' ? 'ø' : quality.symbol;
  }
  return r;
}

const FUNCTION_MAJOR: HarmonicFieldChord['fn'][] = ['Tônica', 'Subdominante', 'Tônica', 'Subdominante', 'Dominante', 'Tônica', 'Dominante'];
const FUNCTION_MINOR: HarmonicFieldChord['fn'][] = ['Tônica', 'Subdominante', 'Tônica', 'Subdominante', 'Dominante', 'Subdominante', 'Dominante'];

/**
 * Campo harmônico: empilha terças da própria escala sobre cada grau.
 * A qualidade de cada acorde é deduzida dos intervalos resultantes — não é tabelada.
 */
export function harmonicField(root: SpelledNote, mode: 'major' | 'naturalMinor', size: 3 | 4 = 3): HarmonicFieldChord[] {
  const scale: ScaleDef = SCALES[mode];
  const notes = scaleNotes(root, scale);
  return notes.map((n, i) => {
    const stack = [0, 2, 4, 6].slice(0, size).map((k) => notes[(i + k) % 7]);
    const semis = stack.map((s) => mod12(s.pc - n.pc));
    const quality = identifyQuality(semis);
    if (!quality) throw new Error(`Acorde não identificado no grau ${i + 1}`);
    return {
      degree: i + 1,
      roman: romanFor(i + 1, quality),
      root: n.note,
      quality,
      notes: stack.map((s, k) => ({ note: s.note, pc: s.pc, label: toneLabel(quality.tones[k]) })),
      fn: (mode === 'major' ? FUNCTION_MAJOR : FUNCTION_MINOR)[i],
    };
  });
}

/** Transpõe uma sequência de graus (ex.: [1,4,5]) para os acordes de uma tonalidade. */
export function progressionChords(root: SpelledNote, mode: 'major' | 'naturalMinor', degrees: number[], size: 3 | 4 = 3): HarmonicFieldChord[] {
  const field = harmonicField(root, mode, size);
  return degrees.map((deg) => {
    if (deg < 1 || deg > 7) throw new Error(`Grau inválido: ${deg}`);
    return field[deg - 1];
  });
}
