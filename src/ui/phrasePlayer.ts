import { midiAt, type Instrument } from '../music/fretboard';
import { eventTimes, type Phrase } from '../music/tab';
import { getAudio, pluckBuffer } from './audio';
import type { Backing, BackingChord, BackingStyle } from '../content/backings';
import { chordRootPc } from '../content/backings';
import { mod12 } from '../music';

/**
 * Reprodução sintetizada de frases (com bend, ligados, slide e vibrato) e de
 * bases (bateria, baixo e acordes). Tudo gerado no navegador.
 */

let bus: { ac: AudioContext; node: AudioNode } | null = null;
function output(ac: AudioContext): AudioNode {
  if (bus?.ac === ac) return bus.node;
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 4;
  const g = ac.createGain();
  g.gain.value = 0.9;
  comp.connect(g).connect(ac.destination);
  bus = { ac, node: comp };
  return comp;
}

interface Voice {
  src: AudioBufferSourceNode;
  gain: GainNode;
  end: number;
  lfo?: OscillatorNode;
}

export interface PhraseHandle {
  stop: () => void;
}

/** Toca a frase; `onEvent(i)` avisa qual evento está soando (−1 no fim). */
export function playPhrase(
  phrase: Phrase,
  opts: { bpm: number; feel: 'straight' | 'shuffle'; instrument: Instrument; loop?: boolean; onEvent?: (i: number) => void },
): PhraseHandle | null {
  const ac = getAudio();
  if (!ac) return null;
  const out = output(ac);
  const timers: number[] = [];
  const voices: Voice[] = [];
  let stopped = false;
  const times = eventTimes(phrase, opts.bpm, opts.feel);
  const total = (phrase.totalBeats * 60) / opts.bpm;

  const at = (t: number, fn: () => void) => {
    timers.push(window.setTimeout(() => !stopped && fn(), Math.max(0, (t - ac.currentTime) * 1000)));
  };

  const run = (t0: number) => {
    const live = new Map<number, Voice>();
    const mine: Voice[] = [];
    phrase.events.forEach((ev, i) => {
      const start = t0 + times[i].start;
      const end = t0 + times[i].end;
      const len = end - start;
      at(start, () => opts.onEvent?.(i));
      for (const n of ev.notes) {
        const prev = live.get(n.string);
        if (ev.tech === 'release' && prev) {
          // a nota continua soando; só desce a afinação
          const from = (ev.releaseFrom ?? 0) * 100;
          prev.src.detune.setValueAtTime(from, start);
          prev.src.detune.linearRampToValueAtTime(0, start + Math.min(0.16, len * 0.6));
          prev.end = end;
          continue;
        }
        if (prev) prev.end = Math.min(prev.end, start);
        const midi = midiAt(n.string, n.fret);
        const src = ac.createBufferSource();
        src.buffer = pluckBuffer(ac, midi, opts.instrument);
        const gain = ac.createGain();
        const legato = ev.tech !== 'pick';
        gain.gain.setValueAtTime((legato ? 0.5 : 0.8) / Math.sqrt(ev.notes.length), start);
        src.connect(gain).connect(out);
        if (ev.tech === 'slideUp' || ev.tech === 'slideDown') {
          const fromCents = (prevFret(phrase, i, n.string) - n.fret) * 100;
          src.detune.setValueAtTime(fromCents, start);
          src.detune.linearRampToValueAtTime(0, start + Math.min(0.09, len * 0.5));
        }
        if (ev.prebend) src.detune.setValueAtTime(ev.prebend * 100, start);
        if (ev.bend) {
          src.detune.setValueAtTime(0, start + 0.03);
          src.detune.linearRampToValueAtTime(ev.bend * 100, start + 0.03 + Math.min(0.2, len * 0.45));
        }
        const v: Voice = { src, gain, end };
        if (ev.vibrato) {
          const lfo = ac.createOscillator();
          lfo.frequency.value = 5.5;
          const depth = ac.createGain();
          depth.gain.setValueAtTime(0, start);
          depth.gain.linearRampToValueAtTime(32, start + Math.min(0.35, len * 0.5));
          lfo.connect(depth).connect(src.detune);
          lfo.start(start);
          v.lfo = lfo;
        }
        src.start(start);
        live.set(n.string, v);
        mine.push(v);
      }
    });
    for (const v of mine) {
      const end = v.end + 0.04;
      v.gain.gain.setTargetAtTime(0, end, 0.03);
      v.src.stop(end + 0.4);
      v.lfo?.stop(end + 0.4);
      voices.push(v);
    }
  };

  let t0 = ac.currentTime + 0.08;
  run(t0);
  const scheduleNext = () => {
    const next = t0 + total;
    if (opts.loop) {
      at(next - 0.25, () => {
        t0 = next;
        run(t0);
        scheduleNext();
      });
    } else {
      at(next + 0.2, () => opts.onEvent?.(-1));
    }
  };
  scheduleNext();

  return {
    stop() {
      stopped = true;
      timers.forEach((t) => window.clearTimeout(t));
      const now = ac.currentTime;
      for (const v of voices) {
        try {
          v.gain.gain.cancelScheduledValues(now);
          v.gain.gain.setTargetAtTime(0, now, 0.02);
          v.src.stop(now + 0.1);
          v.lfo?.stop(now + 0.1);
        } catch {
          /* já parou */
        }
      }
      opts.onEvent?.(-1);
    },
  };
}

