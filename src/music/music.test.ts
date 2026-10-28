import { describe, expect, it } from 'vitest';
import {
  STANDARD_TUNING, allPositions, chordNotes, CHORD_QUALITIES, describeDistance, enharmonicSpellings,
  fretShift, fretsOfPcOnString, harmonicField, intervalBetweenPcs, midiAt, midiToFrequency, noteAt,
  noteNameEn, noteNamePt, octavePositions, octaveShapes, parseNote, pcOf, pentatonicBox, positionAt,
  progressionChords, scaleNotes, SCALES, spellPc, stringGap, unisonPositions, conventionalRoot,
  formatPc, describeMidiInterval, identifyQuality,
} from './index';

/** Gabarito escrito à mão (sustenidos), casas 0–12, para conferir o cálculo. */
const EXPECTED: Record<number, string[]> = {
  6: ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'],
  5: ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A'],
  4: ['D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D'],
  3: ['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G'],
  2: ['B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  1: ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'],
};
const asEn = (n: { letter: string; acc: number }) => n.letter + (n.acc === 1 ? '#' : n.acc === -1 ? 'b' : '');

describe('afinação padrão', () => {
  it('cordas soltas E2 A2 D3 G3 B3 E4', () => {
    expect(STANDARD_TUNING.strings).toEqual([40, 45, 50, 55, 59, 64]);
    expect([6, 5, 4, 3, 2, 1].map((s) => asEn(noteAt(s, 0)))).toEqual(['E', 'A', 'D', 'G', 'B', 'E']);
  });
  it('intervalos entre cordas: quartas justas, exceto Sol→Si (terça maior)', () => {
    expect([5, 4, 3, 2, 1].map((s) => stringGap(s))).toEqual([5, 5, 5, 4, 5]);
  });
  it('Lá 440 Hz é a casa 5 da 1ª corda', () => {
    expect(midiAt(1, 5)).toBe(69);
    expect(midiToFrequency(midiAt(1, 5))).toBeCloseTo(440, 6);
  });
});

describe('notas em cada casa (0–12)', () => {
  for (const s of [6, 5, 4, 3, 2, 1]) {
    it(`${s}ª corda`, () => {
      const got = Array.from({ length: 13 }, (_, f) => asEn(noteAt(s, f)));
      expect(got).toEqual(EXPECTED[s]);
    });
  }
  it('a casa 12 repete a corda solta uma oitava acima, até a casa 24', () => {
    for (const s of [1, 2, 3, 4, 5, 6]) {
      for (let f = 0; f <= 12; f++) {
        expect(positionAt(s, f + 12).pc).toBe(positionAt(s, f).pc);
        expect(positionAt(s, f + 12).midi - positionAt(s, f).midi).toBe(12);
      }
    }
  });
  it('cada casa sobe exatamente 1 semitom', () => {
    for (const s of [1, 2, 3, 4, 5, 6]) {
      for (let f = 0; f < 22; f++) expect(midiAt(s, f + 1) - midiAt(s, f)).toBe(1);
    }
  });
  it('rejeita casas e cordas inválidas', () => {
    expect(() => midiAt(7, 0)).toThrow();
    expect(() => midiAt(1, -1)).toThrow();
  });
});

describe('nomes e enarmonia', () => {
  it('português e internacional', () => {
    expect(noteNamePt(parseNote('F#'))).toBe('Fá♯');
    expect(noteNameEn(parseNote('Sib'))).toBe('B♭');
    expect(noteNamePt(parseNote('Ré♭'))).toBe('Ré♭');
  });
  it('Fá♯ e Sol♭ são a mesma altura', () => {
    expect(pcOf(parseNote('F#'))).toBe(pcOf(parseNote('Gb')));
    expect(pcOf(parseNote('E#'))).toBe(pcOf(parseNote('F')));
    expect(pcOf(parseNote('Cb'))).toBe(pcOf(parseNote('B')));
  });
  it('grafias enarmônicas', () => {
    expect(enharmonicSpellings(6).map(asEn)).toEqual(['F#', 'Gb']);
    expect(enharmonicSpellings(5).map(asEn)).toEqual(['F', 'E#']);
  });
  it('preferência de acidentes', () => {
    expect(asEn(spellPc(10, 'sharp'))).toBe('A#');
    expect(asEn(spellPc(10, 'flat'))).toBe('Bb');
    expect(formatPc(10, 'en', 'both')).toBe('A♯/B♭');
    expect(formatPc(9, 'pt', 'both')).toBe('Lá');
  });
  it('rejeita nomes inválidos', () => {
    expect(() => parseNote('H')).toThrow();
    expect(() => parseNote('C?')).toThrow();
  });
});

