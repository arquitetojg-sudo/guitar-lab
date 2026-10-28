import { formatNote, isNaturalPc, LETTER_PT, midiAt, mod12, spellPc, type Naming } from '../music';

export interface Card {
  id: string;
  theme: string;
  front: string;
  back: string;
  /** Aula a partir da qual o card entra na revisão. */
  lessonId?: string;
  custom?: boolean;
}

export const CARD_THEMES = ['Cordas soltas', 'Notas no braço', 'Tons e semitons', 'Enarmonia', 'Oitavas', 'Relação entre cordas', 'Pessoais'];

const STRING_NAMES: Record<number, string> = { 6: 'Mi grave', 5: 'Lá', 4: 'Ré', 3: 'Sol', 2: 'Si', 1: 'Mi aguda' };
const LESSON_BY_STRING: Record<number, string> = { 6: 'f1-cordas-mi', 1: 'f1-cordas-mi', 5: 'f1-corda-la', 4: 'f1-cordas-internas', 3: 'f1-cordas-internas', 2: 'f1-cordas-internas' };

/** Cards de notas naturais, gerados pelo motor musical (casas 1–12). */
export function noteCards(naming: Naming): Card[] {
  const out: Card[] = [];
  for (const s of [6, 5, 4, 3, 2, 1]) {
    for (let f = 1; f <= 12; f++) {
      const pc = mod12(midiAt(s, f));
      if (!isNaturalPc(pc)) continue;
      out.push({
        id: `nota-${s}-${f}`,
        theme: 'Notas no braço',
        front: `Qual nota está na casa ${f} da ${s}ª corda (${STRING_NAMES[s]})?`,
        back: formatNote(spellPc(pc), naming === 'pt' ? 'both' : naming),
        lessonId: LESSON_BY_STRING[s],
      });
    }
  }
  return out;
}

export const CONCEPT_CARDS: Card[] = [
  { id: 'c-cordas', theme: 'Cordas soltas', lessonId: 'f1-afinacao', front: 'Nomes das cordas soltas, da 6ª para a 1ª', back: 'Mi, Lá, Ré, Sol, Si, Mi (E A D G B E)' },
  { id: 'c-excecao', theme: 'Cordas soltas', lessonId: 'f1-afinacao', front: 'Qual par de cordas vizinhas não está afinado em quarta justa?', back: 'Sol (3ª) e Si (2ª): estão a uma terça maior, 4 semitons.' },
  { id: 'c-afinar', theme: 'Relação entre cordas', lessonId: 'f1-afinacao', front: 'Em que casa uma corda tem o mesmo som da próxima corda solta (mais aguda)?', back: 'Casa 5. Na 3ª corda (Sol → Si), casa 4.' },
  { id: 'c-semitom', theme: 'Tons e semitons', lessonId: 'f1-cromatica', front: 'Quantas casas são 1 semitom? E 1 tom?', back: '1 casa = 1 semitom. 2 casas = 1 tom.' },
  { id: 'c-naturais', theme: 'Tons e semitons', lessonId: 'f1-cromatica', front: 'Entre quais notas naturais a distância é só 1 semitom?', back: 'Mi–Fá e Si–Dó.' },
  { id: 'c-12', theme: 'Tons e semitons', lessonId: 'f1-cromatica', front: 'O que acontece na casa 12?', back: 'A nota da corda solta se repete uma oitava acima (12 semitons).' },
  { id: 'c-enarm', theme: 'Enarmonia', lessonId: 'f1-acidentes', front: 'O que são notas enarmônicas? Dê um exemplo.', back: 'Mesmo som, nomes diferentes. Ex.: Fá♯ = Sol♭, Lá♯ = Si♭.' },
  { id: 'c-enarm-tom', theme: 'Enarmonia', lessonId: 'f1-acidentes', front: 'Como decidir entre Lá♯ e Si♭?', back: 'Pela tonalidade: cada letra aparece uma vez na escala. Em Fá maior é Si♭ (já existe Lá); em Si maior é Lá♯.' },
  { id: 'c-uni', theme: 'Relação entre cordas', lessonId: 'f1-unissono', front: 'Como achar a mesma nota (mesma altura) na corda vizinha mais grave?', back: '5 casas à frente. Da 2ª para a 3ª corda, 4 casas.' },
  { id: 'c-oit', theme: 'Oitavas', lessonId: 'f2-oitava-basica', front: 'Qual é a relação entre uma nota e sua oitava?', back: 'Mesma nota, 12 semitons acima: frequência dobrada, mesmo nome.' },
  { id: 'c-oit-64', theme: 'Oitavas', lessonId: 'f2-oitava-basica', front: 'Oitava da 6ª corda para a 4ª (ou 5ª para 3ª)', back: 'Pula uma corda, +2 casas.' },
  { id: 'c-oit-42', theme: 'Oitavas', lessonId: 'f2-oitava-sol-si', front: 'Oitava da 4ª corda para a 2ª (ou 3ª para 1ª)', back: 'Pula uma corda, +3 casas (ajuste Sol–Si).' },
  { id: 'c-oit-63', theme: 'Oitavas', lessonId: 'f2-oitava-longa', front: 'Oitava da 6ª corda para a 3ª', back: 'Pula duas cordas, −3 casas.' },
  { id: 'c-oit-52', theme: 'Oitavas', lessonId: 'f2-oitava-longa', front: 'Oitava da 5ª corda para a 2ª (ou 4ª para 1ª)', back: 'Pula duas cordas, −2 casas (ajuste Sol–Si).' },
  { id: 'c-oit-61', theme: 'Oitavas', lessonId: 'f2-oitava-longa', front: 'Relação entre a 6ª e a 1ª corda na mesma casa', back: 'Mesma nota, duas oitavas acima.' },
  { id: 'c-outra-regiao', theme: 'Relação entre cordas', lessonId: 'f2-mapa-oitavas', front: 'Como localizar a mesma nota em outra região do braço?', back: 'Use as oitavas (±2, ±3 casas pulando cordas) ou o uníssono na corda vizinha (+5 casas, +4 entre Sol e Si).' },
];

export function defaultCards(naming: Naming): Card[] {
  return [...CONCEPT_CARDS, ...noteCards(naming)];
}

/** Nome PT simples de uma letra — exportado para a UI. */
export const ptLetter = LETTER_PT;
