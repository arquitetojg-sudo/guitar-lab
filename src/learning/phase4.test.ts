import { describe, expect, it } from 'vitest';
import { generateQuestion, generateQuiz, mulberry32, checkAnswer, type QuizSpec } from './exercises';
import { chordShape, keyLabel } from './harmony';
import { TOPICS } from './topics';
import { LESSONS, PHASES } from '../content/lessons';
import { CHORD_QUALITIES, identifyQuality, midiAt, mod12 } from '../music';

const ALL = [6, 5, 4, 3, 2, 1];
const spec = (extra: Partial<QuizSpec>): QuizSpec => ({ kinds: ['choice'], strings: ALL, minFret: 1, maxFret: 10, naturalsOnly: false, ...extra });
const pos = (s: { string: number; fret: number }[] | null) => s?.map((p) => `${p.string}:${p.fret}`).join(' ');

describe('desenhos de acorde (gabarito à mão)', () => {
  it('power chords', () => {
    expect(pos(chordShape(6, 5, CHORD_QUALITIES.power))).toBe('6:5 5:7 4:7'); // A5
    expect(pos(chordShape(5, 3, CHORD_QUALITIES.power))).toBe('5:3 4:5 3:5'); // C5
  });
  it('tríades em três cordas vizinhas', () => {
    expect(pos(chordShape(4, 7, CHORD_QUALITIES.major))).toBe('4:7 3:6 2:5'); // A: A C♯ E
    expect(pos(chordShape(4, 7, CHORD_QUALITIES.minor))).toBe('4:7 3:5 2:5'); // Am: A C E
    expect(pos(chordShape(4, 5, CHORD_QUALITIES.major))).toBe('4:5 3:4 2:3'); // G
    expect(pos(chordShape(6, 5, CHORD_QUALITIES.major))).toBe('6:5 5:4 4:2'); // A
    expect(pos(chordShape(6, 7, CHORD_QUALITIES.dim))).toBe('6:7 5:5 4:3'); // B°: B D F
  });
  it('rejeita desenhos fora do braço ou abertos demais', () => {
    expect(chordShape(4, 0, CHORD_QUALITIES.major)).toBeNull(); // terça cairia na casa −1
    expect(chordShape(5, 2, CHORD_QUALITIES.dim)).toBeNull();
    expect(chordShape(5, 12, CHORD_QUALITIES.power)).toBeNull(); // passaria da casa 12
  });
});

