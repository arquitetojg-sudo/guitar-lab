import type { Attempt } from '../storage/types';

/**
 * Critério de domínio. Tempo de prática NÃO conta — só desempenho.
 * - "dominado": ≥ 12 respostas sem ajuda (nível 2 ou 3), ≥ 85% de acerto
 *   nas últimas 12, distribuídas em pelo menos 2 dias diferentes.
 * - "revisar": ≥ 4 respostas recentes e < 70% de acerto nas últimas 10.
 * Respostas com dica ou com a resposta revelada contam como erro para o domínio.
 */
export type TopicStatus = 'novo' | 'aprendendo' | 'revisar' | 'dominado';

export interface TopicStats {
  topic: string;
  total: number;
  correct: number;
  recentAccuracy: number; // últimas 10, 0–1
  status: TopicStatus;
  lastTs?: number;
}

const dayKey = (ts: number) => new Date(ts).toDateString();
const clean = (a: Attempt) => a.correct && !a.usedHint && !a.revealed;

export function topicStats(attempts: Attempt[], topic: string): TopicStats {
  const list = attempts.filter((a) => a.topic === topic).sort((a, b) => a.ts - b.ts);
  const recent = list.slice(-10);
  const recentAccuracy = recent.length ? recent.filter(clean).length / recent.length : 0;
  const recall = list.filter((a) => a.level >= 2);
  const last12 = recall.slice(-12);
  let status: TopicStatus = 'novo';
  if (list.length > 0) status = 'aprendendo';
  if (recent.length >= 4 && recentAccuracy < 0.7) status = 'revisar';
  else if (
    last12.length >= 12 &&
    last12.filter(clean).length / last12.length >= 0.85 &&
    new Set(last12.map((a) => dayKey(a.ts))).size >= 2
  ) status = 'dominado';
  return {
    topic,
    total: list.length,
    correct: list.filter((a) => a.correct).length,
    recentAccuracy,
    status,
    lastTs: list.at(-1)?.ts,
  };
}

export function allTopicStats(attempts: Attempt[]): TopicStats[] {
  const topics = [...new Set(attempts.map((a) => a.topic))];
  return topics.map((t) => topicStats(attempts, t));
}

export function topicsToReview(attempts: Attempt[]): TopicStats[] {
  return allTopicStats(attempts)
    .filter((s) => s.status === 'revisar')
    .sort((a, b) => a.recentAccuracy - b.recentAccuracy);
}

/** Aprovação no quiz de uma aula (etapa MEMORIZAR). */
export const QUIZ_PASS = 0.8;
export function quizScore(results: { correct: boolean; usedHint: boolean; revealed: boolean }[]): number {
  if (!results.length) return 0;
  return results.filter((r) => r.correct && !r.usedHint && !r.revealed).length / results.length;
}
