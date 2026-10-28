import type { ChoiceItem } from '../learning/exercises';
import type { Lesson, Phase } from './types';

/**
 * Trilha curricular. Cada aula segue ENTENDER → EXECUTAR → MEMORIZAR → APLICAR.
 * A aula só é concluída quando o quiz de MEMORIZAR atinge 80% sem ajuda.
 */

export const PHASES: Phase[] = [
  {
    id: 1, title: 'Fundamentos do braço', available: true,
    summary: 'Afinação, escala cromática, localização das notas, relação entre cordas e padrões de oitava.',
    topics: ['Afinação padrão', 'Cordas soltas', 'Escala cromática', 'Tons e semitons', 'Localização de notas', 'Relação entre cordas', 'Padrões de oitava'],
  },
  {
    id: 2, title: 'Intervalos e referências', available: false,
    summary: 'Tônica, terças, quintas e oitavas no braço e no ouvido.',
    topics: ['Intervalos', 'Tônica e fundamental', 'Terças, quintas e oitavas', 'Intervalos a partir de uma referência'],
  },
  {
    id: 3, title: 'Pentatônicas', available: false,
    summary: 'Os cinco desenhos conectados, fundamentais em cada box e aplicação em blues e rock.',
    topics: ['Pentatônica menor e maior', 'Box 1', 'Cinco posições', 'Mudança de tonalidade', 'Frases curtas'],
  },
  {
    id: 4, title: 'Acordes e harmonia', available: false,
    summary: 'Tríades, power chords, graus, campo harmônico e progressões.',
    topics: ['Tríades', 'Power chords', 'Campo harmônico maior e menor', 'Progressões', 'Escalas × acordes'],
  },
  {
    id: 5, title: 'Técnica e expressão', available: false,
    summary: 'Palhetada, legato, bends, vibrato, dinâmica e fraseado.',
    topics: ['Palhetada alternada', 'Hammer-on e pull-off', 'Slides', 'Bends e vibrato', 'Dinâmica'],
  },
  {
    id: 6, title: 'Improvisação', available: false,
    summary: 'Motivos, notas-alvo, resolução e blues de 12 compassos.',
    topics: ['Motivos', 'Notas de repouso', 'Notas-alvo', 'Blues de 12 compassos', 'Estrutura de solo'],
  },
  {
    id: 7, title: 'Conteúdos avançados', available: false,
    summary: 'Liberado após os fundamentos: modos, dominantes secundárias, empréstimos modais e técnicas avançadas.',
    topics: ['Escala maior no braço', 'Modos gregos', 'Dominantes secundárias', 'Empréstimo modal', 'Tapping e sweep'],
  },
];

const ALL = [6, 5, 4, 3, 2, 1];

const C_OPEN: ChoiceItem[] = [
  { topic: 'cordas-soltas', prompt: 'Qual é a 3ª corda (contando da mais aguda)?', options: ['Ré', 'Sol', 'Si', 'Lá'], answer: 1, explain: 'As cordas, da 1ª à 6ª, são Mi, Si, Sol, Ré, Lá, Mi. A 3ª é Sol.' },
  { topic: 'cordas-soltas', prompt: 'Qual é a 5ª corda?', options: ['Lá', 'Ré', 'Mi', 'Si'], answer: 0, explain: 'A 5ª corda é Lá — a segunda mais grossa.' },
  { topic: 'cordas-soltas', prompt: 'Quais cordas têm o mesmo nome de nota?', options: ['2ª e 5ª', '1ª e 6ª', '3ª e 4ª', 'Nenhuma'], answer: 1, explain: 'A 1ª e a 6ª são ambas Mi, separadas por duas oitavas.' },
  { topic: 'cordas-soltas', prompt: 'Entre quais cordas vizinhas a afinação NÃO é uma quarta justa?', options: ['6ª e 5ª', '4ª e 3ª', '3ª e 2ª', '2ª e 1ª'], answer: 2, explain: 'Sol (3ª) e Si (2ª) estão a uma terça maior (4 semitons). Todas as outras estão a 5 semitons.' },
];