describe('tons, semitons e intervalos', () => {
  it('distâncias', () => {
    expect(describeDistance(1)).toBe('1 semitom');
    expect(describeDistance(2)).toBe('1 tom');
    expect(describeDistance(5)).toBe('2 tons e 1 semitom');
  });
  it('intervalos entre classes', () => {
    expect(intervalBetweenPcs(9, 0).short).toBe('b3'); // Lá → Dó
    expect(intervalBetweenPcs(0, 4).short).toBe('3'); // Dó → Mi
    expect(intervalBetweenPcs(4, 11).short).toBe('5'); // Mi → Si
    expect(intervalBetweenPcs(7, 2).short).toBe('5'); // Sol → Ré (atravessa a oitava)
    expect(intervalBetweenPcs(0, 6).short).toBe('b5');
  });
  it('intervalos compostos', () => {
    expect(describeMidiInterval(40, 52)).toBe('Oitava');
    expect(describeMidiInterval(40, 64)).toBe('2 oitavas');
    expect(describeMidiInterval(45, 61)).toBe('Terça maior + 1 oitava');
  });
});

describe('oitavas e uníssonos', () => {
  it('formas de oitava calculadas pela afinação', () => {
    const map = Object.fromEntries(octaveShapes().map((s) => [s.id, s.shift]));
    // pulando uma corda
    expect(map['oct-6-4']).toBe(2);
    expect(map['oct-5-3']).toBe(2);
    expect(map['oct-4-2']).toBe(3); // atravessa Sol–Si
    expect(map['oct-3-1']).toBe(3); // atravessa Sol–Si
    // pulando duas cordas
    expect(map['oct-6-3']).toBe(-3);
    expect(map['oct-5-2']).toBe(-2); // atravessa Sol–Si
    expect(map['oct-4-1']).toBe(-2); // atravessa Sol–Si
  });
  it('marca quais formas atravessam o par Sol–Si', () => {
    const cross = octaveShapes().filter((s) => s.crossesGB).map((s) => s.id).sort();
    expect(cross).toEqual(['oct-3-1', 'oct-4-1', 'oct-4-2', 'oct-5-2'].sort());
  });
  it('6ª e 1ª corda: mesma casa, duas oitavas', () => {
    expect(fretShift(6, 1, 2)).toBe(0);
  });
  it('Lá na casa 5 da 6ª corda: oitavas e uníssonos até a casa 12', () => {
    const a = positionAt(6, 5);
    const oct = octavePositions(a, 12).map((p) => `${p.string}:${p.fret}`).sort();
    expect(oct).toEqual(['1:5', '2:10', '3:2', '4:7', '5:12'].sort());
    const uni = unisonPositions(a, 12).map((p) => `${p.string}:${p.fret}`);
    expect(uni).toEqual(['5:0']);
  });
  it('mesma nota na corda vizinha: 5 casas, ou 4 entre Sol e Si', () => {
    expect(midiAt(6, 5)).toBe(midiAt(5, 0));
    expect(midiAt(3, 4)).toBe(midiAt(2, 0));
    expect(midiAt(2, 5)).toBe(midiAt(1, 0));
  });
  it('localiza todas as casas de uma nota numa corda', () => {
    expect(fretsOfPcOnString(0, 5, 22)).toEqual([3, 15]); // Dó na 5ª corda
    expect(fretsOfPcOnString(4, 1, 24)).toEqual([0, 12, 24]);
  });
  it('cada classe aparece o mesmo número de vezes por corda em 12 casas', () => {
    const counts = new Array(12).fill(0);
    for (const p of allPositions(11)) counts[p.pc]++;
    expect(counts.every((c) => c === 6)).toBe(true);
  });
});

