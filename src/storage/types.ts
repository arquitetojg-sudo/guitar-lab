/**
 * Modelo de dados persistido (IndexedDB).
 * Conteúdo didático (aulas, cards padrão) fica em src/content e NÃO é salvo —
 * só o progresso do usuário é. Isso permite atualizar o conteúdo sem migrar dados.
 */
import type { AccidentalPref, Naming } from '../music/notes';
import type { Instrument } from '../music/fretboard';

export const SCHEMA_VERSION = 1;

export type Theme = 'system' | 'light' | 'dark';
export type Level = 1 | 2 | 3; // 1 guiada, 2 recuperação, 3 rápida

export interface SessionBlock {
  id: string;
  kind: 'tecnica' | 'localizacao' | 'teoria' | 'aplicacao' | 'revisao' | 'cards';
  label: string;
  minutes: number;
}

export interface Settings {
  theme: Theme;
  naming: Naming;
  accidentals: AccidentalPref;
  instrument: Instrument;
  tuningId: string;
  leftHanded: boolean;
  showFretsUpTo: 12 | 15 | 'all';
  sessionBlocks: SessionBlock[];
  quickTimerSeconds: number;
  sound: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  naming: 'pt',
  accidentals: 'sharp',
  instrument: 'guitarra',
  tuningId: 'standard',
  leftHanded: false,
  showFretsUpTo: 12,
  quickTimerSeconds: 8,
  sound: true,
  sessionBlocks: [
    { id: 'b1', kind: 'tecnica', label: 'Técnica e agilidade', minutes: 8 },
    { id: 'b2', kind: 'localizacao', label: 'Localização de notas', minutes: 5 },
    { id: 'b3', kind: 'teoria', label: 'Conteúdo da aula', minutes: 7 },
    { id: 'b4', kind: 'aplicacao', label: 'Aplicação musical', minutes: 10 },
  ],
};

export type StepId = 'entender' | 'executar' | 'memorizar' | 'aplicar';

export interface LessonProgress {
  lessonId: string;
  steps: Partial<Record<StepId, number>>; // timestamp de conclusão de cada etapa
  bestQuizScore: number; // 0–1
  quizRuns: number;
  completedAt?: number;
  /** Concluída pelo "Já sei isso" ou pela prova da fase (sem fazer as etapas). */
  testedOutAt?: number;
  lastVisitedAt: number;
}

/** Uma resposta a um exercício. */
export interface Attempt {
  id?: number;
  ts: number;
  topic: string;
  kind: string;
  level: Level;
  correct: boolean;
  usedHint: boolean;
  revealed: boolean;
  ms: number;
  lessonId?: string;
  sessionId?: string;
}

/** Card criado pelo usuário (os cards padrão vêm do conteúdo). */
export interface CustomCard {
  id: string;
  front: string;
  back: string;
  theme: string;
  createdAt: number;
}

/** Estado de revisão espaçada de um card (padrão ou personalizado). */
export interface CardState {
  cardId: string;
  box: number;
  due: number;
  reps: number;
  lapses: number;
  lastReviewed?: number;
}

export interface ReviewLog {
  id?: number;
  cardId: string;
  ts: number;
  correct: boolean;
}

/** Sessão de prática registrada (tempo real cronometrado no app). */
export interface PracticeSession {
  id: string;
  startedAt: number;
  endedAt: number;
  seconds: number;
  blocks: { label: string; seconds: number }[];
  note?: string;
}

/** Treino do dia em andamento (permite pausar e retomar). */
export interface ActiveSession {
  id: string;
  startedAt: number;
  blocks: SessionBlock[];
  index: number;
  /** segundos acumulados por bloco */
  elapsed: number[];
  /** timestamp em que o cronômetro foi retomado; undefined = pausado */
  runningSince?: number;
}

export interface BpmEntry {
  id?: number;
  ts: number;
  exerciseId: string;
  bpm: number;
  /** declared = informado pelo usuário; o app não mede a execução. */
  source: 'declared';
  clean: boolean;
  note?: string;
}

export interface Goal {
  id: string;
  text: string;
  createdAt: number;
  done: boolean;
  doneAt?: number;
}

export type Certainty = 'confirmado' | 'hipotese' | 'desconhecido';

export interface SongField {
  value: string;
  certainty: Certainty;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  instrument: Instrument;
  part: string;
  key: SongField;
  chords: SongField;
  scales: SongField;
  techniques: string;
  difficulties: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface Backup {
  app: 'guitar-lab';
  schema: number;
  exportedAt: string;
  settings: Settings;
  lessonProgress: LessonProgress[];
  attempts: Attempt[];
  customCards: CustomCard[];
  cardStates: CardState[];
  reviews: ReviewLog[];
  sessions: PracticeSession[];
  activeSession: ActiveSession | null;
  bpm: BpmEntry[];
  goals: Goal[];
  songs: Song[];
  lastRoute: string;
}
