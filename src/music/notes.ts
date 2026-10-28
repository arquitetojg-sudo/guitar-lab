/**
 * Notas, classes de altura e grafia.
 *
 * Convenções:
 * - Classe de altura (pitch class, "pc"): inteiro 0–11, Dó (C) = 0.
 * - Altura absoluta: número MIDI (Dó central C4 = 60, Lá 440 Hz = A4 = 69).
 * - Nota grafada (SpelledNote): letra + acidente, para distinguir Fá♯ de Sol♭.
 */

export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export const LETTERS: Letter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
/** Classe de altura de cada letra natural. */
export const LETTER_PC: Record<Letter, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export const LETTER_PT: Record<Letter, string> = {
  C: 'Dó', D: 'Ré', E: 'Mi', F: 'Fá', G: 'Sol', A: 'Lá', B: 'Si',
};

export interface SpelledNote {
  letter: Letter;
  /** -2 = dobrado bemol, -1 = bemol, 0 = natural, 1 = sustenido, 2 = dobrado sustenido */
  acc: number;
}

export type Naming = 'pt' | 'en' | 'both';
export type AccidentalPref = 'sharp' | 'flat' | 'both';

export const mod12 = (n: number): number => ((n % 12) + 12) % 12;

export function pcOf(note: SpelledNote): number {
  return mod12(LETTER_PC[note.letter] + note.acc);
}

export function isNaturalPc(pc: number): boolean {
  return [0, 2, 4, 5, 7, 9, 11].includes(mod12(pc));
}

const SHARP_SPELLING: SpelledNote[] = [
  { letter: 'C', acc: 0 }, { letter: 'C', acc: 1 }, { letter: 'D', acc: 0 }, { letter: 'D', acc: 1 },
  { letter: 'E', acc: 0 }, { letter: 'F', acc: 0 }, { letter: 'F', acc: 1 }, { letter: 'G', acc: 0 },
  { letter: 'G', acc: 1 }, { letter: 'A', acc: 0 }, { letter: 'A', acc: 1 }, { letter: 'B', acc: 0 },
];
const FLAT_SPELLING: SpelledNote[] = [
  { letter: 'C', acc: 0 }, { letter: 'D', acc: -1 }, { letter: 'D', acc: 0 }, { letter: 'E', acc: -1 },
  { letter: 'E', acc: 0 }, { letter: 'F', acc: 0 }, { letter: 'G', acc: -1 }, { letter: 'G', acc: 0 },
  { letter: 'A', acc: -1 }, { letter: 'A', acc: 0 }, { letter: 'B', acc: -1 }, { letter: 'B', acc: 0 },
];

/** Grafia padrão de uma classe de altura (sem contexto de tonalidade). */
export function spellPc(pc: number, pref: 'sharp' | 'flat' = 'sharp'): SpelledNote {
  return (pref === 'flat' ? FLAT_SPELLING : SHARP_SPELLING)[mod12(pc)];
}

/** Todas as grafias usuais (até um acidente) de uma classe de altura. */
export function enharmonicSpellings(pc: number): SpelledNote[] {
  const p = mod12(pc);
  const out: SpelledNote[] = [];
  for (const letter of LETTERS) {
    for (const acc of [-1, 0, 1]) {
      if (mod12(LETTER_PC[letter] + acc) === p) out.push({ letter, acc });
    }
  }
  // naturais primeiro, depois sustenidos, depois bemóis
  return out.sort((a, b) => Math.abs(a.acc) - Math.abs(b.acc) || b.acc - a.acc);
}

export function accidentalSymbol(acc: number): string {
  if (acc === 0) return '';
  if (acc === 1) return '♯';
  if (acc === -1) return '♭';
  if (acc === 2) return '𝄪';
  if (acc === -2) return '𝄫';
  return acc > 0 ? '♯'.repeat(acc) : '♭'.repeat(-acc);
}

