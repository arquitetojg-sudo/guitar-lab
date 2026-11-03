import { describe, expect, it } from 'vitest';
import {
  checkAnswer, generateQuestion, generateQuiz, intervalHint, intervalTarget, keyName, mulberry32,
  type Question, type QuizSpec,
} from './exercises';
import { TOPICS } from './topics';
import { LESSONS, PHASES } from '../content/lessons';
import { marksFromSpec } from '../ui/marks';
import { INTERVALS, midiAt, mod12, pentatonicBox } from '../music';

const ALL = [6, 5, 4, 3, 2, 1];
const midi = (p: { string: number; fret: number }) => midiAt(p.string, p.fret);

describe('intervalos no braço (gabarito à mão)', () => {
  const at = (s: number, f: number, semis: number, off: number) => intervalTarget({ string: s, fret: f }, semis, off);
  it('tônica Lá na 6ª corda, casa 5', () => {
    expect(at(6, 5, 3, 1)).toEqual({ string: 5, fret: 3 }); // Dó (♭3)
    expect(at(6, 5, 4, 1)).toEqual({ string: 5, fret: 4 }); // Dó♯ (3)
    expect(at(6, 5, 5, 1)).toEqual({ string: 5, fret: 5 }); // Ré (4)
    expect(at(6, 5, 7, 1)).toEqual({ string: 5, fret: 7 }); // Mi (5)
    expect(at(6, 5, 10, 2)).toEqual({ string: 4, fret: 5 }); // Sol (♭7)
    expect(at(6, 5, 12, 2)).toEqual({ string: 4, fret: 7 }); // Lá (8)
  });
  it('atravessando Sol–Si: tudo uma casa à frente', () => {
    expect(at(3, 5, 7, 1)).toEqual({ string: 2, fret: 8 }); // Dó → Sol
    expect(at(3, 5, 5, 1)).toEqual({ string: 2, fret: 6 }); // Dó → Fá
    expect(at(3, 5, 4, 1)).toEqual({ string: 2, fret: 5 }); // Dó → Mi
    expect(at(3, 5, 3, 1)).toEqual({ string: 2, fret: 4 }); // Dó → Mi♭
    expect(at(3, 0, 4, 1)).toEqual({ string: 2, fret: 0 }); // Sol → Si solta
    expect(at(4, 5, 10, 2)).toEqual({ string: 2, fret: 6 }); // Sol → Fá
  });
  it('na mesma corda e fora do braço', () => {
    expect(at(5, 0, 3, 0)).toEqual({ string: 5, fret: 3 });
    expect(at(5, 0, 12, 0)).toEqual({ string: 5, fret: 12 });
    expect(at(1, 5, 7, 1)).toBeNull(); // não existe corda acima da 1ª
    expect(at(6, 1, 3, 1)).toBeNull(); // cairia na casa −1
  });
  it('dicas de desenho', () => {
    expect(intervalHint(7, 6, 5)).toContain('2 casas para a frente');
    expect(intervalHint(7, 3, 2)).toContain('3 casas para a frente');
    expect(intervalHint(4, 6, 5)).toContain('1 casa para trás');
    expect(intervalHint(4, 3, 2)).toContain('na mesma casa');
    expect(intervalHint(10, 6, 4)).toContain('na mesma casa');
    expect(intervalHint(10, 4, 2)).toContain('1 casa para a frente');
  });
});

