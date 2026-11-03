import type { ChoiceItem } from '../learning/exercises';
import { KEYS } from '../learning/specs';
import type { Lesson } from './types';

/**
 * Fase 3 — Pentatônicas.
 * Boxes calculados por `pentatonicBox` (2 notas por corda, pela altura real de cada corda).
 */

const ALL = [6, 5, 4, 3, 2, 1];
const base = { strings: ALL, minFret: 0, maxFret: 12, naturalsOnly: false } as const;

const C_BOX1: ChoiceItem[] = [
  { topic: 'penta:box1', prompt: 'Quantas notas diferentes tem a pentatônica?', options: ['5', '6', '7', '12'], answer: 0, explain: '"Penta" = cinco: 1, ♭3, 4, 5, ♭7 na menor.' },
  { topic: 'penta:box1', prompt: 'Quais são as notas de Lá menor pentatônica?', options: ['Lá Dó Ré Mi Sol', 'Lá Si Dó Ré Mi', 'Lá Dó♯ Mi Fá♯ Sol', 'Lá Ré Mi Fá Sol'], answer: 0, explain: 'Lá (1), Dó (♭3), Ré (4), Mi (5), Sol (♭7).' },
  { topic: 'penta:box1', prompt: 'No box 1 de Lá menor (casa 5), onde estão as tônicas?', options: ['6ª casa 5, 4ª casa 7, 1ª casa 5', '6ª casa 5, 3ª casa 7, 1ª casa 8', '5ª casa 5 e 3ª casa 5', '6ª casa 8 e 2ª casa 5'], answer: 0, explain: 'São as oitavas da Fase 1: 6ª (5) → 4ª (7) pulando uma corda, e a 1ª na mesma casa da 6ª.' },
  { topic: 'penta:box1', prompt: 'Por que, no box 1, a 2ª corda usa as casas 5 e 8 e a 3ª usa 5 e 7?', options: ['O par Sol–Si empurra o desenho uma casa', 'É só um costume', 'Porque a 2ª corda é mais fina', 'Porque o box muda de tom ali'], answer: 0, explain: 'A 2ª corda está só 4 semitons acima da 3ª, então as notas dela "andam" uma casa.' },
];

const C_TOM: ChoiceItem[] = [
  { topic: 'penta:tom', prompt: 'A música mudou de Lá menor para Si menor. O que acontece com o box 1?', options: ['Desliza 2 casas para a frente, mesmo desenho', 'Muda o desenho', 'Fica no mesmo lugar', 'Desliza 1 casa para trás'], answer: 0, explain: 'O desenho acompanha a tônica: Si está 2 casas acima de Lá na 6ª corda (casa 7).' },
  { topic: 'penta:tom', prompt: 'Em Mi menor, onde fica o box 1?', options: ['Na posição aberta (casas 0 a 3)', 'Na casa 5', 'Na casa 7', 'Na casa 12 apenas'], answer: 0, explain: 'A tônica Mi na 6ª corda é a corda solta: o box 1 usa as cordas soltas como primeira nota de cada corda (e também existe uma oitava acima, na casa 12).' },
  { topic: 'penta:tom', prompt: 'Como achar o box 1 de qualquer tom menor?', options: ['Pela tônica na 6ª corda', 'Pela tônica na 2ª corda', 'Contando sempre a partir da casa 5', 'Não dá, cada tom tem um desenho'], answer: 0, explain: 'Ache a tônica na 6ª corda (Fase 1). Ali começa o box 1.' },
];

