import type { QuizSpec } from '../learning/exercises';

export type MarkRole = 'root' | 'scale' | 'chord' | 'target' | 'octave' | 'focus' | 'muted';

/** Diagrama do braço descrito por regra (as posições são calculadas, não desenhadas). */
export interface DiagramSpec {
  caption?: string;
  minFret?: number;
  maxFret?: number;
  /** naturals: notas naturais · pc: uma nota em todas as posições · octaves: posição + oitavas · open: cordas soltas · positions: lista explícita */
  mode: 'naturals' | 'chromatic' | 'pc' | 'octaves' | 'open' | 'positions' | 'string' | 'intervals' | 'box';
  /** intervals: a partir de `from`, cada item é um intervalo (semitons) numa corda; a casa é calculada. */
  intervals?: { semitones: number; string: number }[];
  /** box: tonalidade (pc da tônica), escala e boxes a desenhar. */
  boxes?: number[];
  scale?: 'minorPentatonic' | 'majorPentatonic';
  /** box: rótulo de cada nota — grau (padrão) ou nome. */
  labels?: 'degree' | 'note';
  pc?: number;
  string?: number;
  from?: { string: number; fret: number };
  positions?: { string: number; fret: number; role?: MarkRole; label?: string }[];
  strings?: number[];
  showNames?: boolean;
}

export interface ContentBlock {
  text: string[];
  diagram?: DiagramSpec;
}

export interface Lesson {
  id: string;
  phase: number;
  module: string;
  title: string;
  goal: string;
  minutes: number;
  prereqs: string[];
  entender: ContentBlock[];
  executar: { instructions: string[]; diagram?: DiagramSpec; quiz: QuizSpec };
  memorizar: QuizSpec & { count: number };
  aplicar: { instructions: string[]; diagram?: DiagramSpec };
}

export interface Phase {
  id: number;
  title: string;
  summary: string;
  topics: string[];
  available: boolean;
}
