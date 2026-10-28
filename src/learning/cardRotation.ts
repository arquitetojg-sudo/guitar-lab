import { defaultCards, type Card } from '../content/cards';
import type { Naming } from '../music';
import type { CardState, CustomCard, LessonProgress } from '../storage/types';
import { isDue } from './srs';

/** Todos os cards (padrão + pessoais). */
export function allCards(naming: Naming, custom: CustomCard[]): Card[] {
  return [...defaultCards(naming), ...custom.map((c): Card => ({ ...c, custom: true }))];
}

/** Um card entra na revisão quando sua aula foi iniciada (pessoais entram sempre). */
export function inRotation(card: Card, progress: Record<string, LessonProgress>): boolean {
  if (card.custom || !card.lessonId) return true;
  const lp = progress[card.lessonId];
  return !!lp && (Object.keys(lp.steps).length > 0 || !!lp.completedAt);
}

export function dueCount(cards: Card[], progress: Record<string, LessonProgress>, states: Record<string, CardState>, now = Date.now()): number {
  return cards.filter((c) => inRotation(c, progress) && isDue(states[c.id], now)).length;
}