const C_CHROMATIC: ChoiceItem[] = [
  { topic: 'cromatica', prompt: 'Quantas notas diferentes existem na escala cromática?', options: ['7', '10', '12', '14'], answer: 2, explain: 'São 12 notas antes de repetir na oitava: 7 naturais + 5 alteradas.' },
  { topic: 'cromatica', prompt: 'Qual destes pares NÃO tem nota entre eles?', options: ['Dó–Ré', 'Mi–Fá', 'Sol–Lá', 'Fá–Sol'], answer: 1, explain: 'Mi–Fá e Si–Dó estão a apenas 1 semitom: não existe nota no meio.' },
  { topic: 'cromatica', prompt: 'Qual é a distância entre Si e Dó?', options: ['1 semitom', '1 tom', '1 tom e meio', '2 tons'], answer: 0, explain: 'Si–Dó é um dos dois semitons naturais (o outro é Mi–Fá).' },
  { topic: 'cromatica', prompt: 'Quantas casas equivalem a 1 tom?', options: ['1', '2', '3', '4'], answer: 1, explain: 'Cada casa é 1 semitom; 1 tom = 2 semitons = 2 casas.' },
  { topic: 'cromatica', prompt: 'Em que casa a corda solta se repete uma oitava acima?', options: ['5', '7', '12', '24'], answer: 2, explain: 'Após 12 semitons a nota se repete: a casa 12 é a oitava da corda solta.' },
];

const C_ACC: ChoiceItem[] = [
  { topic: 'acidentes', prompt: 'Fá♯ e Sol♭ são…', options: ['Notas diferentes', 'A mesma altura com nomes diferentes', 'Separadas por 1 tom', 'Separadas por 1 semitom'], answer: 1, explain: 'São enarmônicas: mesma casa, mesmo som, grafia diferente. O nome correto depende da tonalidade.' },
  { topic: 'acidentes', prompt: 'Qual é a nota 1 semitom abaixo de Dó?', options: ['Si', 'Dó♭ não existe', 'Si♭', 'Lá♯'], answer: 0, explain: 'Entre Si e Dó não há nota no meio, então 1 semitom abaixo de Dó é Si.' },
  { topic: 'acidentes', prompt: 'Lá♯ é o mesmo som que…', options: ['Si♭', 'Si', 'Sol♯', 'Dó♭'], answer: 0, explain: 'Lá♯ = Si♭. Ambos ficam 1 semitom acima de Lá.' },
  { topic: 'acidentes', prompt: 'O que faz um bemol (♭)?', options: ['Sobe 1 semitom', 'Desce 1 semitom', 'Sobe 1 tom', 'Desce 1 tom'], answer: 1, explain: 'Sustenido (♯) sobe 1 semitom; bemol (♭) desce 1 semitom.' },
];

const C_UNISON: ChoiceItem[] = [
  { topic: 'unissono', prompt: 'A casa 5 da 6ª corda tem o mesmo som de qual posição?', options: ['5ª corda solta', '4ª corda solta', '5ª corda casa 5', '6ª corda casa 7'], answer: 0, explain: 'Afinar pela casa 5 funciona porque a corda de cima está 5 semitons acima: casa 5 da 6ª = Lá = 5ª solta.' },
  { topic: 'unissono', prompt: 'A 2ª corda solta (Si) tem o mesmo som da 3ª corda em qual casa?', options: ['Casa 3', 'Casa 4', 'Casa 5', 'Casa 7'], answer: 1, explain: 'Sol e Si estão a 4 semitons. É a única exceção da afinação padrão.' },
];

