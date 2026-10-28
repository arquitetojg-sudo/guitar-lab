import { mod12 } from './notes';

export interface IntervalInfo {
  semitones: number;
  /** Rótulo curto em graus: 1, b3, 5… */
  short: string;
  /** Nome em português. */
  name: string;
  /** Grau (número do intervalo simples, 1–7). */
  degree: number;
}

/** Intervalos simples, indexados por semitons (0–11). */
export const INTERVALS: IntervalInfo[] = [
  { semitones: 0, short: '1', name: 'Uníssono / Oitava', degree: 1 },
  { semitones: 1, short: 'b2', name: 'Segunda menor', degree: 2 },
  { semitones: 2, short: '2', name: 'Segunda maior', degree: 2 },
  { semitones: 3, short: 'b3', name: 'Terça menor', degree: 3 },
  { semitones: 4, short: '3', name: 'Terça maior', degree: 3 },
  { semitones: 5, short: '4', name: 'Quarta justa', degree: 4 },
  { semitones: 6, short: 'b5', name: 'Trítono (quinta diminuta)', degree: 5 },
  { semitones: 7, short: '5', name: 'Quinta justa', degree: 5 },
  { semitones: 8, short: 'b6', name: 'Sexta menor', degree: 6 },
  { semitones: 9, short: '6', name: 'Sexta maior', degree: 6 },
  { semitones: 10, short: 'b7', name: 'Sétima menor', degree: 7 },
  { semitones: 11, short: '7', name: 'Sétima maior', degree: 7 },
];

/** Intervalo ascendente (simples) da classe `from` até a classe `to`. */
export function intervalBetweenPcs(from: number, to: number): IntervalInfo {
  return INTERVALS[mod12(to - from)];
}

/** Nome de um intervalo entre duas alturas absolutas (inclui compostos). */
export function describeMidiInterval(lowMidi: number, highMidi: number): string {
  const diff = highMidi - lowMidi;
  if (diff === 0) return 'Uníssono';
  const abs = Math.abs(diff);
  const octaves = Math.floor(abs / 12);
  const simple = abs % 12;
  if (simple === 0) return octaves === 1 ? 'Oitava' : `${octaves} oitavas`;
  const base = INTERVALS[simple].name;
  return octaves > 0 ? `${base} + ${octaves} oitava${octaves > 1 ? 's' : ''}` : base;
}

/** Tons e semitons: 1 tom = 2 semitons = 2 casas. */
export function describeDistance(semitones: number): string {
  const s = Math.abs(semitones);
  const tons = Math.floor(s / 2);
  const half = s % 2;
  if (s === 0) return 'mesma nota';
  if (tons === 0) return '1 semitom';
  return `${tons} ${tons > 1 ? 'tons' : 'tom'}${half ? ' e 1 semitom' : ''}`;
}