describe('perguntas de intervalo', () => {
  const spec: QuizSpec = { kinds: ['interval-find'], strings: [6, 5, 4, 3, 2], minFret: 0, maxFret: 12, naturalsOnly: false, intervals: [3, 4, 5, 7, 10, 12], intervalMode: 'cross', intervalOffsets: [1, 2] };
  it('interval-find: o alvo fica exatamente N semitons acima da tônica', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 300; i++) {
      const q = generateQuestion('interval-find', spec, rng);
      if (q.kind !== 'find') throw new Error('tipo');
      const root = q.board.marks[0];
      const semis = midi(q.targets[0]) - midi(root);
      expect(spec.intervals).toContain(semis);
      expect(q.targets[0].string).toBe(q.toString);
      expect(checkAnswer(q, { pos: q.targets[0] })).toBe(true);
      expect(checkAnswer(q, { pos: { string: q.toString, fret: q.targets[0].fret + 1 } })).toBe(false);
      expect(Math.abs(q.targets[0].fret - root.fret)).toBeLessThanOrEqual(4);
    }
  });
  it('interval-name: a opção certa é o nome do intervalo calculado', () => {
    const rng = mulberry32(11);
    for (const mode of ['same', 'cross'] as const) {
      for (let i = 0; i < 200; i++) {
        const q = generateQuestion('interval-name', { ...spec, intervalMode: mode, intervals: [2, 3, 4, 5, 7, 10, 12] }, rng);
        if (q.kind !== 'choice' || !q.board) throw new Error('tipo');
        const [root, target] = q.board.marks;
        const semis = midi(target) - midi(root);
        const name = semis === 12 ? 'Oitava' : INTERVALS[semis].name;
        expect(q.options[q.answer]).toBe(name);
        expect(new Set(q.options).size).toBe(q.options.length);
        if (mode === 'same') expect(target.string).toBe(root.string);
      }
    }
  });
  it('exemplos: Lá→Dó terça menor, Dó→Mi terça maior, Mi→Si quinta justa', () => {
    expect(INTERVALS[mod12(0 - 9)].name).toBe('Terça menor');
    expect(INTERVALS[mod12(4 - 0)].name).toBe('Terça maior');
    expect(INTERVALS[mod12(11 - 4)].name).toBe('Quinta justa');
  });
});

