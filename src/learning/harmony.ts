import {
  CHORD_QUALITIES, STANDARD_TUNING, chordNotes, chordSymbol, conventionalRoot, harmonicField, midiAt, mod12, noteNameEn, openMidi,
  type ChordQuality, type HarmonicFieldChord, type SpelledNote, type Tuning,
} from '../music';
import type { Board, Pos, Question, QuizSpec, Rng } from './exercises';

/**
 * Exercícios da Fase 4 (acordes e harmonia).
 * Acordes, notas e campos harmônicos vêm do motor musical (empilhamento de terças
 * e grafia por grau); as posições no braço são calculadas pela altura.
 */

export type HarmonyKind = 'chord-name' | 'chord-quality' | 'chord-spell' | 'field-chord' | 'field-degree' | 'progression' | 'improv-scale';
export const HARMONY_KINDS: HarmonyKind[] = ['chord-name', 'chord-quality', 'chord-spell', 'field-chord', 'field-degree', 'progression', 'improv-scale'];
export type HarmonyMode = 'major' | 'naturalMinor';

const pick = <T,>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length)];

function shuffled(rng: Rng, correct: string, pool: string[], max = 4): { options: string[]; answer: number } {
  const options = [correct, ...[...new Set(pool)].filter((x) => x !== correct)].slice(0, max);
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { options, answer: options.indexOf(correct) };
}

/** Nome da tonalidade em português, com a grafia convencional. */
export function keyLabel(pc: number, mode: HarmonyMode): string {
  const root = conventionalRoot(pc, mode === 'major' ? 'major' : 'minor');
  const pt: Record<string, string> = { C: 'Dó', D: 'Ré', E: 'Mi', F: 'Fá', G: 'Sol', A: 'Lá', B: 'Si' };
  const acc = root.acc === 1 ? '♯' : root.acc === -1 ? '♭' : '';
  return `${pt[root.letter]}${acc} ${mode === 'major' ? 'maior' : 'menor'}`;
}

export const cifra = (c: { root: SpelledNote; quality: ChordQuality }) => chordSymbol(c.root, c.quality, 'en');
export const noteList = (notes: SpelledNote[]) => notes.map(noteNameEn).join(' – ');

/** Grafia da fundamental de um acorde isolado: a da tonalidade com a mesma qualidade. */
export function chordRoot(pc: number, qualityId: string): SpelledNote {
  return conventionalRoot(pc, qualityId === 'major' || qualityId === 'power' || qualityId === 'aug' ? 'major' : 'minor');
}

/**
 * Desenho compacto do acorde: fundamental na corda `rootString` e as demais notas
 * nas cordas seguintes (power chord: 1-5-8; tríade: 1-3-5 em três cordas vizinhas).
 */
export function chordShape(rootString: number, rootFret: number, quality: ChordQuality, tuning: Tuning = STANDARD_TUNING): (Pos & { label: string })[] | null {
  const rootMidi = midiAt(rootString, rootFret, tuning);
  const plan: [number, number, string][] = quality.id === 'power'
    ? [[7, 1, '5'], [12, 2, '8']]
    : quality.tones.slice(1, 3).map((t, k) => [t.semitones, k + 1, k === 0 ? (t.semitones === 3 ? 'b3' : '3') : t.semitones === 6 ? 'b5' : t.semitones === 8 ? '#5' : '5']);
  const out: (Pos & { label: string })[] = [{ string: rootString, fret: rootFret, label: '1' }];
  for (const [semis, off, label] of plan) {
    const s = rootString - off;
    if (s < 1) return null;
    const fret = rootMidi + semis - openMidi(s, tuning);
    if (fret < 0 || fret > 12) return null;
    out.push({ string: s, fret, label });
  }
  const frets = out.map((p) => p.fret);
  return Math.max(...frets) - Math.min(...frets) <= 4 ? out : null;
}

