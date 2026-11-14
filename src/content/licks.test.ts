import { describe, expect, it } from 'vitest';
import { eventPitches, eventTimes, parsePhrase, phrasePositions, phraseTab, swingBeat } from '../music/tab';
import { midiAt, mod12, pentatonicBox, noteNameEn, chordNotes } from '../music';
import { LICKS, KEY_PC } from './licks';
import { BACKINGS, chordName } from './backings';
import { bassMidi, chordVoicing } from '../ui/phrasePlayer';

describe('notação de tablatura (gabarito à mão)', () => {
  it('lê notas, durações, técnicas e compassos', () => {
    const p = parsePhrase('3:5@e h3:7 2:8b2@q~ r2:8@e 2:6 3:7@q | 1:3+2:3@w');
    expect(p.bars).toBe(2);
    expect(p.totalBeats).toBe(8);
    expect(p.events.map((e) => e.tech)).toEqual(['pick', 'hammer', 'pick', 'release', 'pick', 'pick', 'pick']);
    expect(p.events.map((e) => e.start)).toEqual([0, 0.5, 1, 2, 2.5, 3, 4]);
    expect(p.events[2].bend).toBe(2);
    expect(p.events[2].vibrato).toBe(true);
    expect(p.events[3].releaseFrom).toBe(2);
    expect(p.events[6].notes).toEqual([{ string: 1, fret: 3 }, { string: 2, fret: 3 }]);
    expect(p.events[6].bar).toBe(1);
  });
  it('altura do bend e do pré-bend', () => {
    const p = parsePhrase('2:8b2@q 2:13pb2 r2:13 1:3@q');
    // 2:8 = Sol (67); bend de 1 tom → Lá (69). 2:13 = Dó (72); pré-bend → Ré (74).
    expect(eventPitches(p.events[0])).toEqual([{ start: 67, end: 69 }]);
    expect(eventPitches(p.events[1])).toEqual([{ start: 74, end: 74 }]);
    expect(eventPitches(p.events[2])).toEqual([{ start: 74, end: 72 }]);
  });
  it('recusa técnicas impossíveis e compassos errados', () => {
    expect(() => parsePhrase('3:7@q h3:5 3:5@h')).toThrow(/subir/);
    expect(() => parsePhrase('3:5@q p3:7 3:5@h')).toThrow(/descer/);
    expect(() => parsePhrase('3:5@q r3:5 3:5@h')).toThrow(/bend/);
    expect(() => parsePhrase('h3:5@w')).toThrow(/anterior/);
    expect(() => parsePhrase('3:5@q 3:5 | 3:5@w')).toThrow(/Compasso 1/);
    expect(() => parsePhrase('3:5@q')).toThrow(/Último/);
    expect(() => parsePhrase('7:5@w')).toThrow(/Corda/);
  });
  it('desenha a tablatura com técnicas e contagem', () => {
    const tab = phraseTab(parsePhrase('3:5@q h3:7 2:8b2@h~'));
    expect(tab).toBe(
      [
        'e|-------------------------|',
        'B|------------8b10~--------|',
        'G|-5----h7-----------------|',
        'D|-------------------------|',
        'A|-------------------------|',
        'E|-------------------------|',
        '   1    2     3',
      ].join('\n'),
    );
  });
  it('swing do shuffle', () => {
    expect(swingBeat(0)).toBe(0);
    expect(swingBeat(0.5)).toBeCloseTo(2 / 3);
    expect(swingBeat(1)).toBe(1);
    expect(swingBeat(2.5)).toBeCloseTo(2 + 2 / 3);
    const t = eventTimes(parsePhrase('3:5@e 3:5 3:5@h.'.replace('h.', 'q') + ' 3:5@h'), 60, 'shuffle');
    expect(t.map((x) => +x.start.toFixed(3))).toEqual([0, 0.667, 1, 2]);
  });
});

