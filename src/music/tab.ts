import { midiAt, STANDARD_TUNING, type Tuning } from './fretboard';

/**
 * Frases em tablatura com ritmo e técnicas.
 *
 * Notação compacta (um token por evento, separados por espaço):
 *   `3:12`        corda 3, casa 12 (palhetada)
 *   `h3:14`       hammer-on vindo da nota anterior na mesma corda
 *   `p3:12`       pull-off
 *   `/3:14` `\3:12` slide subindo / descendo
 *   `2:13b2`      bend de 2 semitons (1 tom); `b1` = meio tom
 *   `2:13pb2`     pré-bend (já soa dobrada)
 *   `r2:13`       solta o bend até a casa marcada
 *   `~` no fim    vibrato
 *   `3:12+2:13`   duas notas juntas (double stop)
 *   `-`           pausa
 *   `|`           barra de compasso
 *   `@q`          duração (fica valendo para os próximos tokens):
 *                 w=4, h=2, q=1, q.=1.5, e=½, e.=¾, s=¼, t=⅓ (tercina), x=⅙ (sextina)
 *
 * A altura de cada nota é calculada pela afinação (MIDI = corda solta + casa).
 * O parser recusa técnicas impossíveis (hammer-on para uma casa mais grave, etc.).
 */

export type TabTech = 'pick' | 'hammer' | 'pull' | 'slideUp' | 'slideDown' | 'release';

export interface TabPos {
  string: number;
  fret: number;
}

export interface TabEvent {
  notes: TabPos[];
  /** Duração em tempos (semínima = 1). */
  dur: number;
  /** Início em tempos, contado desde o começo da frase. */
  start: number;
  /** Compasso (0, 1, …) e tempo dentro do compasso. */
  bar: number;
  beatInBar: number;
  tech: TabTech;
  /** Bend (semitons acima da casa pressionada). */
  bend?: number;
  prebend?: number;
  /** Para `release`: quanto estava dobrada antes de soltar. */
  releaseFrom?: number;
  vibrato?: boolean;
}

export interface Phrase {
  events: TabEvent[];
  bars: number;
  totalBeats: number;
}

const DURS: Record<string, number> = { w: 4, h: 2, q: 1, 'q.': 1.5, e: 0.5, 'e.': 0.75, s: 0.25, t: 1 / 3, x: 1 / 6 };

const TOKEN = /^([hp/\\r]?)(\d):(\d{1,2})((?:\+\d:\d{1,2})*)(pb[12]|b[12])?(~)?(?:@(w|h|q\.?|e\.?|s|t|x))?(~)?$/;
const REST = /^-(?:@(w|h|q\.?|e\.?|s|t|x))?$/;

const EPS = 1e-6;

export function parsePhrase(src: string, beatsPerBar = 4): Phrase {
  const events: TabEvent[] = [];
  let dur = 1;
  let t = 0;
  let bar = 0;
  let barStart = 0;
  const last = new Map<number, TabEvent>();
  for (const tok of src.trim().split(/\s+/)) {
    if (tok === '|') {
      const len = t - barStart;
      if (Math.abs(len - beatsPerBar) > EPS) throw new Error(`Compasso ${bar + 1} tem ${len.toFixed(2)} tempos (esperado ${beatsPerBar}).`);
      bar++;
      barStart = t;
      continue;
    }
    const rest = REST.exec(tok);
    if (rest) {
      if (rest[1]) dur = DURS[rest[1]];
      events.push({ notes: [], dur, start: t, bar, beatInBar: t - barStart, tech: 'pick' });
      t += dur;
      continue;
    }
    const m = TOKEN.exec(tok);
    if (!m) throw new Error(`Token inválido: "${tok}"`);
    const [, pre, s, f, extra, bendTok, vib1, d, vib2] = m;
    const vib = vib1 || vib2;
    if (d) dur = DURS[d];
    const notes: TabPos[] = [{ string: Number(s), fret: Number(f) }];
    for (const x of extra.split('+').filter(Boolean)) {
      const [es, ef] = x.split(':').map(Number);
      notes.push({ string: es, fret: ef });
    }
    for (const n of notes) {
      if (n.string < 1 || n.string > 6) throw new Error(`Corda inexistente em "${tok}"`);
    }
    const tech: TabTech = pre === 'h' ? 'hammer' : pre === 'p' ? 'pull' : pre === '/' ? 'slideUp' : pre === '\\' ? 'slideDown' : pre === 'r' ? 'release' : 'pick';
    const ev: TabEvent = { notes, dur, start: t, bar, beatInBar: t - barStart, tech };
    if (bendTok?.startsWith('pb')) ev.prebend = Number(bendTok.slice(2));
    else if (bendTok) ev.bend = Number(bendTok.slice(1));
    if (vib) ev.vibrato = true;
    if (tech !== 'pick') {
      if (notes.length > 1) throw new Error(`Ligado só em nota simples: "${tok}"`);
      const prev = last.get(notes[0].string);
      if (!prev) throw new Error(`"${tok}" precisa de uma nota anterior na mesma corda.`);
      const pf = prev.notes.find((n) => n.string === notes[0].string)!.fret;
      const fret = notes[0].fret;
      if ((tech === 'hammer' || tech === 'slideUp') && !(fret > pf)) throw new Error(`"${tok}": ${tech} precisa subir de casa (anterior ${pf}).`);
      if ((tech === 'pull' || tech === 'slideDown') && !(fret < pf)) throw new Error(`"${tok}": ${tech} precisa descer de casa (anterior ${pf}).`);
      if (tech === 'release') {
        const bent = prev.bend ?? prev.prebend;
        if (!bent || pf !== fret) throw new Error(`"${tok}": soltar exige um bend anterior na mesma casa.`);
        ev.releaseFrom = bent;
      }
      if (tech === 'hammer' || tech === 'pull') {
        if (prev.bend || prev.prebend) throw new Error(`"${tok}": ligado depois de bend não faz sentido aqui.`);
      }
    }
    for (const n of notes) last.set(n.string, ev);
    events.push(ev);
    t += dur;
  }
  const tail = t - barStart;
  if (tail > EPS && Math.abs(tail - beatsPerBar) > EPS) throw new Error(`Último compasso tem ${tail.toFixed(2)} tempos (esperado ${beatsPerBar}).`);
  const bars = tail > EPS ? bar + 1 : bar;
  return { events, bars, totalBeats: t };
}