export function noteNameEn(n: SpelledNote): string {
  return n.letter + accidentalSymbol(n.acc);
}

export function noteNamePt(n: SpelledNote): string {
  return LETTER_PT[n.letter] + accidentalSymbol(n.acc);
}

export function formatNote(n: SpelledNote, naming: Naming): string {
  if (naming === 'pt') return noteNamePt(n);
  if (naming === 'en') return noteNameEn(n);
  return `${noteNamePt(n)} (${noteNameEn(n)})`;
}

/** Nome curto para caber numa casa do braço. */
export function formatNoteShort(n: SpelledNote, naming: Naming): string {
  return naming === 'pt' ? noteNamePt(n) : noteNameEn(n);
}

/** Formata uma classe de altura respeitando a preferência de acidentes. */
export function formatPc(pc: number, naming: Naming, pref: AccidentalPref): string {
  if (isNaturalPc(pc) || pref !== 'both') {
    return formatNote(spellPc(pc, pref === 'flat' ? 'flat' : 'sharp'), naming);
  }
  const s = formatNote(spellPc(pc, 'sharp'), naming === 'both' ? 'en' : naming);
  const f = formatNote(spellPc(pc, 'flat'), naming === 'both' ? 'en' : naming);
  return `${s}/${f}`;
}

/** Interpreta nomes como "F#", "Bb", "Fá#", "Sib", "Ré♭". */
export function parseNote(input: string): SpelledNote {
  const s = input.trim();
  const ptMap: [string, Letter][] = [
    ['dó', 'C'], ['do', 'C'], ['ré', 'D'], ['re', 'D'], ['mi', 'E'], ['fá', 'F'], ['fa', 'F'],
    ['sol', 'G'], ['lá', 'A'], ['la', 'A'], ['si', 'B'],
  ];
  let letter: Letter | undefined;
  let rest = '';
  const lower = s.toLowerCase();
  for (const [pt, l] of ptMap) {
    if (lower.startsWith(pt)) {
      letter = l;
      rest = s.slice(pt.length);
      break;
    }
  }
  if (!letter) {
    const c = s[0]?.toUpperCase() as Letter;
    if (!LETTERS.includes(c)) throw new Error(`Nota inválida: "${input}"`);
    letter = c;
    rest = s.slice(1);
  }
  let acc = 0;
  for (const ch of rest) {
    if (ch === '#' || ch === '♯') acc += 1;
    else if (ch === 'b' || ch === '♭') acc -= 1;
    else if (ch === 'x' || ch === '𝄪') acc += 2;
    else throw new Error(`Nota inválida: "${input}"`);
  }
  return { letter, acc };
}

export function midiToPc(midi: number): number {
  return mod12(midi);
}

/** Oitava científica (C4 = 60). */
export function midiOctave(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

export function midiToFrequency(midi: number, a4 = 440): number {
  return a4 * Math.pow(2, (midi - 69) / 12);
}

/** Desloca uma letra por N graus (0 = mesma letra). */
export function shiftLetter(letter: Letter, steps: number): Letter {
  const i = LETTERS.indexOf(letter);
  return LETTERS[(((i + steps) % 7) + 7) % 7];
}

/**
 * Grafa a nota que está `semitones` acima de `root` e que deve ocupar o grau
 * `degree` (1 = mesma letra, 3 = terça…). Garante a grafia diatônica correta:
 * a terça maior de Mi♭ é Sol, não Fá𝄪 nem Lá♭♭.
 */
export function spellAbove(root: SpelledNote, degree: number, semitones: number): SpelledNote {
  const letter = shiftLetter(root.letter, degree - 1);
  const target = mod12(pcOf(root) + semitones);
  let acc = mod12(target - LETTER_PC[letter]);
  if (acc > 6) acc -= 12;
  return { letter, acc };
}

export function sameSpelling(a: SpelledNote, b: SpelledNote): boolean {
  return a.letter === b.letter && a.acc === b.acc;
}
