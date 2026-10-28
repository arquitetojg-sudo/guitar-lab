import { describe, expect, it } from 'vitest';
import { checkAnswer, correctPositions, generateQuiz, mulberry32, DISTANCE_OPTIONS, type Question } from './exercises';
import { review, newCardState, isDue, prioritize, DAY, RELEARN_MS } from './srs';
import { topicStats, quizScore } from './mastery';
import { LESSONS, lessonById } from '../content/lessons';
import { defaultCards } from '../content/cards';
import { TOPICS } from './topics';
import { midiAt, mod12 } from '../music';
import type { Attempt } from '../storage/types';
import { parseBackup, BackupError } from '../storage/backup';
import { MemoryPersistence } from '../storage/db';

describe('exercícios', () => {
  it('identificar nota: aceita a classe certa e rejeita as outras', () => {
    const q: Question = { kind: 'identify', id: 'x', topic: 'nota:6', pos: { string: 6, fret: 5 } };
    expect(checkAnswer(q, { pc: 9 })).toBe(true);
    for (let pc = 0; pc < 12; pc++) if (pc !== 9) expect(checkAnswer(q, { pc })).toBe(false);
  });
  it('localizar: aceita qualquer oitava na corda pedida', () => {
    const q: Question = { kind: 'locate', id: 'x', topic: 'nota:5', string: 5, pc: 0, minFret: 0, maxFret: 22 };
    expect(checkAnswer(q, { pos: { string: 5, fret: 3 } })).toBe(true);
    expect(checkAnswer(q, { pos: { string: 5, fret: 15 } })).toBe(true);
    expect(checkAnswer(q, { pos: { string: 6, fret: 8 } })).toBe(false); // Dó, mas corda errada
    expect(correctPositions(q, 22)).toEqual([{ string: 5, fret: 3 }, { string: 5, fret: 15 }]);
  });
  it('uníssono: só a mesma altura exata', () => {
    const q: Question = { kind: 'unison', id: 'x', topic: 'unissono', from: { string: 2, fret: 0 }, toString: 3 };
    expect(checkAnswer(q, { pos: { string: 3, fret: 4 } })).toBe(true);
    expect(checkAnswer(q, { pos: { string: 3, fret: 16 } })).toBe(false); // mesma classe, oitava acima
  });
  it('oitava: exatamente 12 semitons acima', () => {
    const q: Question = { kind: 'octave', id: 'x', topic: 'oitava:2c-gb', from: { string: 4, fret: 5 }, toString: 2 };
    expect(checkAnswer(q, { pos: { string: 2, fret: 8 } })).toBe(true);
    expect(checkAnswer(q, { pos: { string: 2, fret: 7 } })).toBe(false);
    expect(checkAnswer(q, { pos: { string: 2, fret: 20 } })).toBe(false);
  });
  it('distância: tons e semitons', () => {
    const q: Question = { kind: 'distance', id: 'x', topic: 'cromatica', string: 6, fretA: 3, fretB: 6 };
    const idx = DISTANCE_OPTIONS.findIndex((o) => o.semitones === 3);
    expect(checkAnswer(q, { index: idx })).toBe(true);
    expect(checkAnswer(q, { index: idx + 1 })).toBe(false);
  });

  it('todas as aulas geram quizzes válidos e solucionáveis (1000 perguntas cada)', () => {
    const rng = mulberry32(42);
    for (const lesson of LESSONS) {
      for (const spec of [lesson.executar.quiz, lesson.memorizar]) {
        const qs = generateQuiz(spec, 1000, rng);
        expect(qs.length).toBe(1000);
        for (const q of qs) {
          expect(TOPICS.map((t) => t.id)).toContain(q.topic);
          if (q.kind === 'choice') {
            expect(q.answer).toBeGreaterThanOrEqual(0);
            expect(q.answer).toBeLessThan(q.options.length);
            expect(checkAnswer(q, { index: q.answer })).toBe(true);
            continue;
          }
          if (q.kind === 'distance') {
            const i = DISTANCE_OPTIONS.findIndex((o) => o.semitones === Math.abs(q.fretB - q.fretA));
            expect(i).toBeGreaterThanOrEqual(0);
            continue;
          }
          if (q.kind === 'identify') {
            expect(checkAnswer(q, { pc: mod12(midiAt(q.pos.string, q.pos.fret)) })).toBe(true);
            continue;
          }
          const sol = correctPositions(q, 15);
          expect(sol.length).toBeGreaterThan(0);
          for (const p of sol) expect(checkAnswer(q, { pos: p })).toBe(true);
        }
      }
    }
  });

  it('quizzes de notas naturais nunca pedem notas alteradas', () => {
    const lesson = lessonById('f1-cordas-mi')!;
    const qs = generateQuiz(lesson.memorizar, 500, mulberry32(7));
    for (const q of qs) {
      if (q.kind === 'identify') expect([0, 2, 4, 5, 7, 9, 11]).toContain(mod12(midiAt(q.pos.string, q.pos.fret)));
      if (q.kind === 'locate') expect([0, 2, 4, 5, 7, 9, 11]).toContain(q.pc);
    }
  });
});

