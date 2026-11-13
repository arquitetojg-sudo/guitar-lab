import type { QuizSpec } from './exercises';
import { generateQuiz, mulberry32, type Question } from './exercises';

const ALL = [6, 5, 4, 3, 2, 1];
/** Tonalidades comuns no rock e no blues: Mi, Lá, Sol, Ré, Dó, Si. */
export const KEYS = [4, 9, 7, 2, 0, 11];
const ALL_PAIRS: [number, number][] = [[6, 4], [5, 3], [4, 2], [3, 1], [6, 3], [5, 2], [4, 1]];

export interface PracticeSet {
  id: string;
  label: string;
  description: string;
  spec: QuizSpec;
}

export const PRACTICE_SETS: PracticeSet[] = [
  { id: 'localizar', label: 'Localizar notas naturais', description: 'Identificar e encontrar naturais nas seis cordas, casas 0–12.', spec: { kinds: ['identify', 'locate'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: true } },
  { id: 'cromatico', label: 'Todas as notas', description: 'Inclui sustenidos e bemóis.', spec: { kinds: ['identify', 'locate'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: false } },
  { id: 'graves', label: 'Cordas de fundamental (6ª e 5ª)', description: 'As cordas onde ficam as fundamentais de power chords e pestanas.', spec: { kinds: ['identify', 'locate'], strings: [6, 5], minFret: 0, maxFret: 12, naturalsOnly: false } },
  { id: 'unissono', label: 'Mesma nota em outra corda', description: 'Trocar de corda mantendo a altura.', spec: { kinds: ['unison'], strings: [1, 2, 3, 4, 5], minFret: 0, maxFret: 12, naturalsOnly: false } },
  { id: 'oitavas', label: 'Oitavas', description: 'Todos os desenhos de oitava, incluindo o ajuste Sol–Si.', spec: { kinds: ['octave'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: false, octavePairs: ALL_PAIRS } },
  { id: 'distancias', label: 'Tons e semitons', description: 'Contar a distância entre casas.', spec: { kinds: ['distance'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: false } },
];

/** Exercício focado num assunto (usado na revisão de dificuldades). */
export function specForTopic(topic: string): QuizSpec {
  if (topic.startsWith('nota:')) {
    const s = Number(topic.split(':')[1]);
    return { kinds: ['identify', 'locate'], strings: [s], minFret: 0, maxFret: 12, naturalsOnly: true };
  }
  switch (topic) {
    case 'cordas-soltas': return { kinds: ['identify'], strings: ALL, minFret: 0, maxFret: 0, naturalsOnly: true };
    case 'cromatica': return { kinds: ['distance'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: false };
    case 'acidentes': return { kinds: ['identify', 'locate'], strings: ALL, minFret: 1, maxFret: 12, naturalsOnly: false };
    case 'unissono': return PRACTICE_SETS[3].spec;
    case 'oitava:2c': return { kinds: ['octave'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: false, octavePairs: [[6, 4], [5, 3]] };
    case 'oitava:2c-gb': return { kinds: ['octave'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: false, octavePairs: [[4, 2], [3, 1]] };
    case 'oitava:3c': return { kinds: ['octave'], strings: ALL, minFret: 3, maxFret: 12, naturalsOnly: false, octavePairs: [[6, 3]] };
    case 'oitava:3c-gb': return { kinds: ['octave'], strings: ALL, minFret: 2, maxFret: 12, naturalsOnly: false, octavePairs: [[5, 2], [4, 1]] };
    case 'intervalo:nome': return { kinds: ['interval-name'], strings: ALL, minFret: 0, maxFret: 7, naturalsOnly: false, intervals: [2, 3, 4, 5, 7, 12], intervalMode: 'same' };
    case 'intervalo:quinta': return { kinds: ['interval-find', 'interval-name'], strings: [6, 5, 4, 3, 2], minFret: 1, maxFret: 10, naturalsOnly: false, intervals: [5, 7], intervalMode: 'cross' };
    case 'intervalo:terca': return { kinds: ['interval-find', 'interval-name'], strings: [6, 5, 4, 3, 2], minFret: 2, maxFret: 10, naturalsOnly: false, intervals: [3, 4], intervalMode: 'cross' };
    case 'intervalo:setima': return { kinds: ['interval-find', 'interval-name'], strings: [6, 5, 4], minFret: 1, maxFret: 10, naturalsOnly: false, intervals: [3, 4, 5, 7, 10, 12], intervalMode: 'cross', intervalOffsets: [1, 2] };
    case 'penta:box1': return { kinds: ['box-find', 'box-degree'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: false, keys: KEYS, boxes: [1] };
    case 'penta:tom': return { kinds: ['box-start', 'box-find'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: false, keys: KEYS, boxes: [1] };
    case 'penta:box2': case 'penta:box3': case 'penta:box4': case 'penta:box5':
      return { kinds: ['box-find', 'box-degree'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: false, keys: KEYS, boxes: [Number(topic.slice(-1))] };
    case 'acorde:power': return { kinds: ['chord-name'], strings: ALL, minFret: 0, maxFret: 10, naturalsOnly: false, chordQualities: ['power'], chordRootStrings: [6, 5] };
    case 'acorde:triade': return { kinds: ['chord-name', 'chord-quality', 'chord-spell'], strings: ALL, minFret: 1, maxFret: 10, naturalsOnly: false, chordQualities: ['major', 'minor', 'dim'], chordRootStrings: [6, 5, 4], keys: KEYS };
    case 'campo:maior': return { kinds: ['field-chord', 'field-degree'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: false, keys: [0, 7, 2, 9, 4, 5], harmonyMode: 'major' };
    case 'campo:menor': return { kinds: ['field-chord', 'field-degree'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: false, keys: [9, 4, 2, 7, 11], harmonyMode: 'naturalMinor' };
    case 'progressao': return { kinds: ['progression'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: false, keys: [0, 7, 2, 9, 4], progressions: [[1, 4, 5], [1, 5, 6, 4], [2, 5, 1], [6, 4, 1, 5]] };
    case 'harmonia:escala': return { kinds: ['improv-scale'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: false, keys: [0, 7, 2, 9, 4] };
    case 'penta:maior': return { kinds: ['box-find', 'box-degree'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: false, keys: [0, 2, 7, 9, 4], boxes: [1, 2], scale: 'majorPentatonic' };
    default: return PRACTICE_SETS[4].spec;
  }
}

/** Mistura perguntas dos assuntos fracos, priorizando os piores. */
export function reviewQuiz(topics: string[], count: number, seed: number): Question[] {
  if (!topics.length) return [];
  const rng = mulberry32(seed);
  const per = Math.max(2, Math.ceil(count / topics.length));
  const out: Question[] = [];
  for (const t of topics) out.push(...generateQuiz(specForTopic(t), per, rng));
  // embaralha
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.slice(0, count);
}
