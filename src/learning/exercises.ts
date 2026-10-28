import {
  STANDARD_TUNING, describeDistance, fretShift, isNaturalPc, midiAt, mod12, positionAt,
  type FretPosition, type Tuning,
} from '../music';
import { octaveTopic } from './topics';

export type Rng = () => number;

/** Gerador pseudoaleatório com semente (reprodutível nos testes). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(rng: Rng, list: T[]): T => list[Math.floor(rng() * list.length)];
const intIn = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));

export interface Pos {
  string: number;
  fret: number;
}

export type Question =
  | { kind: 'identify'; id: string; topic: string; pos: Pos }
  | { kind: 'locate'; id: string; topic: string; string: number; pc: number; minFret: number; maxFret: number }
  | { kind: 'unison'; id: string; topic: string; from: Pos; toString: number }
  | { kind: 'octave'; id: string; topic: string; from: Pos; toString: number }
  | { kind: 'distance'; id: string; topic: string; string: number; fretA: number; fretB: number }
  | { kind: 'choice'; id: string; topic: string; prompt: string; options: string[]; answer: number; explain: string };

export type QuestionKind = Question['kind'];

export type Answer = { pos: Pos } | { pc: number } | { index: number };

export interface ChoiceItem {
  topic: string;
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface QuizSpec {
  kinds: QuestionKind[];
  /** Cordas usadas nos exercícios de nota (1–6). */
  strings: number[];
  minFret: number;
  maxFret: number;
  naturalsOnly: boolean;
  /** Pares [origem, destino] para exercícios de oitava. */
  octavePairs?: [number, number][];
  choices?: ChoiceItem[];
}

const noteTopic = (s: number) => `nota:${s}`;

function randomPosition(spec: QuizSpec, rng: Rng, tuning: Tuning): FretPosition {
  for (let i = 0; i < 200; i++) {
    const s = pick(rng, spec.strings);
    const f = intIn(rng, spec.minFret, spec.maxFret);
    const p = positionAt(s, f, tuning);
    if (!spec.naturalsOnly || isNaturalPc(p.pc)) return p;
  }
  throw new Error('Nenhuma posição satisfaz o filtro do exercício.');
}

let counter = 0;
const nextId = () => `q${Date.now().toString(36)}${(counter++).toString(36)}`;

export function generateQuestion(kind: QuestionKind, spec: QuizSpec, rng: Rng, tuning: Tuning = STANDARD_TUNING): Question {
  const id = nextId();
  switch (kind) {
    case 'identify': {
      const p = randomPosition(spec, rng, tuning);
      const topic = !isNaturalPc(p.pc) ? 'acidentes' : p.fret === 0 ? 'cordas-soltas' : noteTopic(p.string);
      return { kind, id, topic, pos: { string: p.string, fret: p.fret } };
    }
    case 'locate': {
      const p = randomPosition({ ...spec, minFret: Math.max(spec.minFret, 1) }, rng, tuning);
      return {
        kind, id, topic: isNaturalPc(p.pc) ? noteTopic(p.string) : 'acidentes',
        string: p.string, pc: p.pc, minFret: spec.minFret, maxFret: spec.maxFret,
      };
    }
    case 'unison': {
      // Origem numa corda e destino na corda vizinha mais grave (mesma altura existe).
      for (let i = 0; i < 200; i++) {
        const from = randomPosition({ ...spec, strings: spec.strings.filter((s) => s < 6) }, rng, tuning);
        const toString = from.string + 1;
        const targetFret = from.midi - midiAt(toString, 0, tuning);
        if (targetFret >= 0 && targetFret <= spec.maxFret + 5) {
          return { kind, id, topic: 'unissono', from: { string: from.string, fret: from.fret }, toString };
        }
      }
      throw new Error('Não foi possível gerar exercício de uníssono.');
    }
    case 'octave': {
      const pairs = spec.octavePairs ?? [[6, 4], [5, 3]];
      for (let i = 0; i < 200; i++) {
        const [fromS, toS] = pick(rng, pairs);
        const shift = fretShift(fromS, toS, 1, tuning);
        const f = intIn(rng, spec.minFret, spec.maxFret);
        const target = f + shift;
        const pc = mod12(midiAt(fromS, f, tuning));
        if (target < 0 || target > Math.max(spec.maxFret, 12) + 3) continue;
        if (spec.naturalsOnly && !isNaturalPc(pc)) continue;
        return { kind, id, topic: octaveTopic(fromS, toS), from: { string: fromS, fret: f }, toString: toS };
      }
      throw new Error('Não foi possível gerar exercício de oitava.');
    }
    case 'distance': {
      const s = pick(rng, spec.strings);
      const a = intIn(rng, spec.minFret, Math.max(spec.minFret, spec.maxFret - 1));
      const b = Math.min(a + intIn(rng, 1, 5), spec.maxFret + 2);
      return { kind, id, topic: 'cromatica', string: s, fretA: a, fretB: b };
    }
    case 'choice': {
      const item = pick(rng, spec.choices ?? []);
      if (!item) throw new Error('Nenhuma pergunta conceitual disponível.');
      return { kind, id, ...item };
    }
  }
}

