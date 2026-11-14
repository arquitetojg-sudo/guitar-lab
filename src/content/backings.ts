import { CHORD_QUALITIES, chordNotes, chordSymbol, parseNote, pcOf, type ChordQuality, type SpelledNote } from '../music';

/**
 * Bases originais para improvisar com a pentatônica de Sol menor.
 * Só a progressão e o estilo são dados; o áudio (bateria, baixo, acordes) é
 * sintetizado no app e as notas de cada acorde são calculadas pela fórmula.
 */

export type BackingStyle = 'rock' | 'shuffle' | 'balada' | 'groove';

export interface BackingChord {
  root: SpelledNote;
  quality: ChordQuality;
}

export interface Backing {
  id: string;
  title: string;
  style: BackingStyle;
  bpm: number;
  level: 1 | 2 | 3;
  /** Um acorde por compasso, em loop. */
  bars: BackingChord[];
  about: string;
  tips: string[];
}

const c = (name: string): BackingChord => {
  const m = /^([A-G][b#]?)(.*)$/.exec(name);
  if (!m) throw new Error(`Cifra inválida: ${name}`);
  const suffix: Record<string, string> = { '': 'major', m: 'minor', m7: 'm7', '7': 'dom7', '5': 'power' };
  const q = suffix[m[2]];
  if (!q) throw new Error(`Cifra não suportada: ${name}`);
  return { root: parseNote(m[1]), quality: CHORD_QUALITIES[q] };
};
const bars = (s: string) => s.trim().split(/\s+/).map(c);

export const BACKINGS: Backing[] = [
  {
    id: 'groove-gm',
    title: 'Groove em Gm7 (um acorde só)',
    style: 'groove',
    bpm: 90,
    level: 1,
    bars: bars('Gm7 Gm7'),
    about: 'Um acorde o tempo todo: nenhuma nota da pentatônica de Sol menor soa errada. É a base para experimentar sem medo.',
    tips: [
      'Use só o box 1 por alguns minutos, depois só o box 3. Repare que a sensação muda.',
      'Desafio: improvise só com três notas (Sol, Si♭, Ré) e varie o ritmo.',
    ],
  },
  {
    id: 'rock-gm-f-eb',
    title: 'Rock menor Gm – F – E♭ – F',
    style: 'rock',
    bpm: 100,
    level: 1,
    bars: bars('Gm F Eb F'),
    about: 'i – VII – VI – VII do campo de Sol menor. Os três acordes são do tom, então a pentatônica de Sol menor serve na base inteira.',
    tips: [
      'No Gm, termine frases no Sol ou no Ré. No F, o Fá e o Dó soam “em casa”.',
      'No E♭ não existe a tônica do acorde (Mi♭) na pentatônica: mire o Sol ou o Si♭, que estão no acorde.',
    ],
  },
  {
    id: 'blues-menor',
    title: 'Blues menor em Sol (12 compassos)',
    style: 'shuffle',
    bpm: 72,
    level: 2,
    bars: bars('Gm7 Gm7 Gm7 Gm7 Cm7 Cm7 Gm7 Gm7 Eb7 D7 Gm7 D7'),
    about: 'i – iv – V do blues menor, com o E♭7 chegando no D7. É a casa natural dos licks de B.B. King, Clapton e SRV desta seção.',
    tips: [
      'No Cm7, o Dó e o Si♭ da pentatônica são notas do acorde: bom lugar para o bend Si♭ → Dó.',
      'O D7 tem Fá♯, que não está na pentatônica. Nele, evite parar no Fá; prefira o Ré (tônica do acorde) ou o Dó.',
    ],
  },
  {
    id: 'blues-shuffle',
    title: 'Blues shuffle em Sol (G7 – C7 – D7)',
    style: 'shuffle',
    bpm: 100,
    level: 2,
    bars: bars('G7 G7 G7 G7 C7 C7 G7 G7 D7 C7 G7 D7'),
    about: 'O blues de 12 compassos tradicional (I7 – IV7 – V7). A pentatônica menor por cima de acordes maiores com sétima é o som do blues e do rock clássico.',
    tips: [
      'O G7 tem Si natural; a pentatônica tem Si♭. Esse choque é o “sabor blues”: puxe o Si♭ um pouquinho para cima (meio bend) em vez de deixá-lo parado.',
      'Acompanhe a troca de acorde: no C7, mire o Dó; no D7, o Ré.',
    ],
  },
  {
    id: 'balada-gm',
    title: 'Balada Gm – E♭ – B♭ – F',
    style: 'balada',
    bpm: 70,
    level: 1,
    bars: bars('Gm Eb Bb F'),
    about: 'i – VI – III – VII em andamento lento. Espaço de sobra para notas longas, bends e vibrato.',
    tips: [
      'Toque menos notas: uma nota longa com vibrato por acorde já é um solo.',
      'No B♭, o Si♭, o Ré e o Fá da pentatônica são notas do acorde.',
    ],
  },
  {
    id: 'rock-power',
    title: 'Hard rock G5 – B♭5 – C5 – G5',
    style: 'rock',
    bpm: 112,
    level: 2,
    bars: bars('G5 Bb5 C5 G5'),
    about: 'i – III – IV em power chords, o motor do hard rock. Sem terça nos acordes, a pentatônica menor encaixa sem nenhum choque.',
    tips: [
      'Bom lugar para os licks de Angus Young e Slash (box 4).',
      'Repita o mesmo lick em cada acorde e ouça como ele muda de “cor”.',
    ],
  },
];

export const STYLE_LABEL: Record<BackingStyle, string> = {
  rock: 'Rock',
  shuffle: 'Shuffle',
  balada: 'Balada',
  groove: 'Groove',
};

export const chordName = (ch: BackingChord) => chordSymbol(ch.root, ch.quality);
export const chordPcs = (ch: BackingChord) => chordNotes(ch.root, ch.quality).map((n) => n.pc);
export const chordRootPc = (ch: BackingChord) => pcOf(ch.root);
