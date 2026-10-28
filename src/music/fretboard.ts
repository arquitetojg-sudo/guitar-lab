import { mod12, spellPc, type SpelledNote } from './notes';

export interface Tuning {
  id: string;
  name: string;
  /** Alturas MIDI das cordas soltas, da mais grave (6ª) para a mais aguda (1ª). */
  strings: number[];
}

/** Afinação padrão: E2 A2 D3 G3 B3 E4. */
export const STANDARD_TUNING: Tuning = {
  id: 'standard',
  name: 'Padrão (Mi Lá Ré Sol Si Mi)',
  strings: [40, 45, 50, 55, 59, 64],
};

/** Afinações adicionais podem ser registradas aqui no futuro (Drop D, meio tom abaixo…). */
export const TUNINGS: Tuning[] = [STANDARD_TUNING];

export type Instrument = 'guitarra' | 'violao';

export const INSTRUMENTS: Record<Instrument, { label: string; frets: number }> = {
  guitarra: { label: 'Guitarra elétrica', frets: 22 },
  violao: { label: 'Violão', frets: 19 },
};

export interface FretPosition {
  /** Número da corda no padrão do violonista: 1 = Mi aguda, 6 = Mi grave. */
  string: number;
  fret: number;
  midi: number;
  pc: number;
}

/** Índice no array `tuning.strings` (0 = 6ª corda). */
export function stringIndex(stringNumber: number, tuning: Tuning = STANDARD_TUNING): number {
  const n = tuning.strings.length;
  if (stringNumber < 1 || stringNumber > n) throw new Error(`Corda inválida: ${stringNumber}`);
  return n - stringNumber;
}

export function openMidi(stringNumber: number, tuning: Tuning = STANDARD_TUNING): number {
  return tuning.strings[stringIndex(stringNumber, tuning)];
}

export function midiAt(stringNumber: number, fret: number, tuning: Tuning = STANDARD_TUNING): number {
  if (fret < 0 || !Number.isInteger(fret)) throw new Error(`Casa inválida: ${fret}`);
  return openMidi(stringNumber, tuning) + fret;
}

export function positionAt(stringNumber: number, fret: number, tuning: Tuning = STANDARD_TUNING): FretPosition {
  const midi = midiAt(stringNumber, fret, tuning);
  return { string: stringNumber, fret, midi, pc: mod12(midi) };
}

export function noteAt(stringNumber: number, fret: number, pref: 'sharp' | 'flat' = 'sharp', tuning = STANDARD_TUNING): SpelledNote {
  return spellPc(mod12(midiAt(stringNumber, fret, tuning)), pref);
}

/** Todas as posições do braço, cordas 6→1, casas 0→maxFret. */
export function allPositions(maxFret: number, tuning: Tuning = STANDARD_TUNING, minFret = 0): FretPosition[] {
  const out: FretPosition[] = [];
  const n = tuning.strings.length;
  for (let s = n; s >= 1; s--) {
    for (let f = minFret; f <= maxFret; f++) out.push(positionAt(s, f, tuning));
  }
  return out;
}

/** Posições de uma classe de altura (todas as oitavas). */
export function positionsOfPc(pc: number, maxFret: number, tuning: Tuning = STANDARD_TUNING, minFret = 0): FretPosition[] {
  return allPositions(maxFret, tuning, minFret).filter((p) => p.pc === mod12(pc));
}

/** Casas em que uma classe de altura aparece numa corda. */
export function fretsOfPcOnString(pc: number, stringNumber: number, maxFret: number, tuning: Tuning = STANDARD_TUNING): number[] {
  const open = openMidi(stringNumber, tuning);
  const first = mod12(pc - open);
  const frets: number[] = [];
  for (let f = first; f <= maxFret; f += 12) frets.push(f);
  return frets;
}

/** Posições exatamente na mesma altura (uníssonos em outras cordas). */
export function unisonPositions(pos: FretPosition, maxFret: number, tuning: Tuning = STANDARD_TUNING): FretPosition[] {
  return allPositions(maxFret, tuning).filter((p) => p.midi === pos.midi && p.string !== pos.string);
}

/** Posições uma ou mais oitavas acima/abaixo (mesma classe, altura diferente). */
export function octavePositions(pos: FretPosition, maxFret: number, tuning: Tuning = STANDARD_TUNING): FretPosition[] {
  return allPositions(maxFret, tuning).filter((p) => p.pc === pos.pc && p.midi !== pos.midi);
}

/** Diferença de afinação (em semitons) entre uma corda e a imediatamente mais grave. */
export function stringGap(stringNumber: number, tuning: Tuning = STANDARD_TUNING): number {
  const i = stringIndex(stringNumber, tuning);
  if (i === 0) throw new Error('A corda mais grave não tem corda abaixo.');
  return tuning.strings[i] - tuning.strings[i - 1];
}

/**
 * Deslocamento de casas para encontrar a MESMA altura (ou altura + `octaves`
 * oitavas) numa outra corda. Valor positivo = casa mais alta.
 * Ex.: da 6ª para a 4ª corda, uma oitava acima → +2 casas.
 */
export function fretShift(fromString: number, toString: number, octaves: number, tuning: Tuning = STANDARD_TUNING): number {
  return openMidi(fromString, tuning) + 12 * octaves - openMidi(toString, tuning);
}

export interface OctaveShape {
  id: string;
  name: string;
  fromString: number;
  toString: number;
  /** Casas a deslocar (pode ser negativo). */
  shift: number;
  crossesGB: boolean;
}

/**
 * Formas de oitava (uma oitava acima) entre pares de cordas, calculadas a partir
 * da afinação — não desenhadas à mão. Inclui o ajuste Sol–Si automaticamente.
 */
export function octaveShapes(tuning: Tuning = STANDARD_TUNING): OctaveShape[] {
  const n = tuning.strings.length;
  const shapes: OctaveShape[] = [];
  const gIdx = tuning.strings.length - 3; // corda 3
  for (let from = n; from >= 2; from--) {
    for (const skip of [2, 3]) {
      const to = from - skip;
      if (to < 1) continue;
      const shift = fretShift(from, to, 1, tuning);
      const fromIdx = stringIndex(from, tuning);
      const toIdx = stringIndex(to, tuning);
      const crossesGB = fromIdx <= gIdx && toIdx >= gIdx + 1;
      shapes.push({
        id: `oct-${from}-${to}`,
        name: `${from}ª → ${to}ª corda`,
        fromString: from,
        toString: to,
        shift,
        crossesGB,
      });
    }
  }
  return shapes;
}