describe('licks: tudo na pentatônica de Sol menor, até a casa 14', () => {
  const PENTA = new Set([0, 3, 5, 7, 10]); // 1 b3 4 5 b7 a partir de Sol
  it('ids únicos e base sugerida existente', () => {
    expect(new Set(LICKS.map((l) => l.id)).size).toBe(LICKS.length);
    const bases = new Set(BACKINGS.map((b) => b.id));
    for (const l of LICKS) if (l.base) expect(bases.has(l.base), l.id).toBe(true);
  });
  for (const l of LICKS) {
    it(`${l.id}`, () => {
      const p = parsePhrase(l.tab);
      const allowed = new Set([...PENTA, ...(l.extras ?? [])]);
      const usedExtras = new Set<number>();
      for (const ev of p.events) {
        for (const n of ev.notes) expect(n.fret, `${l.id} casa`).toBeLessThanOrEqual(14);
        for (const pt of eventPitches(ev)) {
          for (const m of [pt.start, pt.end]) {
            const deg = mod12(m - KEY_PC);
            expect(allowed.has(deg), `${l.id}: nota fora da escala (${deg})`).toBe(true);
            if (!PENTA.has(deg)) usedExtras.add(deg);
          }
        }
      }
      // nota extra declarada precisa aparecer (e só ela)
      expect([...usedExtras].sort()).toEqual([...(l.extras ?? [])].sort());
      // posições dentro dos boxes declarados (cordas soltas à parte)
      const box = new Set(l.boxes.flatMap((b) => pentatonicBox(KEY_PC, 'minorPentatonic', b).map((x) => `${x.string}:${x.fret}`)));
      for (const pos of phrasePositions(p)) {
        if (pos.fret === 0) continue;
        if (!PENTA.has(mod12(midiAt(pos.string, pos.fret) - KEY_PC))) continue;
        expect(box.has(`${pos.string}:${pos.fret}`), `${l.id}: ${pos.string}:${pos.fret} fora dos boxes ${l.boxes}`).toBe(true);
      }
      expect(phraseTab(p)).toContain('e|');
    });
  }
  it('os boxes de Sol menor caem onde o violão alcança (gabarito)', () => {
    const frets = (b: number) => pentatonicBox(KEY_PC, 'minorPentatonic', b).filter((x) => x.string === 6).map((x) => x.fret);
    expect(frets(1)).toEqual([3, 6]);
    expect(frets(2)).toEqual([6, 8]);
    expect(frets(3)).toEqual([8, 10]);
    expect(frets(4)).toEqual([10, 13]);
  });
});

describe('bases (gabarito à mão)', () => {
  const spell = (id: string, bar: number) => {
    const ch = BACKINGS.find((b) => b.id === id)!.bars[bar];
    return chordNotes(ch.root, ch.quality).map((n) => noteNameEn(n.note)).join(' ');
  };
  it('cifras e notas dos acordes', () => {
    expect(BACKINGS.find((b) => b.id === 'blues-menor')!.bars.map(chordName).join(' ')).toBe('Gm7 Gm7 Gm7 Gm7 Cm7 Cm7 Gm7 Gm7 E♭7 D7 Gm7 D7');
    expect(spell('blues-menor', 0)).toBe('G B♭ D F');
    expect(spell('blues-menor', 4)).toBe('C E♭ G B♭');
    expect(spell('blues-menor', 8)).toBe('E♭ G B♭ D♭');
    expect(spell('blues-menor', 9)).toBe('D F♯ A C');
    expect(spell('blues-shuffle', 0)).toBe('G B D F');
    expect(spell('blues-shuffle', 4)).toBe('C E G B♭');
    expect(spell('rock-gm-f-eb', 2)).toBe('E♭ G B♭');
    expect(spell('balada-gm', 2)).toBe('B♭ D F');
  });
  it('alturas do baixo e dos acordes', () => {
    const b = (id: string, bar: number) => BACKINGS.find((x) => x.id === id)!.bars[bar];
    expect(bassMidi(b('groove-gm', 0), 0)).toBe(43); // Sol 2
    expect(bassMidi(b('blues-shuffle', 0), 9)).toBe(52); // 6ª de Sol = Mi
    expect(bassMidi(b('blues-menor', 0), 9)).toBe(53); // em Gm7 vira b7 = Fá
    expect(chordVoicing(b('rock-gm-f-eb', 0))).toEqual([55, 58, 62]); // G3 B♭3 D4
    expect(chordVoicing(b('rock-gm-f-eb', 2))).toEqual([63, 67, 70]); // E♭4 G4 B♭4
    expect(chordVoicing(b('rock-power', 0))).toEqual([43, 50, 55]); // G2 D3 G3
  });
});
