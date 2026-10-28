import type { CardState } from '../storage/types';

/**
 * Revisão espaçada no estilo Leitner.
 * Acertou → sobe uma caixa e o próximo intervalo cresce.
 * Errou → volta para a caixa 0 e reaparece em 10 minutos.
 * A prática livre continua disponível; a agenda só define o que é "pendente".
 */
export const DAY = 24 * 60 * 60 * 1000;
export const RELEARN_MS = 10 * 60 * 1000;
/** Intervalo (dias) ao chegar em cada caixa. */
export const BOX_INTERVALS_DAYS = [0, 1, 2, 4, 8, 16, 32, 64];
export const MAX_BOX = BOX_INTERVALS_DAYS.length - 1;

export function newCardState(cardId: string, now: number): CardState {
  return { cardId, box: 0, due: now, reps: 0, lapses: 0 };
}

export function review(state: CardState, correct: boolean, now: number): CardState {
  if (!correct) {
    return { ...state, box: 0, due: now + RELEARN_MS, reps: state.reps + 1, lapses: state.lapses + 1, lastReviewed: now };
  }
  const box = Math.min(state.box + 1, MAX_BOX);
  return { ...state, box, due: now + BOX_INTERVALS_DAYS[box] * DAY, reps: state.reps + 1, lastReviewed: now };
}

export function isDue(state: CardState | undefined, now: number): boolean {
  return !state || state.due <= now;
}

/** Ordena pendentes: mais esquecidos primeiro, depois os mais atrasados. */
export function prioritize<T extends { state?: CardState }>(items: T[], now: number): T[] {
  return [...items]
    .filter((i) => isDue(i.state, now))
    .sort((a, b) => {
      const la = a.state?.lapses ?? 0;
      const lb = b.state?.lapses ?? 0;
      if (lb !== la) return lb - la;
      return (a.state?.due ?? 0) - (b.state?.due ?? 0);
    });
}