/** Casa da nota anterior na mesma corda (para calcular de onde o slide parte). */
function prevFret(phrase: Phrase, i: number, string: number): number {
  for (let k = i - 1; k >= 0; k--) {
    const n = phrase.events[k].notes.find((x) => x.string === string);
    if (n) return n.fret;
  }
  return 0;
}

/* ---------------- Bases ---------------- */

interface StylePattern {
  /** 8 colcheias por compasso. */
  kick: number[];
  snare: number[];
  hat: number[];
  /** Baixo: semitons acima da fundamental em cada colcheia (null = nada), e duração em colcheias. */
  bass: (number | null)[];
  bassLen: number;
  /** Acorde: 'ring' (soa) ou 'hit' (curto). */
  comp: (null | 'ring' | 'hit')[];
  swing: boolean;
}

const PATTERNS: Record<BackingStyle, StylePattern> = {
  rock: {
    kick: [1, 0, 0, 1, 1, 0, 0, 0], snare: [0, 0, 1, 0, 0, 0, 1, 0], hat: [1, 1, 1, 1, 1, 1, 1, 1],
    bass: [0, 0, 0, 0, 0, 0, 0, 0], bassLen: 1,
    comp: ['ring', null, null, 'hit', 'ring', null, 'hit', null], swing: false,
  },
  shuffle: {
    kick: [1, 0, 0, 0, 1, 0, 0, 0], snare: [0, 0, 1, 0, 0, 0, 1, 0], hat: [1, 1, 1, 1, 1, 1, 1, 1],
    bass: [0, null, 7, null, 9, null, 7, null], bassLen: 2,
    comp: [null, null, 'hit', null, null, null, 'hit', null], swing: true,
  },
  balada: {
    kick: [1, 0, 0, 0, 0, 1, 0, 0], snare: [0, 0, 0, 0, 1, 0, 0, 0], hat: [1, 0, 1, 0, 1, 0, 1, 0],
    bass: [0, null, null, null, 7, null, null, null], bassLen: 4,
    comp: ['ring', null, null, null, 'ring', null, null, null], swing: false,
  },
  groove: {
    kick: [1, 0, 0, 1, 0, 1, 0, 0], snare: [0, 0, 1, 0, 0, 0, 1, 0], hat: [1, 1, 1, 1, 1, 1, 1, 1],
    bass: [0, null, 12, 0, null, 10, 7, null], bassLen: 1,
    comp: [null, 'hit', null, 'hit', null, 'hit', null, 'hit'], swing: false,
  },
};

/** Notas do baixo para um acorde: fundamental entre Mi1 (40) e Ré♯2 (51). */
export function bassMidi(ch: BackingChord, offset: number): number {
  const root = 40 + mod12(chordRootPc(ch) - 4);
  // no shuffle sobre acorde menor, a 6ª maior vira 7ª menor
  if (offset === 9 && ch.quality.tones.some((t) => t.semitones === 3)) offset = 10;
  return root + offset;
}

