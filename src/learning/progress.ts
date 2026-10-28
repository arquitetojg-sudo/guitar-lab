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