/** Altura (MIDI) que cada nota do evento soa no ataque e no fim. */
export function eventPitches(ev: TabEvent, tuning: Tuning = STANDARD_TUNING): { start: number; end: number }[] {
  return ev.notes.map((n) => {
    const base = midiAt(n.string, n.fret, tuning);
    if (ev.prebend) return { start: base + ev.prebend, end: base + ev.prebend };
    if (ev.bend) return { start: base, end: base + ev.bend };
    if (ev.releaseFrom) return { start: base + ev.releaseFrom, end: base };
    return { start: base, end: base };
  });
}

/** Todas as posições pressionadas (sem repetição), na ordem em que aparecem. */
export function phrasePositions(p: Phrase): TabPos[] {
  const seen = new Set<string>();
  const out: TabPos[] = [];
  for (const ev of p.events) {
    for (const n of ev.notes) {
      const k = `${n.string}:${n.fret}`;
      if (!seen.has(k)) {
        seen.add(k);
        out.push(n);
      }
    }
  }
  return out;
}

const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];

function cellText(ev: TabEvent, n: TabPos): string {
  const f = String(n.fret);
  const pre = { pick: '', hammer: 'h', pull: 'p', slideUp: '/', slideDown: '\\', release: 'r' }[ev.tech];
  let s = pre + f;
  if (ev.bend) s += `b${n.fret + ev.bend}`;
  if (ev.prebend) s = `${f}pb${n.fret + ev.prebend}`;
  if (ev.vibrato) s += '~';
  return s;
}

/**
 * Tablatura em texto. O espaço depois de cada nota é proporcional à duração,
 * e a linha de baixo mostra a contagem dos tempos (1 2 3 4).
 */
export function phraseTab(p: Phrase, maxWidth = 46): string {
  type Col = { cells: string[]; count: string; width: number };
  const barsCols: Col[][] = [[]];
  for (const ev of p.events) {
    while (barsCols.length <= ev.bar) barsCols.push([]);
    const cells = STRING_NAMES.map((_, i) => {
      const n = ev.notes.find((x) => x.string === i + 1);
      return n ? cellText(ev, n) : '';
    });
    const content = Math.max(1, ...cells.map((c) => c.length));
    const width = content + Math.max(1, Math.round(ev.dur * 4));
    const onBeat = Math.abs(ev.beatInBar - Math.round(ev.beatInBar)) < EPS;
    const count = onBeat ? String(Math.round(ev.beatInBar) + 1) : '';
    barsCols[ev.bar].push({ cells, count, width });
  }
  const renderBar = (cols: Col[]) => {
    const lines = STRING_NAMES.map(() => '-');
    let count = ' ';
    for (const c of cols) {
      c.cells.forEach((cell, i) => (lines[i] += cell.padEnd(c.width, '-')));
      count += c.count.padEnd(c.width, ' ');
    }
    return { lines, count };
  };
  const blocks: string[] = [];
  let cur: { lines: string[]; count: string } | null = null;
  const flush = () => {
    if (!cur) return;
    blocks.push([...cur.lines.map((l, i) => `${STRING_NAMES[i]}|${l}|`), `  ${cur.count.trimEnd()}`].join('\n'));
    cur = null;
  };
  for (const cols of barsCols) {
    const b = renderBar(cols);
    if (cur && cur.lines[0].length + 1 + b.lines[0].length > maxWidth) flush();
    if (!cur) cur = b;
    else {
      const c: { lines: string[]; count: string } = cur;
      cur = { lines: c.lines.map((l, i) => `${l}|${b.lines[i]}`), count: `${c.count.padEnd(c.lines[0].length + 1, ' ')}${b.count}` };
    }
  }
  flush();
  return blocks.join('\n\n');
}

/**
 * Converte tempo "reto" em tempo com swing de shuffle: cada tempo vira uma
 * tercina, e a colcheia do contratempo cai no último terço (2/3 do tempo).
 */
export function swingBeat(beat: number): number {
  const b = Math.floor(beat + EPS);
  const f = Math.max(0, beat - b);
  return f <= 0.5 ? b + f * (4 / 3) : b + 2 / 3 + (f - 0.5) * (2 / 3);
}

/** Início e fim (em segundos) de cada evento, no andamento e na levada dados. */
export function eventTimes(p: Phrase, bpm: number, feel: 'straight' | 'shuffle' = 'straight'): { start: number; end: number }[] {
  const spb = 60 / bpm;
  const map = feel === 'shuffle' ? swingBeat : (x: number) => x;
  return p.events.map((ev) => ({ start: map(ev.start) * spb, end: map(ev.start + ev.dur) * spb }));
}