const C_BOX2: ChoiceItem[] = [
  { topic: 'penta:box2', prompt: 'O box 2 começa em qual grau na 6ª corda?', options: ['♭3', '1', '4', '5'], answer: 0, explain: 'O box 1 começa no 1; o box 2 começa na nota seguinte da escala, a ♭3.' },
  { topic: 'penta:box2', prompt: 'Como os boxes se ligam?', options: ['As notas de cima de um box são as de baixo do seguinte', 'Não têm notas em comum', 'Cada box é de outra escala', 'O box 2 é o box 1 uma oitava acima'], answer: 0, explain: 'A nota mais alta de cada corda no box 1 é a mais baixa no box 2. Por isso dá para deslizar de um para o outro.' },
  { topic: 'penta:box2', prompt: 'No box 2 de Lá menor, a tônica na 4ª corda fica em que casa?', options: ['Casa 7', 'Casa 10', 'Casa 5', 'Casa 9'], answer: 0, explain: 'É a mesma tônica da 4ª corda do box 1 (casa 7): agora ela é a nota de baixo dessa corda.' },
];

const C_BOX3: ChoiceItem[] = [
  { topic: 'penta:box3', prompt: 'O box 3 começa em qual grau na 6ª corda?', options: ['4', '♭3', '5', '♭7'], answer: 0, explain: 'Ordem dos boxes pela 6ª corda: 1, ♭3, 4, 5, ♭7 — um para cada nota da escala.' },
  { topic: 'penta:box3', prompt: 'No box 3, as tônicas ficam em quais cordas?', options: ['5ª e 2ª', '6ª e 1ª', '4ª e 1ª', '6ª e 3ª'], answer: 0, explain: 'Em Lá: 5ª corda casa 12 e 2ª corda casa 10. É o desenho de oitava que pula duas cordas e atravessa Sol–Si (2 casas para trás).' },
];

const C_BOX45: ChoiceItem[] = [
  { topic: 'penta:box4', prompt: 'O box 4 começa em qual grau na 6ª corda?', options: ['5', '4', '♭7', '1'], answer: 0, explain: 'Box 4 = a partir da quinta. Em Lá, casa 12 (Mi).' },
  { topic: 'penta:box5', prompt: 'O box 5 começa em qual grau na 6ª corda?', options: ['♭7', '5', '1', '♭3'], answer: 0, explain: 'Box 5 = a partir da ♭7. Em Lá, casa 3 (Sol) — logo antes do box 1.' },
  { topic: 'penta:box5', prompt: 'O que vem depois do box 5, subindo o braço?', options: ['O box 1 de novo', 'Um box 6', 'O box 4 de novo', 'A escala acaba'], answer: 0, explain: 'São só cinco desenhos. Depois do 5 vem o 1, e a sequência se repete a cada 12 casas.' },
];

const C_MAIOR: ChoiceItem[] = [
  { topic: 'penta:maior', prompt: 'Quais graus formam a pentatônica maior?', options: ['1 2 3 5 6', '1 ♭3 4 5 ♭7', '1 3 5 7', '1 2 3 4 5'], answer: 0, explain: 'Pentatônica maior = 1, 2, 3, 5, 6. Sem 4 e sem 7, por isso quase nunca soa "errada".' },
  { topic: 'penta:maior', prompt: 'Dó maior pentatônica tem as mesmas notas de qual pentatônica menor?', options: ['Lá menor', 'Dó menor', 'Mi menor', 'Ré menor'], answer: 0, explain: 'Dó Ré Mi Sol Lá = Lá Dó Ré Mi Sol. Mesmas notas, outra tônica: é a relativa menor.' },
  { topic: 'penta:maior', prompt: 'Para tocar Lá maior pentatônica com o box 1, onde você põe o desenho?', options: ['Casa 2 (o box 1 de Fá♯ menor)', 'Casa 5 (o box 1 de Lá menor)', 'Casa 0', 'Casa 9'], answer: 0, explain: 'A relativa menor fica 3 casas abaixo da tônica maior: Lá (5) − 3 = casa 2, Fá♯ menor.' },
  { topic: 'penta:maior', prompt: 'Qual é a relativa menor de Sol maior?', options: ['Mi menor', 'Si menor', 'Ré menor', 'Lá menor'], answer: 0, explain: 'Três semitons abaixo de Sol: Mi. Sol maior pentatônica usa o desenho de Mi menor.' },
];