const C_OCT: ChoiceItem[] = [
  { topic: 'oitava:2c', prompt: 'Nota na 6ª corda, casa 3 (Sol). Onde está a oitava na 4ª corda?', options: ['Casa 3', 'Casa 5', 'Casa 7', 'Casa 1'], answer: 1, explain: 'Pulando uma corda (sem passar pelo par Sol–Si): 2 casas para a frente. 3 + 2 = 5.' },
  { topic: 'oitava:2c-gb', prompt: 'Nota na 4ª corda, casa 5 (Sol). Onde está a oitava na 2ª corda?', options: ['Casa 7', 'Casa 8', 'Casa 6', 'Casa 5'], answer: 1, explain: 'Esse desenho atravessa o par Sol–Si, então são 3 casas para a frente: 5 + 3 = 8.' },
  { topic: 'oitava:3c', prompt: 'Nota na 6ª corda, casa 8 (Dó). Onde está a oitava na 3ª corda?', options: ['Casa 5', 'Casa 6', 'Casa 10', 'Casa 8'], answer: 0, explain: 'Pulando duas cordas da 6ª para a 3ª: 3 casas para trás. 8 − 3 = 5.' },
  { topic: 'oitava:3c-gb', prompt: 'Nota na 5ª corda, casa 3 (Dó). Onde está a oitava na 2ª corda?', options: ['Casa 0', 'Casa 1', 'Casa 2', 'Casa 5'], answer: 1, explain: 'Pulando duas cordas e atravessando Sol–Si: 2 casas para trás. 3 − 2 = 1.' },
  { topic: 'oitava:mapa', prompt: 'Qual é a relação entre a 6ª e a 1ª corda na mesma casa?', options: ['Uníssono', 'Uma oitava', 'Duas oitavas', 'Uma quinta'], answer: 2, explain: 'As duas são Mi, a 1ª duas oitavas acima. Mesma casa, mesma nota.' },
];

