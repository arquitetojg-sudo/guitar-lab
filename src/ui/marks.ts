import {
  allPositions, formatNoteShort, formatPc, isNaturalPc, midiAt, mod12, spellPc, octavePositions, positionAt,
  type AccidentalPref, type Naming, type SpelledNote,
} from '../music';
import type { DiagramSpec } from '../content/types';
import type { Mark } from './Fretboard';

export interface LabelPrefs {
  naming: Naming;
  accidentals: AccidentalPref;
}

/** Nome curto de uma classe de altura para caber dentro da bolinha. */
export function shortName(pc: number, p: LabelPrefs): string {
  const naming = p.naming === 'both' ? 'en' : p.naming;
  if (isNaturalPc(pc) || p.accidentals !== 'both') return formatNoteShort(spellPc(pc, p.accidentals === 'flat' ? 'flat' : 'sharp'), naming);
  return formatPc(pc, naming, 'both');
}

export function spelledShort(n: SpelledNote, p: LabelPrefs): string {
  return formatNoteShort(n, p.naming === 'both' ? 'en' : p.naming);
}

/** Nomes das cordas soltas (6ª → 1ª). */
export function openStringLabels(p: LabelPrefs): string[] {
  return [6, 5, 4, 3, 2, 1].map((s) => shortName(mod12(midiAt(s, 0)), p));
}

/** Converte a descrição de um diagrama em marcações calculadas pelo motor musical. */
export function marksFromSpec(spec: DiagramSpec, p: LabelPrefs): Mark[] {
  const maxFret = spec.maxFret ?? 12;
  const minFret = spec.minFret ?? 0;
  const strings = spec.strings ?? [6, 5, 4, 3, 2, 1];
  const label = (pc: number) => (spec.showNames ? shortName(pc, p) : undefined);
  const inRange = allPositions(maxFret, undefined, minFret).filter((x) => strings.includes(x.string));
  switch (spec.mode) {
    case 'open':
      return [6, 5, 4, 3, 2, 1].map((s) => ({ string: s, fret: 0, role: 'focus', label: shortName(mod12(midiAt(s, 0)), p) }));
    case 'naturals':
      return inRange.filter((x) => isNaturalPc(x.pc)).map((x) => ({ string: x.string, fret: x.fret, role: 'scale', label: label(x.pc) }));
    case 'chromatic':
      return inRange.map((x) => ({ string: x.string, fret: x.fret, role: isNaturalPc(x.pc) ? 'scale' : 'focus', label: label(x.pc) }));
    case 'string':
      return inRange.filter((x) => x.string === spec.string).map((x) => ({
        string: x.string, fret: x.fret, role: isNaturalPc(x.pc) ? 'scale' : 'focus', label: label(x.pc),
      }));
    case 'pc':
      return inRange.filter((x) => x.pc === spec.pc).map((x) => ({ string: x.string, fret: x.fret, role: 'root', label: label(x.pc) }));
    case 'octaves': {
      if (!spec.from) return [];
      const src = positionAt(spec.from.string, spec.from.fret);
      const octs = octavePositions(src, maxFret).filter((x) => strings.includes(x.string));
      return [
        { string: src.string, fret: src.fret, role: 'root', label: label(src.pc) },
        ...octs.map((x): Mark => ({ string: x.string, fret: x.fret, role: 'octave', label: label(x.pc) })),
      ];
    }
    case 'positions':
      return (spec.positions ?? []).map((x) => ({
        string: x.string, fret: x.fret, role: x.role ?? 'focus',
        label: x.label ?? (spec.showNames ? shortName(mod12(midiAt(x.string, x.fret)), p) : undefined),
      }));
  }
}
