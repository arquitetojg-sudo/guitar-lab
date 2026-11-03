import type { ChoiceItem } from '../learning/exercises';
import type { Lesson } from './types';

/**
 * Fase 2 — Intervalos e referências.
 * Todas as posições dos diagramas e exercícios são calculadas pela altura
 * (modo 'intervals' e exercícios interval-*); os textos só descrevem os desenhos.
 */

const C_INT: ChoiceItem[] = [
  { topic: 'intervalo:nome', prompt: 'Quantos semitons tem uma quinta justa?', options: ['5', '6', '7', '8'], answer: 2, explain: 'Quinta justa = 7 semitons (7 casas na mesma corda). É a segunda nota do power chord.' },
  { topic: 'intervalo:nome', prompt: 'Qual a diferença entre terça maior e terça menor?', options: ['A maior tem 1 semitom a mais', 'A menor tem 1 semitom a mais', 'A maior tem 1 tom a mais', 'Nenhuma, é o mesmo som'], answer: 0, explain: 'Terça menor = 3 semitons; terça maior = 4. Um semitom muda o caráter: menor soa mais sombrio, maior mais aberto.' },
  { topic: 'intervalo:nome', prompt: 'Um power chord (ex.: A5) é formado por quais graus?', options: ['1 e 5 (e a oitava)', '1 e 3', '1 e 4', '1, 3 e 5'], answer: 0, explain: 'Power chord = tônica + quinta justa, muitas vezes com a oitava. Sem terça, não é maior nem menor.' },
  { topic: 'intervalo:nome', prompt: 'De Lá até Dó (subindo) é qual intervalo?', options: ['Terça menor', 'Terça maior', 'Quarta justa', 'Segunda maior'], answer: 0, explain: 'Lá → Si (2) → Dó (1): 3 semitons = terça menor. Por isso Lá menor tem Dó.' },
  { topic: 'intervalo:nome', prompt: 'De Dó até Mi (subindo) é qual intervalo?', options: ['Terça maior', 'Terça menor', 'Quarta justa', 'Quinta justa'], answer: 0, explain: 'Dó → Ré (2) → Mi (2): 4 semitons = terça maior. Por isso Dó maior tem Mi.' },
  { topic: 'intervalo:nome', prompt: 'De Mi até Si (subindo) é qual intervalo?', options: ['Quinta justa', 'Quarta justa', 'Sexta menor', 'Terça maior'], answer: 0, explain: 'Mi → Si são 7 semitons: quinta justa. O power chord E5 é Mi + Si.' },
];

const C_QUINTA: ChoiceItem[] = [
  { topic: 'intervalo:quinta', prompt: 'Tônica Sol na 6ª corda, casa 3. Onde está a quinta (Ré) na 5ª corda?', options: ['Casa 3', 'Casa 4', 'Casa 5', 'Casa 7'], answer: 2, explain: 'Quinta = corda vizinha, 2 casas à frente: 3 + 2 = 5.' },
  { topic: 'intervalo:quinta', prompt: 'Tônica Dó na 3ª corda, casa 5. Onde está a quinta (Sol) na 2ª corda?', options: ['Casa 7', 'Casa 8', 'Casa 6', 'Casa 5'], answer: 1, explain: 'Atravessando Sol–Si o desenho anda uma casa a mais: 2 + 1 = 3 casas à frente. 5 + 3 = 8.' },
  { topic: 'intervalo:quinta', prompt: 'Fora do par Sol–Si, onde fica a quarta justa na corda vizinha mais aguda?', options: ['Na mesma casa', '1 casa à frente', '2 casas à frente', '1 casa para trás'], answer: 0, explain: 'As cordas estão afinadas em quartas: a mesma casa na corda de cima é sempre a quarta (exceto Sol → Si, onde é 1 casa à frente).' },
];

const C_TERCA: ChoiceItem[] = [
  { topic: 'intervalo:terca', prompt: 'Tônica Lá na 6ª corda, casa 5. Onde está a terça maior (Dó♯) na 5ª corda?', options: ['Casa 3', 'Casa 4', 'Casa 5', 'Casa 6'], answer: 1, explain: 'Terça maior = corda vizinha, 1 casa para trás: 5 − 1 = 4.' },
  { topic: 'intervalo:terca', prompt: 'O que muda entre um acorde maior e um menor com a mesma tônica?', options: ['Só a terça: 3 no maior, ♭3 no menor', 'A quinta', 'A tônica', 'A oitava'], answer: 0, explain: 'Tônica e quinta são iguais. A terça desce 1 semitom e o acorde vira menor.' },
  { topic: 'intervalo:terca', prompt: 'Tônica Sol na 3ª corda solta. Onde está a terça maior (Si) na 2ª corda?', options: ['Corda solta (casa 0)', 'Casa 1', 'Casa 3', 'Casa 4'], answer: 0, explain: 'Sol e Si estão a 4 semitons: a própria afinação entre essas cordas é uma terça maior. Por isso o desenho entre elas anda uma casa.' },
];

