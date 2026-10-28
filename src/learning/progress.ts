import { LESSONS } from '../content/lessons';
import type { Lesson } from '../content/types';
import type { LessonProgress, StepId } from '../storage/types';

export type LessonState = 'locked' | 'available' | 'in-progress' | 'done';
export const STEPS: { id: StepId; label: string }[] = [
  { id: 'entender', label: 'Entender' },
  { id: 'executar', label: 'Executar' },
  { id: 'memorizar', label: 'Memorizar' },
  { id: 'aplicar', label: 'Aplicar' },
];

export function lessonState(lesson: Lesson, progress: Record<string, LessonProgress>): LessonState {
  const p = progress[lesson.id];
  if (p?.completedAt) return 'done';
  const unlocked = lesson.prereqs.every((id) => progress[id]?.completedAt);
  if (!unlocked) return 'locked';
  if (p && Object.keys(p.steps).length > 0) return 'in-progress';
  return 'available';
}

/** Próxima aula: a primeira em andamento ou disponível, na ordem da trilha. */
export function nextLesson(progress: Record<string, LessonProgress>): Lesson | undefined {
  return LESSONS.find((l) => {
    const s = lessonState(l, progress);
    return s === 'in-progress' || s === 'available';
  });
}

export function nextStep(lesson: Lesson, progress: Record<string, LessonProgress>): StepId {
  const p = progress[lesson.id];
  return STEPS.find((s) => !p?.steps[s.id])?.id ?? 'entender';
}

export function trailProgress(progress: Record<string, LessonProgress>) {
  const done = LESSONS.filter((l) => progress[l.id]?.completedAt).length;
  return { done, total: LESSONS.length };
}

/**
 * "Já sei isso": quem já domina um assunto pode ir direto ao teste sem consulta.
 * O critério continua o mesmo (≥ 80% sem ajuda); só o caminho deixa de ser obrigatório.
 */
export function canTestOut(lesson: Lesson, progress: Record<string, LessonProgress>): boolean {
  const s = lessonState(lesson, progress);
  return s === 'available' || s === 'in-progress';
}

/** Aulas de uma fase que ainda não foram concluídas, na ordem da trilha. */
export function pendingPhaseLessons(phase: number, progress: Record<string, LessonProgress>): Lesson[] {
  return LESSONS.filter((l) => l.phase === phase && !progress[l.id]?.completedAt);
}

export interface PhaseTestOutcome {
  /** Aulas a marcar como concluídas. */
  pass: string[];
  /** Primeira aula que precisa ser feita (onde houve erro), se houver. */
  stopAt?: string;
  passedAll: boolean;
}

/**
 * Resultado da prova da fase.
 * - Nota geral ≥ passScore → todas as aulas testadas são concluídas.
 * - Abaixo disso → conclui, na ordem da trilha, as aulas em que todas as
 *   respostas foram certas sem ajuda, até a primeira com erro. A trilha segue a
 *   partir dali, sem pular nada que você ainda não mostrou saber.
 */
export function phaseTestOutcome(
  perLesson: { lessonId: string; clean: number; total: number }[],
  passScore: number,
): PhaseTestOutcome {
  const total = perLesson.reduce((s, x) => s + x.total, 0);
  const clean = perLesson.reduce((s, x) => s + x.clean, 0);
  if (total > 0 && clean / total >= passScore) {
    return { pass: perLesson.map((x) => x.lessonId), passedAll: true };
  }
  const pass: string[] = [];
  for (const x of perLesson) {
    if (x.total > 0 && x.clean === x.total) pass.push(x.lessonId);
    else return { pass, stopAt: x.lessonId, passedAll: false };
  }
  return { pass, passedAll: false };
}