describe('conteúdo', () => {
  it('pré-requisitos existem e não formam ciclos', () => {
    const ids = new Set(LESSONS.map((l) => l.id));
    const seen = new Set<string>();
    for (const l of LESSONS) {
      for (const p of l.prereqs) {
        expect(ids.has(p)).toBe(true);
        expect(seen.has(p)).toBe(true); // pré-requisito aparece antes na trilha
      }
      seen.add(l.id);
    }
  });
  it('perguntas conceituais: respostas coerentes com o motor', () => {
    // Cards de nota gerados batem com o gabarito
    const cards = defaultCards('en');
    expect(cards.find((c) => c.id === 'nota-6-5')?.back).toBe('A');
    expect(cards.find((c) => c.id === 'nota-2-1')?.back).toBe('C');
    expect(cards.find((c) => c.id === 'nota-3-4')?.back).toBe('B');
    expect(new Set(cards.map((c) => c.id)).size).toBe(cards.length);
  });
});

describe('revisão espaçada', () => {
  const now = 1_700_000_000_000;
  it('acerto sobe de caixa e espaça; erro volta e reaparece em 10 min', () => {
    let s = newCardState('a', now);
    expect(isDue(s, now)).toBe(true);
    s = review(s, true, now);
    expect(s.box).toBe(1);
    expect(s.due).toBe(now + DAY);
    s = review(s, true, s.due);
    expect(s.box).toBe(2);
    const wrong = review(s, false, now);
    expect(wrong.box).toBe(0);
    expect(wrong.lapses).toBe(1);
    expect(wrong.due).toBe(now + RELEARN_MS);
  });
  it('prioriza os mais esquecidos', () => {
    const items = [
      { id: 'a', state: { cardId: 'a', box: 1, due: now - 10, reps: 3, lapses: 0 } },
      { id: 'b', state: { cardId: 'b', box: 0, due: now - 5, reps: 3, lapses: 2 } },
      { id: 'c', state: { cardId: 'c', box: 3, due: now + DAY, reps: 3, lapses: 5 } },
      { id: 'd' },
    ];
    expect(prioritize(items, now).map((i) => i.id)).toEqual(['b', 'd', 'a']);
  });
});

describe('domínio', () => {
  const day = 86_400_000;
  const mk = (n: number, correct: boolean, ts0: number, level: 1 | 2 | 3 = 2): Attempt[] =>
    Array.from({ length: n }, (_, i) => ({ ts: ts0 + i * 1000, topic: 't', kind: 'identify', level, correct, usedHint: false, revealed: false, ms: 1000 }));
  it('tempo/quantidade sem acerto não vira domínio', () => {
    expect(topicStats(mk(30, false, 0), 't').status).toBe('revisar');
  });
  it('acertos num único dia não bastam', () => {
    expect(topicStats(mk(20, true, 0), 't').status).toBe('aprendendo');
  });
  it('acertos consistentes em 2 dias = dominado', () => {
    expect(topicStats([...mk(6, true, 0), ...mk(6, true, day)], 't').status).toBe('dominado');
  });
  it('nível guiado não conta para domínio', () => {
    expect(topicStats([...mk(6, true, 0, 1), ...mk(6, true, day, 1)], 't').status).toBe('aprendendo');
  });
  it('resposta com dica não conta como acerto limpo', () => {
    expect(quizScore([{ correct: true, usedHint: true, revealed: false }, { correct: true, usedHint: false, revealed: false }])).toBe(0.5);
  });
});