/** Gera N perguntas variadas, evitando repetir a mesma pergunta em sequência. */
export function generateQuiz(spec: QuizSpec, count: number, rng: Rng, tuning: Tuning = STANDARD_TUNING): Question[] {
  const out: Question[] = [];
  let last = '';
  for (let i = 0; out.length < count && i < count * 20; i++) {
    const q = generateQuestion(spec.kinds[out.length % spec.kinds.length], spec, rng, tuning);
    const sig = signature(q);
    if (sig === last) continue;
    last = sig;
    out.push(q);
  }
  return out;
}

export function signature(q: Question): string {
  switch (q.kind) {
    case 'identify': return `i${q.pos.string}-${q.pos.fret}`;
    case 'locate': return `l${q.string}-${q.pc}`;
    case 'unison': return `u${q.from.string}-${q.from.fret}`;
    case 'octave': return `o${q.from.string}-${q.from.fret}-${q.toString}`;
    case 'distance': return `d${q.string}-${q.fretA}-${q.fretB}`;
    case 'choice': return `c${q.prompt}`;
  }
}

/** Opções de resposta para "distância": número de semitons. */
export const DISTANCE_OPTIONS = [1, 2, 3, 4, 5, 6, 7].map((s) => ({ semitones: s, label: describeDistance(s) }));

/** Todas as posições corretas (para revelar a resposta e validar). */
export function correctPositions(q: Question, maxFret: number, tuning: Tuning = STANDARD_TUNING): Pos[] {
  switch (q.kind) {
    case 'identify':
      return [q.pos];
    case 'locate': {
      const out: Pos[] = [];
      for (let f = q.minFret; f <= maxFret; f++) if (mod12(midiAt(q.string, f, tuning)) === q.pc) out.push({ string: q.string, fret: f });
      return out;
    }
    case 'unison': {
      const target = midiAt(q.from.string, q.from.fret, tuning) - midiAt(q.toString, 0, tuning);
      return target >= 0 ? [{ string: q.toString, fret: target }] : [];
    }
    case 'octave': {
      const src = midiAt(q.from.string, q.from.fret, tuning);
      const out: Pos[] = [];
      for (let f = 0; f <= maxFret; f++) {
        const m = midiAt(q.toString, f, tuning);
        if (m - src === 12) out.push({ string: q.toString, fret: f });
      }
      return out;
    }
    default:
      return [];
  }
}

export function checkAnswer(q: Question, ans: Answer, tuning: Tuning = STANDARD_TUNING): boolean {
  switch (q.kind) {
    case 'identify':
      return 'pc' in ans && mod12(ans.pc) === mod12(midiAt(q.pos.string, q.pos.fret, tuning));
    case 'locate':
      return 'pos' in ans && ans.pos.string === q.string && ans.pos.fret >= q.minFret && mod12(midiAt(ans.pos.string, ans.pos.fret, tuning)) === q.pc;
    case 'unison':
      return 'pos' in ans && ans.pos.string === q.toString && midiAt(ans.pos.string, ans.pos.fret, tuning) === midiAt(q.from.string, q.from.fret, tuning);
    case 'octave':
      return 'pos' in ans && ans.pos.string === q.toString && midiAt(ans.pos.string, ans.pos.fret, tuning) - midiAt(q.from.string, q.from.fret, tuning) === 12;
    case 'distance':
      return 'index' in ans && DISTANCE_OPTIONS[ans.index]?.semitones === Math.abs(q.fretB - q.fretA);
    case 'choice':
      return 'index' in ans && ans.index === q.answer;
  }
}

/** Dica sem entregar a resposta. */
export function hintFor(q: Question, tuning: Tuning = STANDARD_TUNING): string {
  switch (q.kind) {
    case 'identify':
    case 'locate':
      return 'Parta da corda solta ou de uma referência que você já sabe (casas 5, 7 e 12) e conte as casas: cada casa é um semitom. Lembre que entre Mi–Fá e Si–Dó não há nota no meio.';
    case 'unison': {
      const gb = q.toString === 3 && q.from.string === 2;
      return gb
        ? 'Da corda Si para a corda Sol, a mesma nota fica 4 casas à frente (é o único par afinado em terça maior).'
        : 'Na corda vizinha mais grave, a mesma nota fica 5 casas à frente (exceto entre Sol e Si, onde são 4).';
    }
    case 'octave': {
      const shift = fretShift(q.from.string, q.toString, 1, tuning);
      const skip = q.from.string - q.toString;
      const dir = shift > 0 ? 'para a frente (rumo ao corpo)' : 'para trás (rumo à mão)';
      const gb = q.from.string >= 3 && q.toString <= 2;
      return `Pulando ${skip - 1} corda${skip - 1 > 1 ? 's' : ''}, a oitava fica ${Math.abs(shift)} casa${Math.abs(shift) > 1 ? 's' : ''} ${dir}${gb ? ' — o par Sol–Si empurra o desenho uma casa para a frente' : ''}.`;
    }
    case 'distance':
      return 'Conte as casas entre as duas notas: 1 casa = 1 semitom, 2 casas = 1 tom.';
    case 'choice':
      return q.explain.split('.')[0] + '.';
  }
}