describe('escalas', () => {
  const names = (root: string, id: string) => scaleNotes(parseNote(root), SCALES[id]).map((n) => asEn(n.note));
  it('maiores com grafia correta', () => {
    expect(names('C', 'major')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    expect(names('G', 'major')).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
    expect(names('F', 'major')).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E']);
    expect(names('Eb', 'major')).toEqual(['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D']);
    expect(names('E', 'major')).toEqual(['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#']);
  });
  it('menores naturais', () => {
    expect(names('A', 'naturalMinor')).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    expect(names('E', 'naturalMinor')).toEqual(['E', 'F#', 'G', 'A', 'B', 'C', 'D']);
    expect(names('C', 'naturalMinor')).toEqual(['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb']);
  });
  it('pentatônicas', () => {
    expect(names('A', 'minorPentatonic')).toEqual(['A', 'C', 'D', 'E', 'G']);
    expect(names('E', 'minorPentatonic')).toEqual(['E', 'G', 'A', 'B', 'D']);
    expect(names('C', 'majorPentatonic')).toEqual(['C', 'D', 'E', 'G', 'A']);
    expect(names('G', 'majorPentatonic')).toEqual(['G', 'A', 'B', 'D', 'E']);
  });
  it('relativas: Dó maior pentatônica e Lá menor pentatônica têm as mesmas notas', () => {
    expect(new Set(names('C', 'majorPentatonic'))).toEqual(new Set(names('A', 'minorPentatonic')));
  });
  it('transposição preserva os intervalos', () => {
    for (let pc = 0; pc < 12; pc++) {
      for (const id of Object.keys(SCALES)) {
        const root = conventionalRoot(pc, 'major');
        const notes = scaleNotes(root, SCALES[id]);
        notes.forEach((n, i) => expect((n.pc - pc + 12) % 12).toBe(SCALES[id].degrees[i].semitones));
        // uma letra por grau nas escalas de 7 notas
        if (notes.length === 7) expect(new Set(notes.map((n) => n.note.letter)).size).toBe(7);
      }
    }
  });
});

describe('boxes da pentatônica', () => {
  const frets = (b: ReturnType<typeof pentatonicBox>) => b.map((n) => `${n.string}:${n.fret}`).join(' ');
  it('Lá menor, box 1 (casa 5) — inclui o ajuste da corda Si', () => {
    expect(frets(pentatonicBox(9, 'minorPentatonic', 1))).toBe(
      '6:5 6:8 5:5 5:7 4:5 4:7 3:5 3:7 2:5 2:8 1:5 1:8',
    );
  });
  it('Lá menor, box 2', () => {
    expect(frets(pentatonicBox(9, 'minorPentatonic', 2))).toBe(
      '6:8 6:10 5:7 5:10 4:7 4:10 3:7 3:9 2:8 2:10 1:8 1:10',
    );
  });
  it('Lá menor, boxes 3, 4 e 5', () => {
    expect(frets(pentatonicBox(9, 'minorPentatonic', 3))).toBe('6:10 6:12 5:10 5:12 4:10 4:12 3:9 3:12 2:10 2:13 1:10 1:12');
    expect(frets(pentatonicBox(9, 'minorPentatonic', 4))).toBe('6:12 6:15 5:12 5:15 4:12 4:14 3:12 3:14 2:13 2:15 1:12 1:15');
    expect(frets(pentatonicBox(9, 'minorPentatonic', 5))).toBe('6:3 6:5 5:3 5:5 4:2 4:5 3:2 3:5 2:3 2:5 1:3 1:5');
  });
  it('Mi menor, box 1 em posição aberta', () => {
    expect(frets(pentatonicBox(4, 'minorPentatonic', 1))).toBe('6:0 6:3 5:0 5:2 4:0 4:2 3:0 3:2 2:0 2:3 1:0 1:3');
  });
  it('todas as notas pertencem à escala e as fundamentais estão marcadas', () => {
    for (let pc = 0; pc < 12; pc++) {
      for (let b = 1; b <= 5; b++) {
        for (const scale of ['minorPentatonic', 'majorPentatonic'] as const) {
          const box = pentatonicBox(pc, scale, b);
          expect(box).toHaveLength(12);
          const allowed = SCALES[scale].degrees.map((d) => (pc + d.semitones) % 12);
          for (const n of box) {
            expect(allowed).toContain(n.pc);
            expect(n.fret).toBeGreaterThanOrEqual(0);
            expect(n.midi).toBe(midiAt(n.string, n.fret));
            expect(n.isRoot).toBe(n.pc === pc);
          }
          // alturas estritamente crescentes
          for (let i = 1; i < box.length; i++) expect(box[i].midi).toBeGreaterThan(box[i - 1].midi);
          // desenho compacto: no máximo 4 casas de abertura
          const fs = box.map((n) => n.fret);
          expect(Math.max(...fs) - Math.min(...fs)).toBeLessThanOrEqual(4);
        }
      }
    }
  });
  it('box 1 da pentatônica maior de Dó = box 1 de Lá menor', () => {
    expect(frets(pentatonicBox(0, 'majorPentatonic', 1))).toBe(frets(pentatonicBox(9, 'minorPentatonic', 1)));
  });
});

describe('acordes', () => {
  const ns = (root: string, q: string) => chordNotes(parseNote(root), CHORD_QUALITIES[q]).map((n) => asEn(n.note));
  it('tríades', () => {
    expect(ns('C', 'major')).toEqual(['C', 'E', 'G']);
    expect(ns('A', 'minor')).toEqual(['A', 'C', 'E']);
    expect(ns('E', 'major')).toEqual(['E', 'G#', 'B']);
    expect(ns('Bb', 'major')).toEqual(['Bb', 'D', 'F']);
    expect(ns('B', 'dim')).toEqual(['B', 'D', 'F']);
    expect(ns('C', 'aug')).toEqual(['C', 'E', 'G#']);
    expect(ns('F#', 'minor')).toEqual(['F#', 'A', 'C#']);
    expect(ns('E', 'power')).toEqual(['E', 'B']);
  });
  it('tétrades', () => {
    expect(ns('G', 'dom7')).toEqual(['G', 'B', 'D', 'F']);
    expect(ns('C', 'maj7')).toEqual(['C', 'E', 'G', 'B']);
    expect(ns('B', 'm7b5')).toEqual(['B', 'D', 'F', 'A']);
  });
  it('identifica a qualidade pelos intervalos', () => {
    expect(identifyQuality([0, 4, 7])?.id).toBe('major');
    expect(identifyQuality([0, 3, 7])?.id).toBe('minor');
    expect(identifyQuality([0, 4, 7, 10])?.id).toBe('dom7');
  });
});

describe('campo harmônico', () => {
  const sym = (root: string, mode: 'major' | 'naturalMinor', size: 3 | 4 = 3) =>
    harmonicField(parseNote(root), mode, size).map((c) => asEn(c.root) + c.quality.symbol);
  it('Dó maior', () => {
    expect(sym('C', 'major')).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°']);
    expect(harmonicField(parseNote('C'), 'major').map((c) => c.roman)).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
  });
  it('Sol maior e Mi maior', () => {
    expect(sym('G', 'major')).toEqual(['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#°']);
    expect(sym('E', 'major')).toEqual(['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#°']);
  });
  it('Lá menor natural', () => {
    expect(sym('A', 'naturalMinor')).toEqual(['Am', 'B°', 'C', 'Dm', 'Em', 'F', 'G']);
  });
  it('tétrades em Dó maior', () => {
    expect(sym('C', 'major', 4)).toEqual(['C7M', 'Dm7', 'Em7', 'F7M', 'G7', 'Am7', 'Bm7(b5)']);
  });
  it('I–IV–V transposto para todas as tonalidades mantém a estrutura maior', () => {
    for (let pc = 0; pc < 12; pc++) {
      const prog = progressionChords(conventionalRoot(pc, 'major'), 'major', [1, 4, 5]);
      expect(prog.map((c) => c.quality.id)).toEqual(['major', 'major', 'major']);
      expect(prog.map((c) => (pcOf(c.root) - pc + 12) % 12)).toEqual([0, 5, 7]);
    }
  });
  it('I–IV–V em Sol: G, C, D', () => {
    expect(progressionChords(parseNote('G'), 'major', [1, 4, 5]).map((c) => asEn(c.root))).toEqual(['G', 'C', 'D']);
  });
});