function randomShape(spec: QuizSpec, rng: Rng, tuning: Tuning) {
  const qualities = spec.chordQualities ?? ['major', 'minor'];
  for (let i = 0; i < 400; i++) {
    const q = CHORD_QUALITIES[pick(rng, qualities)];
    const s = pick(rng, spec.chordRootStrings ?? [6, 5]);
    const f = spec.minFret + Math.floor(rng() * (spec.maxFret - spec.minFret + 1));
    const shape = chordShape(s, f, q, tuning);
    if (shape) return { quality: q, shape, rootPc: mod12(midiAt(s, f, tuning)) };
  }
  throw new Error('Não foi possível gerar um desenho de acorde.');
}

const shapeBoard = (shape: (Pos & { label: string })[], reveal: boolean): Board => ({
  maxFret: 12,
  marks: shape.map((p) => ({ string: p.string, fret: p.fret, role: p.label === '1' ? 'root' : 'focus', label: reveal ? p.label : p.label === '1' ? '1' : undefined, answerLabel: p.label })),
});

const QUALITY_LABEL: Record<string, string> = { major: 'Maior', minor: 'Menor', dim: 'Diminuto', aug: 'Aumentado', power: 'Power chord (sem terça)' };

function fieldOf(pc: number, mode: HarmonyMode): HarmonicFieldChord[] {
  return harmonicField(conventionalRoot(pc, mode === 'major' ? 'major' : 'minor'), mode);
}

const ROMAN_PATTERN = (degrees: number[], field: HarmonicFieldChord[]) => degrees.map((d) => field[d - 1].roman).join('–');

export function harmonyTopic(kind: HarmonyKind, spec: QuizSpec): string {
  switch (kind) {
    case 'chord-name': case 'chord-quality': case 'chord-spell':
      return (spec.chordQualities ?? []).every((q) => q === 'power') ? 'acorde:power' : 'acorde:triade';
    case 'field-chord': case 'field-degree':
      return spec.harmonyMode === 'naturalMinor' ? 'campo:menor' : 'campo:maior';
    case 'progression': return 'progressao';
    case 'improv-scale': return 'harmonia:escala';
  }
}