describe('perguntas de pentatônica', () => {
  const spec: QuizSpec = { kinds: ['box-find'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: false, keys: [4, 9, 7, 2, 0, 11], boxes: [1, 2, 3, 4, 5] };
  it('box-degree: o grau da resposta bate com a altura da nota em relação à tônica', () => {
    const rng = mulberry32(3);
    for (const scale of ['minorPentatonic', 'majorPentatonic'] as const) {
      for (let i = 0; i < 200; i++) {
        const q = generateQuestion('box-degree', { ...spec, scale }, rng);
        if (q.kind !== 'choice' || !q.board) throw new Error('tipo');
        const t = q.board.marks.find((m) => m.label === '?')!;
        const anyRoot = q.board.marks.find((m) => m.label === '1');
        const rootPc = anyRoot ? mod12(midi(anyRoot)) : mod12(midi(t));
        const semis = mod12(midi(t) - rootPc);
        expect(q.options[q.answer]).toBe(INTERVALS[semis].short);
        expect(q.board.marks).toHaveLength(12);
      }
    }
  });
  it('box-find: só a posição do box com o grau pedido é aceita', () => {
    const rng = mulberry32(5);
    for (let i = 0; i < 200; i++) {
      const q = generateQuestion('box-find', spec, rng);
      if (q.kind !== 'find') throw new Error('tipo');
      const [t] = q.targets;
      expect(q.board.marks.some((m) => m.string === t.string && m.fret === t.fret)).toBe(true);
      expect(checkAnswer(q, { pos: t })).toBe(true);
      const other = q.board.marks.find((m) => m.string === t.string && m.fret !== t.fret)!;
      expect(checkAnswer(q, { pos: other })).toBe(false);
    }
  });
  it('box-start: casas do box 1 (gabarito)', () => {
    const expected: Record<number, number> = { 4: 0, 7: 3, 9: 5, 11: 7, 0: 8, 2: 10 };
    for (const [pc, fret] of Object.entries(expected)) {
      const q = generateQuestion('box-start', { ...spec, keys: [Number(pc)], boxes: [1] }, mulberry32(1));
      if (q.kind !== 'choice') throw new Error('tipo');
      expect(q.options[q.answer]).toBe(`Casa ${fret}`);
    }
  });
  it('nomes de tonalidade com grafia convencional', () => {
    expect(keyName(9, 'minorPentatonic')).toBe('Lá menor');
    expect(keyName(10, 'minorPentatonic')).toBe('Si♭ menor');
    expect(keyName(1, 'minorPentatonic')).toBe('Dó♯ menor');
    expect(keyName(6, 'majorPentatonic')).toBe('Fá♯ maior');
    expect(keyName(10, 'majorPentatonic')).toBe('Si♭ maior');
  });
  it('box 1 de Dó maior: tônicas na 6ª casa 8, 3ª casa 5 e 1ª casa 8', () => {
    const roots = pentatonicBox(0, 'majorPentatonic', 1).filter((n) => n.isRoot).map((n) => `${n.string}:${n.fret}`);
    expect(roots).toEqual(['6:8', '3:5', '1:8']);
  });
  it('box 1 de Lá menor: tônicas na 6ª casa 5, 4ª casa 7 e 1ª casa 5', () => {
    const roots = pentatonicBox(9, 'minorPentatonic', 1).filter((n) => n.isRoot).map((n) => `${n.string}:${n.fret}`);
    expect(roots).toEqual(['6:5', '4:7', '1:5']);
  });
  it('tônicas dos boxes 2 a 5 de Lá menor (gabarito)', () => {
    const roots = (b: number) => pentatonicBox(9, 'minorPentatonic', b).filter((n) => n.isRoot).map((n) => `${n.string}:${n.fret}`);
    expect(roots(2)).toEqual(['4:7', '2:10']);
    expect(roots(3)).toEqual(['5:12', '2:10']);
    expect(roots(4)).toEqual(['5:12', '3:14']);
    expect(roots(5)).toEqual(['6:5', '3:2', '1:5']);
  });
});

describe('diagramas das aulas', () => {
  const prefs = { naming: 'pt', accidentals: 'sharp' } as const;
  it('mapa em volta da tônica Lá (6ª, casa 5)', () => {
    const m = marksFromSpec({ mode: 'intervals', from: { string: 6, fret: 5 }, intervals: [
      { semitones: 3, string: 5 }, { semitones: 4, string: 5 }, { semitones: 5, string: 5 }, { semitones: 7, string: 5 }, { semitones: 10, string: 4 }, { semitones: 12, string: 4 },
    ] }, prefs);
    expect(m.map((x) => `${x.string}:${x.fret}=${x.label}`)).toEqual(['6:5=1', '5:3=b3', '5:4=3', '5:5=4', '5:7=5', '4:5=b7', '4:7=8']);
  });
  it('box com dois desenhos não duplica as notas em comum', () => {
    const m = marksFromSpec({ mode: 'box', pc: 9, boxes: [1, 2] }, prefs);
    expect(m).toHaveLength(18); // 12 + 12 − 6 notas compartilhadas
  });
});

describe('conteúdo das Fases 2 e 3', () => {
  const lessons = LESSONS.filter((l) => l.phase === 2 || l.phase === 3);
  it('fases liberadas e com aulas', () => {
    expect(PHASES.find((p) => p.id === 2)?.available).toBe(true);
    expect(PHASES.find((p) => p.id === 3)?.available).toBe(true);
    expect(lessons.filter((l) => l.phase === 2)).toHaveLength(4);
    expect(lessons.filter((l) => l.phase === 3)).toHaveLength(6);
  });
  it('pré-requisitos existem e vêm antes na trilha', () => {
    for (const l of LESSONS) for (const p of l.prereqs) {
      const idx = LESSONS.findIndex((x) => x.id === p);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(LESSONS.indexOf(l));
    }
    expect(lessons[0].prereqs).toEqual(['f2-mapa-oitavas']);
  });
  it('todos os quizzes geram perguntas válidas, com assuntos conhecidos', () => {
    const known = new Set(TOPICS.map((t) => t.id));
    for (const l of lessons) {
      for (let seed = 1; seed <= 15; seed++) {
        const qs: Question[] = [
          ...generateQuiz(l.executar.quiz, 6, mulberry32(seed)),
          ...generateQuiz(l.memorizar, l.memorizar.count, mulberry32(seed + 100)),
        ];
        expect(qs.length).toBeGreaterThanOrEqual(6);
        for (const q of qs) {
          expect(known.has(q.topic), `${l.id}: ${q.topic}`).toBe(true);
          if (q.kind === 'choice') expect(q.answer).toBeGreaterThanOrEqual(0);
          if (q.kind === 'find') expect(checkAnswer(q, { pos: q.targets[0] })).toBe(true);
        }
      }
    }
  });
  it('perguntas conceituais têm resposta dentro das opções', () => {
    for (const l of lessons) for (const c of [...(l.executar.quiz.choices ?? []), ...(l.memorizar.choices ?? [])]) {
      expect(c.answer).toBeLessThan(c.options.length);
    }
  });
});