describe('perguntas de acorde', () => {
  it('chord-name: a cifra certa bate com a fundamental e os intervalos do desenho', () => {
    const rng = mulberry32(9);
    for (let i = 0; i < 300; i++) {
      const q = generateQuestion('chord-name', spec({ chordQualities: ['major', 'minor', 'dim', 'power'], chordRootStrings: [6, 5, 4] }), rng);
      if (q.kind !== 'choice' || !q.board) throw new Error('tipo');
      const root = q.board.marks.find((m) => m.role === 'root')!;
      const rm = midiAt(root.string, root.fret);
      const qual = identifyQuality(q.board.marks.map((m) => midiAt(m.string, m.fret) - rm))!;
      const answer = q.options[q.answer];
      expect(answer.endsWith(qual.symbol)).toBe(true);
      const letterPc: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
      const acc = answer[1] === '♯' ? 1 : answer[1] === '♭' ? -1 : 0;
      expect(mod12(letterPc[answer[0]] + acc)).toBe(mod12(rm));
      expect(Math.max(...q.board.marks.map((m) => m.fret))).toBeLessThanOrEqual(12);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });
  it('chord-spell: grafia por grau', () => {
    const answers = new Set<string>();
    for (let s = 1; s < 40; s++) {
      const q = generateQuestion('chord-spell', spec({ chordQualities: ['major'], keys: [4] }), mulberry32(s));
      if (q.kind !== 'choice') throw new Error('tipo');
      answers.add(q.options[q.answer]);
      expect(q.options).not.toContain(undefined);
    }
    expect([...answers]).toEqual(['E – G♯ – B']);
    const fm = generateQuestion('chord-spell', spec({ chordQualities: ['minor'], keys: [6] }), mulberry32(2));
    if (fm.kind !== 'choice') throw new Error('tipo');
    expect(fm.options[fm.answer]).toBe('F♯ – A – C♯');
  });
});

describe('campo harmônico e progressões (gabarito à mão)', () => {
  it('nomes de tonalidade', () => {
    expect(keyLabel(7, 'major')).toBe('Sol maior');
    expect(keyLabel(6, 'major')).toBe('Fá♯ maior');
    expect(keyLabel(10, 'naturalMinor')).toBe('Si♭ menor');
    expect(keyLabel(1, 'naturalMinor')).toBe('Dó♯ menor');
  });
  it('field-chord em Sol maior', () => {
    const expected = ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F♯°'];
    const rng = mulberry32(4);
    for (let i = 0; i < 80; i++) {
      const q = generateQuestion('field-chord', spec({ keys: [7], harmonyMode: 'major' }), rng);
      if (q.kind !== 'choice') throw new Error('tipo');
      const d = Number(q.prompt.match(/do (\d)º grau/)![1]);
      expect(q.options[q.answer]).toBe(expected[d - 1]);
    }
  });
  it('field-chord em Mi menor', () => {
    const expected = ['Em', 'F♯°', 'G', 'Am', 'Bm', 'C', 'D'];
    const rng = mulberry32(8);
    for (let i = 0; i < 80; i++) {
      const q = generateQuestion('field-chord', spec({ keys: [4], harmonyMode: 'naturalMinor' }), rng);
      if (q.kind !== 'choice') throw new Error('tipo');
      const d = Number(q.prompt.match(/do (\d)º grau/)![1]);
      expect(q.options[q.answer]).toBe(expected[d - 1]);
    }
  });
  it('field-degree em Ré maior', () => {
    const expected: Record<string, string> = { D: 'I', Em: 'ii', 'F♯m': 'iii', G: 'IV', A: 'V', Bm: 'vi', 'C♯°': 'vii°' };
    const rng = mulberry32(5);
    for (let i = 0; i < 80; i++) {
      const q = generateQuestion('field-degree', spec({ keys: [2], harmonyMode: 'major' }), rng);
      if (q.kind !== 'choice') throw new Error('tipo');
      const chord = q.prompt.match(/o acorde (\S+) é/)![1];
      expect(q.options[q.answer]).toBe(expected[chord]);
    }
  });
  it('progressões', () => {
    const prog = (keys: number[], degrees: number[], mode: 'major' | 'naturalMinor' = 'major') => {
      const q = generateQuestion('progression', spec({ keys, progressions: [degrees], harmonyMode: mode }), mulberry32(3));
      if (q.kind !== 'choice') throw new Error('tipo');
      return q.options[q.answer];
    };
    expect(prog([7], [1, 5, 6, 4])).toBe('G D Em C');
    expect(prog([9], [1, 5, 6, 4])).toBe('A E F♯m D');
    expect(prog([2], [1, 5, 6, 4])).toBe('D A Bm G');
    expect(prog([4], [1, 4, 5])).toBe('E A B');
    expect(prog([0], [2, 5, 1])).toBe('Dm G C');
    expect(prog([9], [1, 6, 7], 'naturalMinor')).toBe('Am F G');
  });
  it('improv-scale: tom maior usa o desenho da relativa menor', () => {
    const rng = mulberry32(12);
    for (let i = 0; i < 60; i++) {
      const q = generateQuestion('improv-scale', spec({ keys: [7] }), rng);
      if (q.kind !== 'choice') throw new Error('tipo');
      const ans = q.options[q.answer];
      if (q.prompt.startsWith('Base: G ')) expect(ans).toBe('Pentatônica maior de Sol (desenho de Mi menor)');
      else if (q.prompt.startsWith('Base: Gm ')) expect(ans).toBe('Pentatônica menor de Sol');
      else throw new Error(q.prompt);
    }
  });
});

describe('conteúdo da Fase 4', () => {
  const lessons = LESSONS.filter((l) => l.phase === 4);
  it('fase liberada com 6 aulas encadeadas', () => {
    expect(PHASES.find((p) => p.id === 4)?.available).toBe(true);
    expect(lessons).toHaveLength(6);
    expect(lessons[0].prereqs).toEqual(['p3-maior']);
  });
  it('todos os quizzes geram perguntas válidas, com assuntos conhecidos', () => {
    const known = new Set(TOPICS.map((t) => t.id));
    for (const l of lessons) {
      for (let seed = 1; seed <= 15; seed++) {
        const qs = [...generateQuiz(l.executar.quiz, 6, mulberry32(seed)), ...generateQuiz(l.memorizar, l.memorizar.count, mulberry32(seed + 50))];
        expect(qs.length).toBeGreaterThanOrEqual(6);
        for (const q of qs) {
          expect(known.has(q.topic), `${l.id}: ${q.topic}`).toBe(true);
          if (q.kind === 'choice') {
            expect(q.answer).toBeGreaterThanOrEqual(0);
            expect(q.options.length).toBeGreaterThanOrEqual(2);
            expect(checkAnswer(q, { index: q.answer })).toBe(true);
          }
        }
      }
    }
  });
});