export const PHASE3_LESSONS: Lesson[] = [
  {
    id: 'p3-box1', phase: 3, module: 'Pentatônica menor', minutes: 15, prereqs: ['p2-mapa-tonica'],
    title: 'Box 1: a pentatônica menor',
    goal: 'Tocar o box 1 sabendo o grau de cada nota, não só o desenho.',
    entender: [
      {
        text: [
          'A pentatônica menor tem cinco notas: 1, ♭3, 4, 5, ♭7 — o mapa em volta da tônica da Fase 2, sem a 3.',
          'O box 1 começa na tônica da 6ª corda e coloca duas notas em cada corda. Em Lá menor, ele vai da casa 5 à casa 8.',
          'As tônicas do box são as oitavas que você já sabe: 6ª corda, 4ª corda (+2) e 1ª corda (mesma casa da 6ª).',
        ],
        diagram: { mode: 'box', pc: 9, boxes: [1], maxFret: 12, caption: 'Box 1 de Lá menor, com os graus' },
      },
      {
        text: ['Os mesmos pontos, agora com os nomes das notas: Lá, Dó, Ré, Mi e Sol.'],
        diagram: { mode: 'box', pc: 9, boxes: [1], maxFret: 12, labels: 'note', caption: 'Box 1 de Lá menor, com os nomes' },
      },
    ],
    executar: {
      instructions: [
        'Toque o box 1 de Lá subindo e descendo, devagar, dizendo o grau de cada nota.',
        'Agora toque só as tônicas do box (6ª casa 5, 4ª casa 7, 1ª casa 5).',
        'Toque só 1, ♭3 e 5 do box. Depois 1, 4 e ♭7.',
      ],
      quiz: { ...base, kinds: ['box-degree', 'box-find'], keys: [9], boxes: [1] },
    },
    memorizar: { ...base, kinds: ['box-find', 'box-degree', 'choice'], keys: [9], boxes: [1], choices: C_BOX1, count: 10 },
    aplicar: {
      instructions: [
        'Numa base de blues em Lá, improvise no box 1 terminando cada frase numa tônica.',
        'Pegue um lick de rock ou blues que você já toca no box 1 e diga o grau de cada nota.',
      ],
    },
  },
  {
    id: 'p3-tonalidade', phase: 3, module: 'Pentatônica menor', minutes: 12, prereqs: ['p3-box1'],
    title: 'Mudar de tom: o box anda com a tônica',
    goal: 'Levar o box 1 para qualquer tom achando a tônica na 6ª corda.',
    entender: [
      {
        text: [
          'O desenho não muda de tom para tom. Muda só o lugar: o box 1 começa onde está a tônica na 6ª corda.',
          'Tons comuns: Mi (casa 0), Sol (3), Lá (5), Si (7), Dó (8), Ré (10).',
        ],
        diagram: { mode: 'box', pc: 4, boxes: [1], maxFret: 12, labels: 'note', caption: 'Box 1 de Mi menor: posição aberta' },
      },
      {
        text: ['Em Sol menor, o mesmo desenho começa na casa 3.'],
        diagram: { mode: 'box', pc: 7, boxes: [1], maxFret: 12, caption: 'Box 1 de Sol menor' },
      },
    ],
    executar: {
      instructions: [
        'Toque o box 1 em Lá (casa 5), depois em Si (7), depois em Dó (8). Mesmo desenho, outro lugar.',
        'Toque o box 1 em Mi usando as cordas soltas.',
      ],
      quiz: { ...base, kinds: ['box-start', 'box-find'], keys: KEYS, boxes: [1] },
    },
    memorizar: { ...base, kinds: ['box-start', 'box-find', 'choice'], keys: KEYS, boxes: [1], choices: C_TOM, count: 10 },
    aplicar: {
      instructions: [
        'Escolha uma música de rock que você conhece, descubra o tom pela primeira nota grave ou pelo acorde principal e ache o box 1.',
        'Improvise 1 minuto em Mi, depois em Sol, depois em Lá, mudando só a posição.',
      ],
    },
  },
  {
    id: 'p3-box2', phase: 3, module: 'Pentatônica menor', minutes: 15, prereqs: ['p3-tonalidade'],
    title: 'Box 2: o vizinho de cima',
    goal: 'Sair do box 1 sem se perder, ligando-o ao box 2.',
    entender: [
      {
        text: [
          'O box 2 começa na ♭3 da 6ª corda — a nota mais alta do box 1 nessa corda. Em Lá, casa 8.',
          'Os dois boxes dividem notas: a nota de cima de cada corda no box 1 é a nota de baixo no box 2.',
        ],
        diagram: { mode: 'box', pc: 9, boxes: [1, 2], maxFret: 12, caption: 'Boxes 1 e 2 de Lá menor juntos' },
      },
      {
        text: ['As tônicas do box 2 estão na 4ª corda (casa 7, a mesma do box 1) e na 2ª corda (casa 10).'],
        diagram: { mode: 'box', pc: 9, boxes: [2], maxFret: 12, caption: 'Box 2 de Lá menor' },
      },
    ],
    executar: {
      instructions: [
        'Toque o box 2 de Lá subindo e descendo, dizendo os graus.',
        'Suba pelo box 1 e desça pelo box 2, sem parar.',
        'Ache as tônicas do box 2 (4ª casa 7, 2ª casa 10).',
      ],
      quiz: { ...base, kinds: ['box-degree', 'box-find'], keys: [9], boxes: [2] },
    },
    memorizar: { ...base, kinds: ['box-find', 'box-degree', 'choice'], keys: KEYS, boxes: [2], choices: C_BOX2, count: 10 },
    aplicar: {
      instructions: [
        'Numa base em Lá, comece uma frase no box 1 e termine na tônica da 2ª corda (casa 10), dentro do box 2.',
      ],
    },
  },
  {
    id: 'p3-box3', phase: 3, module: 'Pentatônica menor', minutes: 15, prereqs: ['p3-box2'],
    title: 'Box 3',
    goal: 'Dominar o box do meio, com as tônicas na 5ª e 2ª cordas.',
    entender: [
      {
        text: [
          'O box 3 começa no 4 da 6ª corda. Em Lá, casa 10.',
          'As tônicas ficam na 5ª corda (casa 12) e na 2ª (casa 10): o desenho de oitava que pula duas cordas atravessando Sol–Si.',
        ],
        diagram: { mode: 'box', pc: 9, boxes: [2, 3], maxFret: 13, caption: 'Boxes 2 e 3 de Lá menor' },
      },
    ],
    executar: {
      instructions: [
        'Toque o box 3 de Lá dizendo os graus.',
        'Ligue: suba pelo box 2, desça pelo box 3.',
      ],
      quiz: { ...base, kinds: ['box-degree', 'box-find'], keys: [9], boxes: [3] },
    },
    memorizar: { ...base, kinds: ['box-find', 'box-degree', 'choice'], keys: KEYS, boxes: [3], choices: C_BOX3, count: 10 },
    aplicar: {
      instructions: [
        'No box 3, faça um bend da 4 para a 5 na 4ª corda (em Lá: casa 12, subindo até o som da casa 14). Toque a casa 14 antes para ouvir o alvo.',
      ],
    },
  },
  {
    id: 'p3-box45', phase: 3, module: 'Pentatônica menor', minutes: 18, prereqs: ['p3-box3'],
    title: 'Boxes 4 e 5: fechando o ciclo',
    goal: 'Completar os cinco desenhos e ligar o box 5 de volta ao box 1.',
    entender: [
      {
        text: [
          'Box 4: começa no 5 da 6ª corda (em Lá, casa 12). Box 5: começa na ♭7 (em Lá, casa 3).',
          'O box 5 fica logo antes do box 1: as notas de cima dele são as de baixo do box 1. Depois do box 4 vem o box 5 de novo, 12 casas acima.',
          'Com os cinco, a escala cobre o braço inteiro. A tônica é sempre o ponto de referência.',
        ],
        diagram: { mode: 'box', pc: 9, boxes: [5, 1, 2, 3, 4], maxFret: 15, caption: 'Os cinco boxes de Lá menor ligados (casa 2 à 15)' },
      },
    ],
    executar: {
      instructions: [
        'Toque o box 5 de Lá (casa 3) e passe para o box 1 (casa 5).',
        'Toque o box 4 de Lá (casa 12).',
        'Percorra o braço todo: box 5 → 1 → 2 → 3 → 4, uma subida em cada.',
      ],
      quiz: { ...base, kinds: ['box-degree', 'box-find'], keys: [9], boxes: [4, 5] },
    },
    memorizar: { ...base, kinds: ['box-find', 'box-degree', 'choice'], keys: KEYS, boxes: [4, 5, 1, 2, 3], choices: C_BOX45, count: 12 },
    aplicar: {
      instructions: [
        'Sobre uma base em Lá, improvise usando um box por minuto, na ordem 5 → 1 → 2 → 3 → 4, sempre mirando a tônica de cada box.',
      ],
    },
  },
  {
    id: 'p3-maior', phase: 3, module: 'Pentatônica maior', minutes: 15, prereqs: ['p3-box45'],
    title: 'Pentatônica maior: mesmos desenhos, outra tônica',
    goal: 'Usar os boxes que você já sabe para tocar em tom maior.',
    entender: [
      {
        text: [
          'A pentatônica maior tem 1, 2, 3, 5, 6. Dó maior pentatônica (Dó Ré Mi Sol Lá) tem as mesmas notas de Lá menor pentatônica.',
          'Ou seja: os desenhos são os mesmos. Muda qual nota é a tônica. A relativa menor fica 3 casas abaixo da tônica maior.',
          'Para tocar em Dó maior, use o box 1 de Lá menor (casa 5) — mas mire o Dó: 6ª corda casa 8, 3ª corda casa 5, 1ª corda casa 8.',
        ],
        diagram: { mode: 'box', pc: 0, scale: 'majorPentatonic', boxes: [1], maxFret: 12, caption: 'Box 1 de Dó maior: o desenho de Lá menor com os graus do maior' },
      },
      {
        text: ['Sol maior usa o desenho de Mi menor, na posição aberta.'],
        diagram: { mode: 'box', pc: 7, scale: 'majorPentatonic', boxes: [1], maxFret: 12, labels: 'note', caption: 'Box 1 de Sol maior' },
      },
    ],
    executar: {
      instructions: [
        'Toque o box 1 na casa 5 pensando em Dó maior: comece e termine no Dó (6ª corda, casa 8).',
        'Compare: o mesmo desenho, terminando no Lá, soa menor; terminando no Dó, soa maior.',
      ],
      quiz: { ...base, kinds: ['box-degree', 'box-find'], keys: [0], boxes: [1], scale: 'majorPentatonic' },
    },
    memorizar: { ...base, kinds: ['box-find', 'box-degree', 'choice'], keys: [0, 2, 7, 9, 4], boxes: [1, 2], scale: 'majorPentatonic', choices: C_MAIOR, count: 10 },
    aplicar: {
      instructions: [
        'Sobre uma base em Sol maior (ou num rock "alegre" em tom maior), improvise com o desenho de Mi menor mirando o Sol.',
        'Num blues em Lá, alterne frases da pentatônica menor (casa 5) e da maior (casa 2) e ouça a diferença.',
      ],
    },
  },
];