export const LESSONS: Lesson[] = [
  {
    id: 'f1-afinacao', phase: 1, module: 'Localização de notas', minutes: 10, prereqs: [],
    title: 'Afinação padrão e cordas soltas',
    goal: 'Saber o nome de cada corda solta e por que a afinação tem uma exceção entre Sol e Si.',
    entender: [
      {
        text: [
          'Da corda mais grossa para a mais fina: Mi, Lá, Ré, Sol, Si, Mi. A numeração é inversa: a 1ª corda é a Mi aguda e a 6ª é a Mi grave.',
          'Cada corda está 5 semitons (uma quarta justa) acima da anterior — exceto Sol → Si, que está a 4 semitons. Essa exceção vai aparecer em todo desenho que atravessar essas duas cordas.',
        ],
        diagram: { mode: 'open', maxFret: 5, showNames: true, caption: 'Cordas soltas na afinação padrão' },
      },
      {
        text: ['Uma frase para lembrar a ordem (6ª → 1ª): "Mi Lá Ré Sol Si Mi". Muitos usam "Eddie Ate Dynamite, Good Bye Eddie" para E A D G B E.'],
      },
    ],
    executar: {
      instructions: [
        'Toque cada corda solta da 6ª para a 1ª dizendo o nome em voz alta.',
        'Agora em ordem aleatória: escolha uma corda sem olhar e diga o nome antes de tocar.',
        'Confira a afinação comparando a casa 5 de cada corda com a corda solta seguinte (na 3ª corda, use a casa 4).',
      ],
      diagram: { mode: 'positions', maxFret: 7, caption: 'Pontos de afinação relativa', positions: [
        { string: 6, fret: 5, role: 'focus' }, { string: 5, fret: 5, role: 'focus' }, { string: 4, fret: 5, role: 'focus' },
        { string: 3, fret: 4, role: 'target' }, { string: 2, fret: 5, role: 'focus' },
      ] },
      quiz: { kinds: ['identify', 'choice'], strings: ALL, minFret: 0, maxFret: 0, naturalsOnly: true, choices: C_OPEN },
    },
    memorizar: { kinds: ['identify', 'choice'], strings: ALL, minFret: 0, maxFret: 0, naturalsOnly: true, choices: C_OPEN, count: 10 },
    aplicar: {
      instructions: [
        'Pegue um riff que você já toca usando cordas soltas graves e diga o nome de cada corda solta que aparece nele.',
        'Afine o instrumento só de ouvido pelo método da casa 5 / casa 4, depois confira com um afinador.',
      ],
    },
  },
  {
    id: 'f1-cromatica', phase: 1, module: 'Localização de notas', minutes: 12, prereqs: ['f1-afinacao'],
    title: 'Escala cromática: tons e semitons',
    goal: 'Entender que cada casa é um semitom e onde estão os dois semitons naturais.',
    entender: [
      {
        text: [
          'Existem 12 notas. Sete são naturais (Dó Ré Mi Fá Sol Lá Si) e cinco são alteradas, que ficam entre elas.',
          'Cada casa sobe exatamente 1 semitom. Dois semitons formam 1 tom.',
          'Entre as naturais, quase todas estão a 1 tom de distância. As exceções são Mi–Fá e Si–Dó: só 1 semitom, sem nota no meio. Saber isso é o que permite contar casas sem decorar tudo.',
        ],
        diagram: { mode: 'string', string: 5, maxFret: 12, showNames: true, caption: '5ª corda (Lá): a escala cromática completa' },
      },
    ],
    executar: {
      instructions: [
        'Toque a 5ª corda da casa 0 à 12, casa por casa, dizendo cada nota (com sustenidos).',
        'Repita só com as naturais: Lá (0), Si (2), Dó (3), Ré (5), Mi (7), Fá (8), Sol (10), Lá (12). Repare nos saltos de 1 casa em Si–Dó e Mi–Fá.',
      ],
      diagram: { mode: 'naturals', strings: [5], maxFret: 12, showNames: true, caption: 'Naturais na 5ª corda' },
      quiz: { kinds: ['distance', 'choice'], strings: [6, 5], minFret: 0, maxFret: 10, naturalsOnly: false, choices: C_CHROMATIC },
    },
    memorizar: { kinds: ['distance', 'choice', 'choice'], strings: ALL, minFret: 0, maxFret: 10, naturalsOnly: false, choices: C_CHROMATIC, count: 10 },
    aplicar: {
      instructions: [
        'Escolha qualquer corda e toque a escala cromática completa (0 a 12) subindo e descendo, falando as notas.',
        'Com metrônomo lento (60 BPM), toque 1 casa por clique. Isso também serve de aquecimento.',
      ],
    },
  },
  {
    id: 'f1-cordas-mi', phase: 1, module: 'Localização de notas', minutes: 15, prereqs: ['f1-cromatica'],
    title: 'Notas naturais nas cordas Mi (6ª e 1ª)',
    goal: 'Localizar todas as naturais da 6ª corda — e, de graça, da 1ª.',
    entender: [
      {
        text: [
          'A 6ª corda é a referência mais usada: power chords e acordes com pestana têm a fundamental nela.',
          'Naturais na 6ª corda: Mi (0), Fá (1), Sol (3), Lá (5), Si (7), Dó (8), Ré (10), Mi (12).',
          'A 1ª corda também é Mi: as notas estão exatamente nas mesmas casas. Aprender uma é aprender as duas.',
        ],
        diagram: { mode: 'naturals', strings: [6, 1], maxFret: 12, showNames: true, caption: 'Naturais nas cordas Mi' },
      },
      {
        text: ['Âncoras: casa 3 = Sol, casa 5 = Lá, casa 7 = Si, casa 8 = Dó. Os marcadores do braço (3, 5, 7, 9, 12) ajudam a achar essas casas sem contar.'],
      },
    ],
    executar: {
      instructions: [
        'Toque as naturais da 6ª corda subindo e descendo, dizendo os nomes.',
        'Agora pule: Sol, Dó, Lá, Mi, Ré, Fá, Si. Ache cada uma sem contar desde a casa 0.',
        'Faça o mesmo na 1ª corda.',
      ],
      quiz: { kinds: ['identify', 'locate'], strings: [6, 1], minFret: 0, maxFret: 12, naturalsOnly: true },
    },
    memorizar: { kinds: ['identify', 'locate'], strings: [6, 1], minFret: 0, maxFret: 12, naturalsOnly: true, count: 12 },
    aplicar: {
      instructions: [
        'Toque um power chord com fundamental na 6ª corda em Sol, Lá, Dó e Ré, dizendo o nome do acorde antes de tocar.',
        'Pegue uma base de rock que você já toca com power chords na 6ª corda e diga o nome de cada acorde a partir da casa.',
      ],
      diagram: { mode: 'positions', maxFret: 12, caption: 'Fundamentais de power chords: Sol, Lá, Dó, Ré', positions: [
        { string: 6, fret: 3, role: 'root' }, { string: 6, fret: 5, role: 'root' }, { string: 6, fret: 8, role: 'root' }, { string: 6, fret: 10, role: 'root' },
      ] },
    },
  },
  {
    id: 'f1-corda-la', phase: 1, module: 'Localização de notas', minutes: 15, prereqs: ['f1-cordas-mi'],
    title: 'Notas naturais na 5ª corda (Lá)',
    goal: 'Dominar a segunda corda de referência para fundamentais.',
    entender: [
      {
        text: [
          'Naturais na 5ª corda: Lá (0), Si (2), Dó (3), Ré (5), Mi (7), Fá (8), Sol (10), Lá (12).',
          'Atalho: na mesma casa, a 5ª corda tem a nota uma quarta acima da 6ª (casa 3: Sol → Dó; casa 5: Lá → Ré; casa 7: Si → Mi). Isso porque as cordas estão afinadas a uma quarta de distância.',
        ],
        diagram: { mode: 'naturals', strings: [6, 5], maxFret: 12, showNames: true, caption: 'Naturais nas cordas 6 e 5' },
      },
    ],
    executar: {
      instructions: [
        'Toque as naturais da 5ª corda subindo e descendo.',
        'Alterne: diga uma nota e toque-a na 6ª e depois na 5ª corda.',
      ],
      quiz: { kinds: ['identify', 'locate'], strings: [5], minFret: 0, maxFret: 12, naturalsOnly: true },
    },
    memorizar: { kinds: ['identify', 'locate', 'locate'], strings: [6, 5], minFret: 0, maxFret: 12, naturalsOnly: true, count: 12 },
    aplicar: {
      instructions: [
        'Toque power chords com fundamental na 5ª corda em Dó, Ré, Mi e Sol.',
        'Toque a progressão Lá – Ré – Mi em power chords usando só as cordas 6 e 5, achando cada fundamental pelo nome.',
      ],
    },
  },
  {
    id: 'f1-cordas-internas', phase: 1, module: 'Localização de notas', minutes: 20, prereqs: ['f1-corda-la'],
    title: 'Notas nas cordas Ré, Sol e Si',
    goal: 'Completar o mapa das naturais nas seis cordas.',
    entender: [
      {
        text: [
          'Ré (4ª): Mi 2, Fá 3, Sol 5, Lá 7, Si 9, Dó 10, Ré 12.',
          'Sol (3ª): Lá 2, Si 4, Dó 5, Ré 7, Mi 9, Fá 10, Sol 12.',
          'Si (2ª): Dó 1, Ré 3, Mi 5, Fá 6, Sol 8, Lá 10, Si 12.',
          'Não decore como listas: use referências. A casa 5 de cada corda é a próxima corda solta, e na 3ª corda é a casa 4.',
        ],
        diagram: { mode: 'naturals', strings: [4, 3, 2], maxFret: 12, showNames: true, caption: 'Naturais nas cordas internas' },
      },
    ],
    executar: {
      instructions: [
        'Uma corda por vez: toque as naturais de 0 a 12 falando os nomes.',
        'Escolha uma nota (ex.: Dó) e toque-a em todas as seis cordas, entre as casas 0 e 12.',
      ],
      quiz: { kinds: ['identify', 'locate'], strings: [4, 3, 2], minFret: 0, maxFret: 12, naturalsOnly: true },
    },
    memorizar: { kinds: ['identify', 'locate'], strings: [4, 3, 2], minFret: 0, maxFret: 12, naturalsOnly: true, count: 12 },
    aplicar: {
      instructions: [
        'Ache Mi, Lá e Dó em todas as cordas entre as casas 0 e 12 e toque cada uma.',
        'Em um solo que você já toca, escolha 3 notas e diga o nome de cada uma pela corda e casa.',
      ],
    },
  },
  {
    id: 'f1-acidentes', phase: 1, module: 'Localização de notas', minutes: 12, prereqs: ['f1-cordas-internas'],
    title: 'Sustenidos e bemóis',
    goal: 'Nomear qualquer casa, incluindo as notas alteradas, e entender a enarmonia.',
    entender: [
      {
        text: [
          'Sustenido (♯) sobe 1 semitom; bemol (♭) desce 1 semitom. Uma casa acima de Fá é Fá♯; uma casa abaixo de Sol é Sol♭ — o mesmo som.',
          'Notas com o mesmo som e nomes diferentes são enarmônicas. Qual nome usar depende da tonalidade: em Fá maior se escreve Si♭, em Mi maior se escreve Ré♯. Você pode escolher a exibição nas Configurações.',
          'Sabendo as naturais, as alteradas saem por vizinhança: a casa entre Lá e Si é Lá♯/Si♭.',
        ],
        diagram: { mode: 'chromatic', strings: [6, 5], maxFret: 12, showNames: true, caption: 'Todas as notas nas cordas 6 e 5' },
      },
    ],
    executar: {
      instructions: [
        'Na 6ª corda, toque só as alteradas entre 0 e 12: Fá♯ (2), Sol♯ (4), Lá♯ (6), Dó♯ (9), Ré♯ (11).',
        'Diga cada uma com os dois nomes: Fá♯/Sol♭, Sol♯/Lá♭, e assim por diante.',
      ],
      quiz: { kinds: ['identify', 'choice'], strings: [6, 5], minFret: 0, maxFret: 12, naturalsOnly: false, choices: C_ACC },
    },
    memorizar: { kinds: ['identify', 'locate', 'choice'], strings: [6, 5, 4], minFret: 0, maxFret: 12, naturalsOnly: false, choices: C_ACC, count: 12 },
    aplicar: {
      instructions: [
        'Toque power chords em Fá♯, Si♭ e Dó♯ com fundamental na 6ª ou 5ª corda.',
        'Ache Si♭ em todas as cordas entre as casas 0 e 12.',
      ],
    },
  },
  {
    id: 'f1-unissono', phase: 1, module: 'Localização de notas', minutes: 12, prereqs: ['f1-acidentes'],
    title: 'A mesma nota em outra corda',
    goal: 'Trocar de corda mantendo a mesma altura — a base para mudar de região sem se perder.',
    entender: [
      {
        text: [
          'A mesma altura existe em mais de um lugar. Na corda vizinha mais grave, ela fica 5 casas à frente.',
          'A exceção é o par Sol–Si: da 2ª para a 3ª corda, são 4 casas à frente. É o mesmo motivo da afinação pela casa 4.',
          'É por isso que um mesmo lick pode ser tocado em regiões diferentes do braço com o mesmo som.',
        ],
        diagram: { mode: 'positions', maxFret: 12, caption: 'O mesmo Lá em três cordas, até a casa 12', positions: [
          { string: 4, fret: 7, role: 'root', label: 'Lá' }, { string: 5, fret: 12, role: 'root', label: 'Lá' }, { string: 3, fret: 2, role: 'root', label: 'Lá' },
        ] },
      },
    ],
    executar: {
      instructions: [
        'Toque a casa 5 da 6ª corda e a 5ª corda solta: mesmo som.',
        'Toque Sol na 2ª corda (casa 8) e encontre o mesmo Sol na 3ª corda (casa 12).',
        'Escolha 3 notas da 1ª corda e encontre cada uma na 2ª, depois na 3ª.',
      ],
      quiz: { kinds: ['unison', 'choice'], strings: [1, 2, 3, 4, 5], minFret: 0, maxFret: 10, naturalsOnly: true, choices: C_UNISON },
    },
    memorizar: { kinds: ['unison', 'unison', 'choice'], strings: [1, 2, 3, 4, 5], minFret: 0, maxFret: 10, naturalsOnly: false, choices: C_UNISON, count: 10 },
    aplicar: {
      instructions: [
        'Pegue uma frase curta de 3–4 notas que você toca nas cordas agudas e toque o mesmo som uma corda abaixo, compensando 5 casas (ou 4 entre Sol e Si).',
      ],
    },
  },
  {
    id: 'f2-oitava-basica', phase: 1, module: 'Padrões de oitava', minutes: 12, prereqs: ['f1-unissono'],
    title: 'Oitava pulando uma corda',
    goal: 'Achar a oitava de uma nota da 6ª ou 5ª corda instantaneamente.',
    entender: [
      {
        text: [
          'Oitava é a mesma nota, 12 semitons acima. Mesmo nome, som mais agudo.',
          'Da 6ª para a 4ª corda, ou da 5ª para a 3ª: pule uma corda e ande 2 casas para a frente. É o mesmo desenho do power chord com a oitava.',
        ],
        diagram: { mode: 'octaves', from: { string: 6, fret: 5 }, strings: [6, 4], maxFret: 12, showNames: true, caption: 'Lá na 6ª corda (casa 5) e a oitava na 4ª (casa 7)' },
      },
    ],
    executar: {
      instructions: [
        'Toque Sol na 6ª corda (3) e a oitava na 4ª (5). Faça o mesmo para Lá, Dó e Ré.',
        'Repita na 5ª → 3ª corda: Dó (3 → 5), Ré (5 → 7), Mi (7 → 9).',
        'Abafe a corda do meio com o dedo que pressiona a nota grave.',
      ],
      quiz: { kinds: ['octave'], strings: ALL, minFret: 0, maxFret: 10, naturalsOnly: true, octavePairs: [[6, 4], [5, 3]] },
    },
    memorizar: { kinds: ['octave', 'octave', 'choice'], strings: ALL, minFret: 0, maxFret: 10, naturalsOnly: false, octavePairs: [[6, 4], [5, 3]], choices: C_OCT.filter((c) => c.topic === 'oitava:2c'), count: 10 },
    aplicar: {
      instructions: [
        'Toque uma linha de baixo de rock (por exemplo, Lá – Ré – Mi) usando oitavas 6ª/4ª e 5ª/3ª, abafando a corda do meio.',
      ],
    },
  },
  {
    id: 'f2-oitava-sol-si', phase: 1, module: 'Padrões de oitava', minutes: 12, prereqs: ['f2-oitava-basica'],
    title: 'Oitava atravessando Sol–Si',
    goal: 'Aplicar o ajuste de uma casa quando o desenho cruza as cordas Sol e Si.',
    entender: [
      {
        text: [
          'Da 4ª para a 2ª corda, ou da 3ª para a 1ª: pule uma corda e ande 3 casas para a frente — uma a mais que no desenho anterior.',
          'Motivo: a 2ª corda está só 4 semitons acima da 3ª, então tudo que passa por esse par se desloca uma casa.',
        ],
        diagram: { mode: 'octaves', from: { string: 4, fret: 5 }, strings: [4, 2], maxFret: 12, showNames: true, caption: 'Sol na 4ª corda (5) e a oitava na 2ª (8)' },
      },
    ],
    executar: {
      instructions: [
        'Compare: Lá na 6ª (5) → oitava na 4ª (7), +2. Agora Sol na 4ª (5) → 2ª (8), +3.',
        'Toque Ré (3ª corda, 7) e a oitava na 1ª (10).',
      ],
      quiz: { kinds: ['octave'], strings: ALL, minFret: 0, maxFret: 10, naturalsOnly: true, octavePairs: [[4, 2], [3, 1]] },
    },
    memorizar: { kinds: ['octave', 'octave', 'choice'], strings: ALL, minFret: 0, maxFret: 10, naturalsOnly: false, octavePairs: [[6, 4], [5, 3], [4, 2], [3, 1]], choices: C_OCT.filter((c) => c.topic.startsWith('oitava:2c')), count: 12 },
    aplicar: {
      instructions: [
        'Toque uma melodia simples (por exemplo, as notas Mi–Sol–Lá) em oitavas nas cordas 4/2 e depois 3/1, como nos solos em oitavas de jazz e rock.',
      ],
    },
  },
  {
    id: 'f2-oitava-longa', phase: 1, module: 'Padrões de oitava', minutes: 12, prereqs: ['f2-oitava-sol-si'],
    title: 'Oitava pulando duas cordas',
    goal: 'Achar a oitava andando para trás no braço.',
    entender: [
      {
        text: [
          'Da 6ª para a 3ª corda: pule duas cordas e volte 3 casas.',
          'Da 5ª para a 2ª e da 4ª para a 1ª: volte só 2 casas — de novo, o par Sol–Si empurra o desenho uma casa.',
          'E a 6ª e a 1ª: mesma casa, duas oitavas de distância.',
        ],
        diagram: { mode: 'octaves', from: { string: 5, fret: 3 }, maxFret: 12, showNames: true, caption: 'Dó na 5ª corda (3) e todas as suas oitavas' },
      },
    ],
    executar: {
      instructions: [
        'Toque Dó na 6ª corda (8) e a oitava na 3ª (5).',
        'Toque Dó na 5ª corda (3) e a oitava na 2ª (1).',
        'Toque Mi na 4ª (2) e a oitava na 1ª (0).',
      ],
      quiz: { kinds: ['octave'], strings: ALL, minFret: 2, maxFret: 12, naturalsOnly: true, octavePairs: [[6, 3], [5, 2], [4, 1]] },
    },
    memorizar: { kinds: ['octave', 'octave', 'choice'], strings: ALL, minFret: 2, maxFret: 12, naturalsOnly: false, octavePairs: [[6, 3], [5, 2], [4, 1]], choices: C_OCT.filter((c) => c.topic.startsWith('oitava:3c') || c.topic === 'oitava:mapa'), count: 10 },
    aplicar: {
      instructions: [
        'Escolha uma nota de fundamental de um solo que você conhece e toque-a em três oitavas usando os desenhos de 2 e 3 cordas.',
      ],
    },
  },
  {
    id: 'f2-mapa-oitavas', phase: 1, module: 'Padrões de oitava', minutes: 15, prereqs: ['f2-oitava-longa'],
    title: 'Mapa de oitavas pelo braço',
    goal: 'Encadear os desenhos e encontrar uma nota em todas as cordas — o esqueleto de qualquer escala.',
    entender: [
      {
        text: [
          'Os desenhos se encadeiam: 6ª → 4ª (+2), 4ª → 2ª (+3); 5ª → 3ª (+2), 3ª → 1ª (+3). Somados aos de duas cordas, cobrem o braço todo.',
          'Na Fase 3, cada box da pentatônica é organizado em volta dessas posições de fundamental. Quem acha as fundamentais rápido não se perde nos boxes.',
        ],
        diagram: { mode: 'pc', pc: 9, maxFret: 12, showNames: true, caption: 'Todas as posições de Lá até a casa 12' },
      },
    ],
    executar: {
      instructions: [
        'Escolha uma nota e toque todas as posições dela da 6ª para a 1ª corda numa região, depois na região seguinte.',
        'Faça com Lá, Mi, Dó e Sol. Use o Mapa do braço no modo teste para conferir.',
      ],
      quiz: { kinds: ['octave', 'locate'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: true, octavePairs: [[6, 4], [5, 3], [4, 2], [3, 1], [6, 3], [5, 2], [4, 1]] },
    },
    memorizar: { kinds: ['octave', 'locate', 'identify', 'choice'], strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: false, octavePairs: [[6, 4], [5, 3], [4, 2], [3, 1], [6, 3], [5, 2], [4, 1]], choices: C_OCT, count: 14 },
    aplicar: {
      instructions: [
        'Coloque uma base em Lá (ou peça a alguém para tocar) e improvise usando só a nota Lá em todas as oitavas, variando ritmo e dinâmica. Restringir a uma nota obriga a pensar no braço, não em desenhos.',
      ],
    },
  },
];

export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);