const C_MAPA: ChoiceItem[] = [
  { topic: 'intervalo:setima', prompt: 'Tônica Lá na 6ª corda, casa 5. Em que casa da 4ª corda fica a ♭7 (Sol)?', options: ['Casa 5', 'Casa 7', 'Casa 3', 'Casa 6'], answer: 0, explain: 'A ♭7 fica duas cordas acima, na mesma casa da tônica (fora do par Sol–Si).' },
  { topic: 'intervalo:setima', prompt: 'Quais graus formam a pentatônica menor?', options: ['1 ♭3 4 5 ♭7', '1 2 3 5 6', '1 3 5 7', '1 2 ♭3 4 5'], answer: 0, explain: 'Pentatônica menor = 1, ♭3, 4, 5, ♭7. Você acabou de aprender todos esses desenhos — é a Fase 3.' },
  { topic: 'intervalo:setima', prompt: 'O acorde A7 (Lá com sétima) tem quais graus?', options: ['1 3 5 ♭7', '1 ♭3 5 ♭7', '1 3 5 7', '1 4 5 ♭7'], answer: 0, explain: 'O acorde "7" é maior com a sétima menor: 1, 3, 5, ♭7. É o acorde típico do blues.' },
];

export const PHASE2_LESSONS: Lesson[] = [
  {
    id: 'p2-intervalos', phase: 2, module: 'Intervalos', minutes: 12, prereqs: ['f2-mapa-oitavas'],
    title: 'O que é intervalo',
    goal: 'Dar nome à distância entre uma nota e a tônica: o idioma de escalas, acordes e solos.',
    entender: [
      {
        text: [
          'Intervalo é a distância entre duas notas, contada a partir de uma referência: a tônica, chamada de 1.',
          'Os que você vai usar o tempo todo: 3 semitons = terça menor (♭3), 4 = terça maior (3), 5 = quarta justa (4), 7 = quinta justa (5), 10 = sétima menor (♭7) e 12 = oitava (8). No braço, os graus aparecem como b3, b7…',
          'Na mesma corda é só contar casas. O difícil — e o útil — é achar o intervalo em outra corda, sem contar: é isso que as próximas aulas treinam.',
        ],
        diagram: { mode: 'intervals', from: { string: 5, fret: 0 }, maxFret: 12, caption: 'A partir do Lá solto (1): ♭3, 3, 4, 5, ♭7 e 8 na mesma corda', intervals: [
          { semitones: 3, string: 5 }, { semitones: 4, string: 5 }, { semitones: 5, string: 5 }, { semitones: 7, string: 5 }, { semitones: 10, string: 5 }, { semitones: 12, string: 5 },
        ] },
      },
      {
        text: ['Cada intervalo tem um caráter. Terça menor soa sombria, terça maior soa aberta, quinta soa "vazia" e firme (o power chord), oitava é a mesma nota mais aguda. Ouvir isso é o começo do ouvido musical.'],
      },
    ],
    executar: {
      instructions: [
        'Toque o Lá solto (5ª corda) e depois cada intervalo: casa 3, 4, 5, 7, 10 e 12. Diga o nome de cada um antes de tocar.',
        'Toque Lá + casa 3 e Lá + casa 4 em seguida. Repare como só um semitom muda o clima.',
        'Repita a partir do Mi solto (6ª corda).',
      ],
      quiz: { kinds: ['interval-name', 'choice'], strings: [6, 5], minFret: 0, maxFret: 5, naturalsOnly: false, intervals: [3, 4, 5, 7, 12], intervalMode: 'same', choices: C_INT },
    },
    memorizar: { kinds: ['interval-name', 'choice', 'interval-name'], strings: [6, 5, 4, 3, 2, 1], minFret: 0, maxFret: 7, naturalsOnly: false, intervals: [2, 3, 4, 5, 7, 10, 12], intervalMode: 'same', choices: C_INT, count: 10 },
    aplicar: {
      instructions: [
        'Pegue um riff que você conhece e, para cada nota, diga o intervalo em relação à primeira nota (a tônica do riff).',
        'Cante a tônica e depois a quinta (como no power chord). Confira tocando.',
      ],
    },
  },
  {
    id: 'p2-quinta', phase: 2, module: 'Intervalos', minutes: 12, prereqs: ['p2-intervalos'],
    title: 'Quinta e quarta: o desenho do power chord',
    goal: 'Achar a quinta e a quarta de qualquer tônica na corda vizinha, sem contar casas.',
    entender: [
      {
        text: [
          'Quinta justa (5): corda vizinha mais aguda, 2 casas à frente. É exatamente o power chord.',
          'Quarta justa (4): corda vizinha, mesma casa. Funciona porque as cordas são afinadas em quartas.',
          'A oitava (8) você já conhece: duas cordas acima, 2 casas à frente.',
        ],
        diagram: { mode: 'intervals', from: { string: 6, fret: 5 }, maxFret: 9, caption: 'Tônica Lá (6ª corda, casa 5): 4 e 5 na 5ª corda, 8 na 4ª', intervals: [
          { semitones: 5, string: 5 }, { semitones: 7, string: 5 }, { semitones: 12, string: 4 },
        ] },
      },
      {
        text: [
          'Atravessando Sol → Si, tudo anda uma casa a mais: a quinta fica 3 casas à frente e a quarta, 1 casa à frente. É o mesmo ajuste das oitavas.',
        ],
        diagram: { mode: 'intervals', from: { string: 3, fret: 5 }, maxFret: 9, caption: 'Tônica Dó (3ª corda, casa 5): 4 e 5 na 2ª corda', intervals: [
          { semitones: 5, string: 2 }, { semitones: 7, string: 2 },
        ] },
      },
    ],
    executar: {
      instructions: [
        'Toque power chords (1 + 5) com tônica na 6ª corda em Sol, Lá, Dó e Ré, dizendo "um, cinco".',
        'Mesma tônica, troque a quinta pela quarta (mesma casa). Ouça a diferença.',
        'Tônica na 3ª corda, casa 5 (Dó): ache a quinta na 2ª corda (casa 8).',
      ],
      quiz: { kinds: ['interval-find', 'interval-name'], strings: [6, 5, 4], minFret: 1, maxFret: 10, naturalsOnly: false, intervals: [7, 5], intervalMode: 'cross' },
    },
    memorizar: { kinds: ['interval-find', 'interval-name', 'choice'], strings: [6, 5, 4, 3, 2], minFret: 1, maxFret: 10, naturalsOnly: false, intervals: [5, 7], intervalMode: 'cross', choices: C_QUINTA, count: 10 },
    aplicar: {
      instructions: [
        'Numa base de rock com power chords que você já toca, diga em voz alta onde está o 1 e o 5 de cada acorde.',
        'Improvise só com 1, 4 e 5 sobre uma base em Lá: três notas, muitas combinações rítmicas.',
      ],
    },
  },
  {
    id: 'p2-tercas', phase: 2, module: 'Intervalos', minutes: 14, prereqs: ['p2-quinta'],
    title: 'Terça maior e terça menor',
    goal: 'Achar a terça que decide se o som é maior ou menor.',
    entender: [
      {
        text: [
          'Na corda vizinha mais aguda: terça maior (3) fica 1 casa para trás; terça menor (♭3) fica 2 casas para trás.',
          'Tônica + terça + quinta formam a tríade. Só a terça muda entre o acorde maior e o menor.',
        ],
        diagram: { mode: 'intervals', from: { string: 6, fret: 5 }, maxFret: 9, caption: 'Tônica Lá: ♭3 (Dó) e 3 (Dó♯) na 5ª corda, junto da 5', intervals: [
          { semitones: 3, string: 5 }, { semitones: 4, string: 5 }, { semitones: 7, string: 5 },
        ] },
      },
      {
        text: [
          'Atravessando Sol → Si, de novo uma casa a mais: a terça maior fica na mesma casa e a terça menor, 1 casa para trás.',
          'A ♭3 também fica na própria corda da tônica, 3 casas acima. Esse é o salto que abre o box 1 da pentatônica.',
        ],
        diagram: { mode: 'intervals', from: { string: 3, fret: 5 }, maxFret: 9, caption: 'Tônica Dó (3ª corda): ♭3 e 3 na 2ª corda', intervals: [
          { semitones: 3, string: 2 }, { semitones: 4, string: 2 },
        ] },
      },
    ],
    executar: {
      instructions: [
        'Tônica Lá (6ª, casa 5). Toque 1 → ♭3 (5ª, casa 3) e 1 → 3 (5ª, casa 4). Diga "menor" e "maior".',
        'Faça o mesmo com tônica na 5ª corda: Ré (casa 5) → ♭3 na 4ª casa 3, 3 na 4ª casa 4.',
        'Toque a tríade nota por nota (arpejo): 1 (6ª, 5) → 3 (5ª, 4) → 5 (5ª, 7). Depois troque a 3 pela ♭3 (5ª, 3).',
      ],
      quiz: { kinds: ['interval-find', 'interval-name'], strings: [6, 5, 4], minFret: 2, maxFret: 10, naturalsOnly: false, intervals: [3, 4], intervalMode: 'cross' },
    },
    memorizar: { kinds: ['interval-find', 'interval-name', 'choice'], strings: [6, 5, 4, 3, 2], minFret: 2, maxFret: 10, naturalsOnly: false, intervals: [3, 4], intervalMode: 'cross', choices: C_TERCA, count: 10 },
    aplicar: {
      instructions: [
        'Pegue um acorde menor e um maior que você toca (ex.: Am e A) e ache, no desenho, qual dedo está na terça.',
        'Numa base em Lá menor, toque frases curtas que terminam na ♭3 (Dó). Depois numa base em Lá maior, terminando na 3 (Dó♯).',
      ],
    },
  },
  {
    id: 'p2-mapa-tonica', phase: 2, module: 'Intervalos', minutes: 15, prereqs: ['p2-tercas'],
    title: 'O mapa em volta da tônica',
    goal: 'Ver 1, ♭3, 3, 4, 5, ♭7 e 8 de uma vez, em volta de qualquer tônica na 6ª ou 5ª corda.',
    entender: [
      {
        text: [
          'Falta a sétima menor (♭7): duas cordas acima, na mesma casa da tônica. Com a oitava (duas cordas acima, +2), fecha o mapa.',
          'Juntando tudo: em volta da tônica cabem todos os intervalos que importam para rock e blues, numa área de 4 casas.',
        ],
        diagram: { mode: 'intervals', from: { string: 6, fret: 5 }, maxFret: 9, caption: 'Tônica Lá na 6ª corda: o mapa completo', intervals: [
          { semitones: 3, string: 5 }, { semitones: 4, string: 5 }, { semitones: 5, string: 5 }, { semitones: 7, string: 5 }, { semitones: 10, string: 4 }, { semitones: 12, string: 4 },
        ] },
      },
      {
        text: [
          'O mesmo mapa vale com a tônica na 5ª corda: os desenhos se repetem uma corda abaixo.',
          'Repare: tirando a 3, sobra 1, ♭3, 4, 5, ♭7 — a pentatônica menor. A Fase 3 é este mapa espalhado pelo braço.',
        ],
        diagram: { mode: 'intervals', from: { string: 5, fret: 5 }, maxFret: 9, caption: 'Tônica Ré na 5ª corda: o mesmo mapa', intervals: [
          { semitones: 3, string: 4 }, { semitones: 4, string: 4 }, { semitones: 5, string: 4 }, { semitones: 7, string: 4 }, { semitones: 10, string: 3 }, { semitones: 12, string: 3 },
        ] },
      },
    ],
    executar: {
      instructions: [
        'Tônica Lá (6ª, 5): toque 1, ♭3, 4, 5, ♭7, 8 dizendo cada grau.',
        'Tônica Ré (5ª, 5): mesmo exercício.',
        'Escolha uma tônica qualquer e toque só 1, 5 e ♭7 — o esqueleto de um acorde com sétima.',
      ],
      quiz: { kinds: ['interval-name', 'interval-find'], strings: [6, 5], minFret: 1, maxFret: 10, naturalsOnly: false, intervals: [3, 4, 5, 7, 10, 12], intervalMode: 'cross', intervalOffsets: [1, 2] },
    },
    memorizar: { kinds: ['interval-name', 'interval-find', 'choice'], strings: [6, 5, 4], minFret: 1, maxFret: 10, naturalsOnly: false, intervals: [3, 4, 5, 7, 10, 12], intervalMode: 'cross', intervalOffsets: [1, 2], choices: C_MAPA, count: 12 },
    aplicar: {
      instructions: [
        'Sobre um blues em Lá, improvise usando só 1, ♭3, 5 e ♭7 em volta da tônica na casa 5. Termine as frases no 1.',
        'Num solo que você já toca, identifique três notas pelo grau (não pelo nome).',
      ],
    },
  },
];