describe('backup', () => {
  it('valida e importa', () => {
    const b = parseBackup(JSON.stringify({ app: 'guitar-lab', schema: 1, attempts: [{ ts: 1, topic: 'x', correct: true }], settings: { theme: 'dark', naming: 42 } }));
    expect(b.attempts).toHaveLength(1);
    expect(b.settings.theme).toBe('dark');
    expect(b.settings.naming).toBe('pt'); // tipo inválido ignorado
  });
  it('rejeita arquivos inválidos com mensagem clara', () => {
    expect(() => parseBackup('{')).toThrow(BackupError);
    expect(() => parseBackup('{"app":"outro"}')).toThrow(/não é um backup/);
    expect(() => parseBackup('{"app":"guitar-lab","schema":99}')).toThrow(/mais nova/);
    expect(() => parseBackup('{"app":"guitar-lab","schema":1,"bpm":[{"bpm":-3,"exerciseId":"a"}]}')).toThrow(/inválido/);
  });
  it('persistência em memória com chave automática', async () => {
    const db = new MemoryPersistence();
    await db.put('attempts', { ts: 1, topic: 'a' });
    await db.put('attempts', { ts: 2, topic: 'b' });
    const all = await db.getAll<{ id: number }>('attempts');
    expect(all.map((a) => a.id)).toEqual([1, 2]);
    await db.replaceAll({ attempts: [{ id: 9, ts: 3 }] });
    expect(await db.getAll('attempts')).toHaveLength(1);
  });
});

import { canTestOut, pendingPhaseLessons, phaseTestOutcome, lessonState } from './progress';
import type { LessonProgress } from '../storage/types';

describe('pular o que já sabe', () => {
  const done = (id: string): LessonProgress => ({ lessonId: id, steps: {}, bestQuizScore: 1, quizRuns: 1, completedAt: 1, lastVisitedAt: 1 });

  it('"Já sei isso" só aparece em aula liberada e não concluída', () => {
    const afin = lessonById('f1-afinacao')!;
    const crom = lessonById('f1-cromatica')!;
    expect(canTestOut(afin, {})).toBe(true);
    expect(canTestOut(crom, {})).toBe(false); // bloqueada
    expect(canTestOut(afin, { 'f1-afinacao': done('f1-afinacao') })).toBe(false); // já concluída
    expect(canTestOut(crom, { 'f1-afinacao': done('f1-afinacao') })).toBe(true);
  });

  it('aula concluída pelo teste libera a seguinte', () => {
    const p = { 'f1-afinacao': done('f1-afinacao') };
    expect(lessonState(lessonById('f1-cromatica')!, p)).toBe('available');
  });

  it('aulas pendentes da fase 1 seguem a ordem da trilha', () => {
    expect(pendingPhaseLessons(1, {}).length).toBe(11);
    const p = { 'f1-afinacao': done('f1-afinacao'), 'f1-cromatica': done('f1-cromatica') };
    const pend = pendingPhaseLessons(1, p);
    expect(pend.length).toBe(9);
    expect(pend[0].id).toBe('f1-cordas-mi');
    expect(pendingPhaseLessons(2, {})).toEqual([]);
  });

  it('prova da fase: ≥ 80% no geral conclui tudo', () => {
    // 8 de 10 = 80%
    const r = phaseTestOutcome([
      { lessonId: 'a', clean: 2, total: 2 },
      { lessonId: 'b', clean: 1, total: 2 },
      { lessonId: 'c', clean: 2, total: 2 },
      { lessonId: 'd', clean: 1, total: 2 },
      { lessonId: 'e', clean: 2, total: 2 },
    ], 0.8);
    expect(r).toEqual({ pass: ['a', 'b', 'c', 'd', 'e'], passedAll: true });
  });

  it('prova da fase abaixo de 80%: conclui só até a primeira aula com erro', () => {
    // 6 de 10 = 60%
    const r = phaseTestOutcome([
      { lessonId: 'a', clean: 2, total: 2 },
      { lessonId: 'b', clean: 2, total: 2 },
      { lessonId: 'c', clean: 1, total: 2 },
      { lessonId: 'd', clean: 1, total: 2 },
      { lessonId: 'e', clean: 0, total: 2 },
    ], 0.8);
    expect(r).toEqual({ pass: ['a', 'b'], stopAt: 'c', passedAll: false });
  });

  it('prova da fase: erro na primeira aula não conclui nada', () => {
    const r = phaseTestOutcome([
      { lessonId: 'a', clean: 0, total: 2 },
      { lessonId: 'b', clean: 2, total: 2 },
    ], 0.8);
    expect(r).toEqual({ pass: [], stopAt: 'a', passedAll: false });
  });
});