export function generateHarmony(kind: HarmonyKind, spec: QuizSpec, rng: Rng, id: string, tuning: Tuning = STANDARD_TUNING): Question {
  const topic = harmonyTopic(kind, spec);
  const keys = spec.keys ?? [0, 7, 2, 9, 4];
  switch (kind) {
    case 'chord-name': {
      const { quality, shape, rootPc } = randomShape(spec, rng, tuning);
      const root = chordRoot(rootPc, quality.id);
      const correct = chordSymbol(root, quality, 'en');
      const others = (spec.chordQualities ?? ['major', 'minor']).filter((q) => q !== quality.id).map((q) => chordSymbol(chordRoot(rootPc, q), CHORD_QUALITIES[q], 'en'));
      const near = [rootPc + 2, rootPc - 1, rootPc + 5].map((pc) => chordSymbol(chordRoot(mod12(pc), quality.id), quality, 'en'));
      const { options, answer } = shuffled(rng, correct, [...others, ...near]);
      return {
        kind: 'choice', id, topic, options, answer,
        prompt: 'Qual é o acorde? A fundamental (1) está em vermelho.',
        explain: `A fundamental é ${noteNameEn(root)}; os outros graus são ${shape.slice(1).map((p) => p.label).join(' e ')} → ${correct}.`,
        board: shapeBoard(shape, false),
      };
    }
    case 'chord-quality': {
      const { quality, shape } = randomShape(spec, rng, tuning);
      const opts = (spec.chordQualities ?? ['major', 'minor']).map((q) => QUALITY_LABEL[q]);
      const { options, answer } = shuffled(rng, QUALITY_LABEL[quality.id], opts, 5);
      return {
        kind: 'choice', id, topic, options, answer,
        prompt: 'Que tipo de acorde é este desenho? Pense nos intervalos a partir da fundamental (1).',
        explain: `Os graus são ${shape.map((p) => p.label).join(', ')}: ${QUALITY_LABEL[quality.id].toLowerCase()}.`,
        board: shapeBoard(shape, false),
      };
    }
    case 'chord-spell': {
      const qid = pick(rng, (spec.chordQualities ?? ['major', 'minor']).filter((q) => q !== 'power'));
      const quality = CHORD_QUALITIES[qid];
      const rootPc = pick(rng, keys);
      const root = chordRoot(rootPc, qid);
      const notes = chordNotes(root, quality).map((n) => n.note);
      const correct = noteList(notes);
      const swapQ = qid === 'major' ? 'minor' : 'major';
      const swapped = noteList(chordNotes(root, CHORD_QUALITIES[swapQ]).map((n) => n.note));
      // grafia errada da terça: mesma altura, letra trocada (ex.: A♯ no lugar de B♭)
      const third = notes[1];
      let misspelled: string | null = null;
      if (third.acc !== 0) {
        const letter = third.acc > 0 ? next(third.letter) : prev(third.letter);
        const acc = mod12(pcOfSpelled(third) - LETTER_PC[letter] + 6) - 6;
        if (Math.abs(acc) === 1) misspelled = noteList([notes[0], { letter, acc }, notes[2]]);
      }
      const fifthOff = noteList([notes[0], notes[1], chordNotes(root, CHORD_QUALITIES.dim).map((n) => n.note)[2]]);
      const { options, answer } = shuffled(rng, correct, [swapped, ...(misspelled ? [misspelled] : []), fifthOff, noteList(chordNotes(chordRoot(mod12(rootPc + 2), qid), quality).map((n) => n.note))]);
      return {
        kind: 'choice', id, topic, options, answer,
        prompt: `Quais são as notas de ${chordSymbol(root, quality, 'en')}?`,
        explain: `${chordSymbol(root, quality, 'en')} = ${quality.tones.map((t) => (t.semitones === 3 ? 'b3' : t.semitones === 6 ? 'b5' : String(t.degree))).join(', ')}: ${correct}. Uma letra por grau (1, 3, 5 = letras alternadas).`,
      };
    }
    case 'field-chord': {
      const mode = spec.harmonyMode ?? 'major';
      const pc = pick(rng, keys);
      const field = fieldOf(pc, mode);
      const d = 1 + Math.floor(rng() * 7);
      const c = field[d - 1];
      const correct = cifra(c);
      const pool = ['major', 'minor', 'dim'].filter((q) => q !== c.quality.id).map((q) => chordSymbol(c.root, CHORD_QUALITIES[q], 'en'));
      const { options, answer } = shuffled(rng, correct, [...pool, cifra(field[d % 7])]);
      return {
        kind: 'choice', id, topic, options, answer,
        prompt: `Em ${keyLabel(pc, mode)}, qual é o acorde do ${d}º grau?`,
        explain: `Campo de ${keyLabel(pc, mode)}: ${field.map(cifra).join(' ')}. O ${d}º grau é ${correct} (${c.roman}).`,
      };
    }
    case 'field-degree': {
      const mode = spec.harmonyMode ?? 'major';
      const pc = pick(rng, keys);
      const field = fieldOf(pc, mode);
      const d = 1 + Math.floor(rng() * 7);
      const c = field[d - 1];
      const pool = [field[(d + 1) % 7], field[(d + 2) % 7], field[(d + 4) % 7]].map((x) => x.roman);
      const { options, answer } = shuffled(rng, c.roman, pool);
      return {
        kind: 'choice', id, topic, options, answer,
        prompt: `Em ${keyLabel(pc, mode)}, o acorde ${cifra(c)} é qual grau?`,
        explain: `Campo de ${keyLabel(pc, mode)}: ${field.map((x) => `${cifra(x)} (${x.roman})`).join(' · ')}.`,
      };
    }
    case 'progression': {
      const progs = spec.progressions ?? [[1, 4, 5], [1, 5, 6, 4], [2, 5, 1]];
      const degrees = pick(rng, progs);
      const mode = spec.harmonyMode ?? 'major';
      const pc = pick(rng, keys);
      const field = fieldOf(pc, mode);
      const chordsOf = (f: HarmonicFieldChord[]) => degrees.map((d) => cifra(f[d - 1])).join(' ');
      const correct = chordsOf(field);
      const otherKey = chordsOf(fieldOf(mod12(pc + 7), mode));
      const allSameQuality = degrees.map((d) => chordSymbol(field[d - 1].root, CHORD_QUALITIES[mode === 'major' ? 'major' : 'minor'], 'en')).join(' ');
      const shuffledDegrees = [...degrees].reverse().map((d) => cifra(field[d - 1])).join(' ');
      const neighbor = degrees.map((d) => cifra(field[d % 7])).join(' ');
      const { options, answer } = shuffled(rng, correct, [otherKey, allSameQuality, neighbor, shuffledDegrees]);
      return {
        kind: 'choice', id, topic, options, answer,
        prompt: `Progressão ${ROMAN_PATTERN(degrees, field)} em ${keyLabel(pc, mode)}: quais são os acordes?`,
        explain: `Em ${keyLabel(pc, mode)}: ${degrees.map((d) => `${field[d - 1].roman} = ${cifra(field[d - 1])}`).join(', ')}.`,
      };
    }
    case 'improv-scale': {
      const mode: HarmonyMode = pick(rng, ['major', 'naturalMinor'] as const);
      const pc = pick(rng, keys);
      const field = fieldOf(pc, mode);
      const degrees = mode === 'major' ? pick(rng, [[1, 4, 5], [1, 5, 6, 4]]) : pick(rng, [[1, 6, 7], [1, 4, 5]]);
      const chords = degrees.map((d) => cifra(field[d - 1])).join(' ');
      const rel = mode === 'major' ? mod12(pc - 3) : mod12(pc + 3);
      const minorName = (x: number) => keyLabel(x, 'naturalMinor').replace(' menor', '');
      const majorName = (x: number) => keyLabel(x, 'major').replace(' maior', '');
      const correct = mode === 'major'
        ? `Pentatônica maior de ${majorName(pc)} (desenho de ${minorName(rel)} menor)`
        : `Pentatônica menor de ${minorName(pc)}`;
      const pool = mode === 'major'
        ? [`Pentatônica menor de ${minorName(pc)}`, `Pentatônica maior de ${majorName(mod12(pc + 7))} (desenho de ${minorName(mod12(pc + 4))} menor)`, `Pentatônica menor de ${minorName(mod12(pc + 2))}`]
        : [`Pentatônica maior de ${majorName(pc)} (desenho de ${minorName(mod12(pc - 3))} menor)`, `Pentatônica menor de ${minorName(mod12(pc + 7))}`, `Pentatônica menor de ${minorName(mod12(pc + 5))}`];
      const { options, answer } = shuffled(rng, correct, pool);
      return {
        kind: 'choice', id, topic, options, answer,
        prompt: `Base: ${chords}. Qual pentatônica usar para improvisar?`,
        explain: `Os acordes são do campo de ${keyLabel(pc, mode)} (o 1º acorde é a tônica). ${mode === 'major' ? `Tom maior: pentatônica maior, com o desenho da relativa menor (${minorName(rel)}, 3 casas abaixo).` : 'Tom menor: pentatônica menor da tônica.'}`,
      };
    }
  }
}

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 } as const;
const next = (l: SpelledNote['letter']) => LETTERS[(LETTERS.indexOf(l) + 1) % 7];
const prev = (l: SpelledNote['letter']) => LETTERS[(LETTERS.indexOf(l) + 6) % 7];
const pcOfSpelled = (n: SpelledNote) => LETTER_PC[n.letter] + n.acc;