/** Voicing fechado do acorde, com a fundamental entre Mi3 (52) e Ré♯4 (63). */
export function chordVoicing(ch: BackingChord): number[] {
  const root = 52 + mod12(chordRootPc(ch) - 4);
  if (ch.quality.id === 'power') return [root - 12, root - 5, root];
  return ch.quality.tones.map((t) => root + t.semitones);
}

let noise: AudioBuffer | null = null;
function noiseBuffer(ac: AudioContext) {
  if (noise && noise.sampleRate === ac.sampleRate) return noise;
  const b = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  noise = b;
  return b;
}

export class BackingPlayer {
  bpm = 90;
  onBar?: (bar: number) => void;
  instrument: Instrument = 'guitarra';
  private timer: number | null = null;
  private timeouts: number[] = [];
  private backing: Backing | null = null;

  get running() {
    return this.timer !== null;
  }

  start(backing: Backing) {
    const ac = getAudio();
    if (!ac) return;
    this.stop();
    this.backing = backing;
    const out = output(ac);
    const pat = PATTERNS[backing.style];
    let step = 0;
    let next = ac.currentTime + 0.1;
    const tick = () => {
      const b = this.backing;
      if (!b) return;
      while (next < ac.currentTime + 0.15) {
        const spb = 60 / this.bpm;
        const i = step % 8;
        const bar = Math.floor(step / 8);
        const ch = b.bars[bar % b.bars.length];
        const stepLen = pat.swing ? (i % 2 === 0 ? (2 / 3) * spb : (1 / 3) * spb) : spb / 2;
        if (i === 0) {
          const barIdx = bar % b.bars.length;
          this.timeouts.push(window.setTimeout(() => this.onBar?.(barIdx), Math.max(0, (next - ac.currentTime) * 1000)));
        }
        if (pat.kick[i]) this.kick(ac, out, next);
        if (pat.snare[i]) this.snare(ac, out, next);
        if (pat.hat[i]) this.hat(ac, out, next, i % 2 === 0 ? 0.11 : 0.07);
        const bo = pat.bass[i];
        if (bo !== null) this.pluck(ac, out, bassMidi(ch, bo), next, (pat.bassLen * spb) / 2, 0.75, 'violao', 700);
        const cp = pat.comp[i];
        if (cp) {
          const len = cp === 'ring' ? spb * 1.8 : spb * 0.22;
          chordVoicing(ch).forEach((m, k) => this.pluck(ac, out, m, next + k * 0.012, len, 0.28, this.instrument, 3200));
        }
        next += stepLen;
        step++;
      }
    };
    tick();
    this.timer = window.setInterval(tick, 25);
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.timeouts.forEach((t) => window.clearTimeout(t));
    this.timeouts = [];
    this.backing = null;
  }

  private pluck(ac: AudioContext, out: AudioNode, midi: number, t: number, len: number, vol: number, inst: Instrument, cutoff: number) {
    const src = ac.createBufferSource();
    src.buffer = pluckBuffer(ac, midi, inst);
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = cutoff;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.setTargetAtTime(0, t + len, 0.04);
    src.connect(f).connect(g).connect(out);
    src.start(t);
    src.stop(t + len + 0.3);
  }

  private kick(ac: AudioContext, out: AudioNode, t: number) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.32);
  }

  private snare(ac: AudioContext, out: AudioNode, t: number) {
    const n = ac.createBufferSource();
    n.buffer = noiseBuffer(ac);
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1400;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.38, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    n.connect(hp).connect(g).connect(out);
    n.start(t);
    n.stop(t + 0.2);
    const o = ac.createOscillator();
    o.type = 'triangle';
    o.frequency.value = 185;
    const og = ac.createGain();
    og.gain.setValueAtTime(0.3, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    o.connect(og).connect(out);
    o.start(t);
    o.stop(t + 0.1);
  }

  private hat(ac: AudioContext, out: AudioNode, t: number, vol: number) {
    const n = ac.createBufferSource();
    n.buffer = noiseBuffer(ac);
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    n.connect(hp).connect(g).connect(out);
    n.start(t, Math.random() * 0.3);
    n.stop(t + 0.06);
  }
}
