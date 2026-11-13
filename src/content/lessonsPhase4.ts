import type { ChoiceItem } from '../learning/exercises';
import type { Lesson } from './types';

/**
 * Fase 4 — Acordes e harmonia.
 * Acordes e campos harmônicos vêm do motor (`chords.ts`: terças empilhadas da escala);
 * os desenhos são calculados pela altura e ficam até a casa 12.
 */

const ALL = [6, 5, 4, 3, 2, 1];
const base = { strings: ALL, minFret: 1, maxFret: 10, naturalsOnly: false } as const;
const MAJOR_KEYS = [0, 7, 2, 9, 4, 5]; // Dó, Sol, Ré, Lá, Mi, Fá
const MINOR_KEYS = [9, 4, 2, 7, 11]; // Lá, Mi, Ré, Sol, Si

const C_POWER: ChoiceItem[] = [
  { topic: 'acorde:power', prompt: 'Por que o power chord não é nem maior nem menor?', options: ['Porque não tem terça', 'Porque não tem quinta', 'Porque tem a sétima', 'Porque usa só duas cordas'], answer: 0, explain: 'Power chord = 1 e 5 (às vezes com a 8). É a terça que define maior ou menor, e ele não tem.' },
  { topic: 'acorde:power', prompt: 'Power chord com fundamental na 5ª corda, casa 3. Qual é?', options: ['C5', 'G5', 'D5', 'A5'], answer: 0, explain: '5ª corda, casa 3 = Dó. O nome do power chord é o nome da fundamental: C5.' },
  { topic: 'acorde:power', prompt: 'Power chord com fundamental na 6ª corda, casa 7. Qual é?', options: ['B5', 'A5', 'C5', 'E5'], answer: 0, explain: '6ª corda, casa 7 = Si: B5.' },
];

const C_TRIADE: ChoiceItem[] = [
  { topic: 'acorde:triade', prompt: 'Uma tríade maior é formada por quais graus?', options: ['1, 3, 5', '1, ♭3, 5', '1, 4, 5', '1, 3, ♭7'], answer: 0, explain: 'Maior = 1, 3, 5. Menor troca só a terça: 1, ♭3, 5.' },
  { topic: 'acorde:triade', prompt: 'O que faz um acorde ser diminuto?', options: ['Terça menor e quinta diminuta (♭5)', 'Terça maior e quinta aumentada', 'Não ter terça', 'Ter a sétima menor'], answer: 0, explain: 'Diminuto = 1, ♭3, ♭5. A quinta diminuta (6 semitons) dá o som tenso.' },
  { topic: 'acorde:triade', prompt: 'Por que E maior tem G♯ e não A♭?', options: ['Uma letra por grau: a terça de E é a letra G', 'Porque soa diferente', 'É só preferência', 'Porque A♭ não existe'], answer: 0, explain: 'E–G–B são letras alternadas (1, 3, 5). A terça precisa ser "algum G": G♯. A♭ teria o mesmo som, mas seria uma quarta escrita.' },
];

const C_CAMPO_MAIOR: ChoiceItem[] = [
  { topic: 'campo:maior', prompt: 'Qual é a sequência de qualidades do campo harmônico maior?', options: ['M m m M M m dim', 'M M m m M m dim', 'm m M M m M dim', 'M m M m M m M'], answer: 0, explain: 'I, ii, iii, IV, V, vi, vii°: maior, menor, menor, maior, maior, menor, diminuto. Vale para qualquer tom maior.' },
  { topic: 'campo:maior', prompt: 'Quais são os três acordes maiores de um tom maior?', options: ['I, IV e V', 'I, ii e V', 'I, iii e vi', 'IV, V e vi'], answer: 0, explain: 'I, IV e V — a base de quase todo rock, blues e sertanejo.' },
  { topic: 'campo:maior', prompt: 'Em Sol maior, quais são os acordes menores?', options: ['Am, Bm, Em', 'Am, Dm, Em', 'Bm, Cm, Em', 'Am, Bm, F#m'], answer: 0, explain: 'Campo de Sol: G Am Bm C D Em F#°. Menores nos graus ii, iii e vi.' },
];

const C_CAMPO_MENOR: ChoiceItem[] = [
  { topic: 'campo:menor', prompt: 'Lá menor e Dó maior usam os mesmos acordes?', options: ['Sim, são tons relativos', 'Não, nenhum em comum', 'Só o Am', 'Só o C'], answer: 0, explain: 'Am B° C Dm Em F G = C Dm Em F G Am B° começando do 6º grau. Muda qual acorde é a "casa".' },
  { topic: 'campo:menor', prompt: 'No campo menor natural, quais graus são maiores?', options: ['III, VI e VII', 'I, IV e V', 'II, V e VI', 'III, IV e V'], answer: 0, explain: 'i ii° III iv v VI VII. Em Lá menor: C, F e G.' },
  { topic: 'campo:menor', prompt: 'No rock em tom menor é comum tocar o V maior (ex.: E em Lá menor). De onde vem esse acorde?', options: ['Da menor harmônica (7º grau elevado)', 'Do campo menor natural', 'De um erro de afinação', 'Do campo de Lá maior inteiro'], answer: 0, explain: 'No campo menor natural o v é menor (Em). Subir o 7º grau (Sol → Sol♯) transforma em E, que puxa mais forte para Am. É emprestado da menor harmônica.' },
];

const C_PROG: ChoiceItem[] = [
  { topic: 'progressao', prompt: 'G D Em C é qual progressão em Sol maior?', options: ['I–V–vi–IV', 'I–IV–V', 'ii–V–I', 'vi–IV–I–V'], answer: 0, explain: 'G (I), D (V), Em (vi), C (IV). É a progressão mais usada no pop, no louvor e no sertanejo.' },
  { topic: 'progressao', prompt: 'Am F G é qual progressão em Lá menor?', options: ['i–VI–VII', 'i–iv–v', 'vi–IV–V', 'i–III–VII'], answer: 0, explain: 'Am (i), F (VI), G (VII): som de rock "épico".' },
  { topic: 'progressao', prompt: 'No blues em Lá, os acordes A7, D7 e E7 são quais graus?', options: ['I7, IV7 e V7', 'I, ii e iii', 'i, iv e v', 'I, V e vi'], answer: 0, explain: 'I, IV e V, todos com sétima menor (dominantes). No campo maior só o V seria 7: o blues "quebra" a regra de propósito — daí o som característico.' },
];

const C_ESCALA: ChoiceItem[] = [
  { topic: 'harmonia:escala', prompt: 'Num blues em Lá (A7 D7 E7), qual pentatônica funciona como base?', options: ['Lá menor (box 1 na casa 5)', 'Lá maior apenas', 'Mi menor', 'Ré menor'], answer: 0, explain: 'A ♭3 da pentatônica menor contra o acorde maior com sétima é o som do blues. A pentatônica maior de Lá (casa 2) também funciona e dá um tom mais "doce".' },
  { topic: 'harmonia:escala', prompt: 'Como achar a música em tom maior ou menor?', options: ['Pelo acorde em que ela "descansa" (geralmente o primeiro e o último)', 'Pelo acorde mais rápido', 'Sempre pelo primeiro acorde da cifra', 'Pela afinação'], answer: 0, explain: 'A tônica é o acorde de repouso. Se ele é menor, use pentatônica menor; se é maior, pentatônica maior.' },
  { topic: 'harmonia:escala', prompt: 'O que é mirar uma nota do acorde (nota-alvo)?', options: ['Terminar a frase numa nota que pertence ao acorde da vez', 'Tocar só a tônica do tom', 'Tocar mais rápido no acorde', 'Fazer bend em toda nota'], answer: 0, explain: 'Quando o acorde muda, terminar a frase na 1, 3 ou 5 dele faz o solo "conversar" com a base.' },
];

export const PHASE4_LESSONS: Lesson[] = [
  {
    id: 'p4-power', phase: 4, module: 'Tríades e power chords', minutes: 10, prereqs: ['p3-maior'],
    title: 'Power chords: o nome vem da fundamental',
    goal: 'Dar nome a qualquer power chord pela casa da fundamental, nas cordas 6 e 5.',
    entender: [
      {
        text: [
          'Power chord = fundamental (1) + quinta justa (5), às vezes com a oitava (8). Cifra: nome da fundamental + 5 (A5, C5, F♯5).',
          'Você já sabe o desenho (Fase 2) e as notas das cordas 6 e 5 (Fase 1). Juntando: casa da fundamental → nome do acorde.',
        ],
        diagram: { mode: 'intervals', from: { string: 6, fret: 5 }, maxFret: 9, caption: 'A5: fundamental na 6ª corda, casa 5', intervals: [{ semitones: 7, string: 5 }, { semitones: 12, string: 4 }] },
      },
      {
        text: ['Com a fundamental na 5ª corda o desenho é o mesmo, uma corda abaixo.'],
        diagram: { mode: 'intervals', from: { string: 5, fret: 3 }, maxFret: 9, caption: 'C5: fundamental na 5ª corda, casa 3', intervals: [{ semitones: 7, string: 4 }, { semitones: 12, string: 3 }] },
      },
    ],
    executar: {
      instructions: [
        'Toque A5, C5, D5, E5 e G5 dizendo o nome antes de tocar. Use a 6ª ou a 5ª corda, a mais perto.',
        'Toque a mesma sequência só na 6ª corda, depois só na 5ª.',
      ],
      quiz: { ...base, kinds: ['chord-name'], chordQualities: ['power'], chordRootStrings: [6, 5] },
    },
    memorizar: { ...base, kinds: ['chord-name', 'chord-name', 'choice'], chordQualities: ['power'], chordRootStrings: [6, 5], choices: C_POWER, count: 10 },
    aplicar: {
      instructions: [
        'Pegue uma base de rock que você toca com power chords e escreva a cifra dela (ex.: E5 G5 A5).',
        'Toque a mesma base trocando a corda da fundamental (6ª ↔ 5ª) para ficar tudo perto de uma região do braço.',
      ],
    },
  },
  {
    id: 'p4-triades', phase: 4, module: 'Tríades e power chords', minutes: 15, prereqs: ['p4-power'],
    title: 'Tríades: maior, menor e diminuta',
    goal: 'Montar e reconhecer tríades pelos intervalos, com a grafia certa.',
    entender: [
      {
        text: [
          'Tríade = três notas empilhadas em terças: 1, 3, 5. Maior: 1, 3, 5. Menor: 1, ♭3, 5. Diminuta: 1, ♭3, ♭5.',
          'Grafia: uma letra por grau, pulando uma letra. Dó maior = C–E–G; Mi maior = E–G♯–B (G♯, não A♭); Si diminuto = B–D–F.',
          'No braço, a terça e a quinta ficam nas cordas vizinhas, nos desenhos que você aprendeu na Fase 2.',
        ],
        diagram: { mode: 'intervals', from: { string: 4, fret: 7 }, maxFret: 10, caption: 'Lá maior nas cordas 4, 3 e 2: 1, 3 e 5', intervals: [{ semitones: 4, string: 3 }, { semitones: 7, string: 2 }] },
      },
      {
        text: ['Abaixe a terça um semitom e o mesmo desenho vira Lá menor.'],
        diagram: { mode: 'intervals', from: { string: 4, fret: 7 }, maxFret: 10, caption: 'Lá menor nas cordas 4, 3 e 2: 1, ♭3 e 5', intervals: [{ semitones: 3, string: 3 }, { semitones: 7, string: 2 }] },
      },
    ],
    executar: {
      instructions: [
        'Toque Lá maior e Lá menor nas cordas 4, 3 e 2 (casa 7 na 4ª), mudando só a terça.',
        'Faça o mesmo com Sol (4ª corda, casa 5) e Ré (4ª corda, casa 12).',
        'Em qualquer acorde que você já toca (C, G, Am…), ache qual corda tem a terça.',
      ],
      quiz: { ...base, kinds: ['chord-quality', 'chord-spell'], chordQualities: ['major', 'minor'], chordRootStrings: [6, 5, 4], keys: MAJOR_KEYS },
    },
    memorizar: { ...base, kinds: ['chord-name', 'chord-quality', 'chord-spell', 'choice'], chordQualities: ['major', 'minor', 'dim'], chordRootStrings: [6, 5, 4], keys: MAJOR_KEYS, choices: C_TRIADE, count: 12 },
    aplicar: {
      instructions: [
        'Numa música que você toca, troque um acorde maior pelo menor (ou o contrário) e ouça a mudança de clima.',
        'Toque as notas de um acorde uma a uma (arpejo) em vez de tudo junto, dizendo 1, 3, 5.',
      ],
    },
  },
  {
    id: 'p4-campo-maior', phase: 4, module: 'Campo harmônico', minutes: 15, prereqs: ['p4-triades'],
    title: 'Campo harmônico maior',
    goal: 'Saber os sete acordes de um tom maior pelo padrão de qualidades.',
    entender: [
      {
        text: [
          'Empilhando terças sobre cada nota da escala maior saem sete acordes: I, ii, iii, IV, V, vi, vii°.',
          'O padrão é sempre o mesmo: maior, menor, menor, maior, maior, menor, diminuto. Algarismo maiúsculo = maior; minúsculo = menor.',
          'Dó maior: C Dm Em F G Am B°. Sol maior: G Am Bm C D Em F♯°. Decore o padrão, não as listas.',
        ],
      },
      {
        text: ['No braço, as fundamentais de I, IV e V ficam juntas: a IV na mesma casa da corda de cima, a V duas casas à frente — o mesmo desenho de quarta e quinta da Fase 2.'],
        diagram: { mode: 'intervals', from: { string: 6, fret: 5 }, maxFret: 9, caption: 'Em Lá: I (6ª, casa 5), IV e V na 5ª corda', intervals: [{ semitones: 5, string: 5 }, { semitones: 7, string: 5 }] },
      },
    ],
    executar: {
      instructions: [
        'Escreva o campo de Sol, Ré e Lá maior aplicando o padrão M m m M M m dim.',
        'Toque os 6 primeiros acordes do campo de Sol (G Am Bm C D Em) em sequência, como você já os conhece.',
      ],
      quiz: { ...base, kinds: ['field-chord', 'field-degree'], keys: MAJOR_KEYS, harmonyMode: 'major' },
    },
    memorizar: { ...base, kinds: ['field-chord', 'field-degree', 'choice'], keys: MAJOR_KEYS, harmonyMode: 'major', choices: C_CAMPO_MAIOR, count: 12 },
    aplicar: {
      instructions: [
        'Pegue a cifra de uma música em tom maior e escreva o grau de cada acorde.',
        'Escolha um tom e invente uma sequência de 4 acordes do campo. Toque e veja se soa "certo".',
      ],
    },
  },
  {
    id: 'p4-campo-menor', phase: 4, module: 'Campo harmônico', minutes: 15, prereqs: ['p4-campo-maior'],
    title: 'Campo harmônico menor',
    goal: 'Saber os acordes de um tom menor e a relação com o relativo maior.',
    entender: [
      {
        text: [
          'Campo menor natural: i, ii°, III, iv, v, VI, VII. Lá menor: Am B° C Dm Em F G.',
          'São os mesmos acordes do relativo maior (Dó), começando do 6º grau. A mesma relação da pentatônica: Lá menor ↔ Dó maior.',
          'No rock e no blues é comum trocar o v menor pelo V maior (Em → E em Lá menor). Esse acorde vem da escala menor harmônica e dá mais força para voltar ao i.',
        ],
      },
    ],
    executar: {
      instructions: [
        'Escreva o campo de Mi menor e de Ré menor.',
        'Toque Am – Dm – Em – Am e depois Am – Dm – E – Am. Compare o fim das duas.',
      ],
      quiz: { ...base, kinds: ['field-chord', 'field-degree'], keys: MINOR_KEYS, harmonyMode: 'naturalMinor' },
    },
    memorizar: { ...base, kinds: ['field-chord', 'field-degree', 'choice'], keys: MINOR_KEYS, harmonyMode: 'naturalMinor', choices: C_CAMPO_MENOR, count: 12 },
    aplicar: {
      instructions: [
        'Ache uma música de rock em tom menor que você conhece e escreva os graus dos acordes.',
      ],
    },
  },
  {
    id: 'p4-progressoes', phase: 4, module: 'Harmonia na prática', minutes: 15, prereqs: ['p4-campo-menor'],
    title: 'Progressões: pensar em graus',
    goal: 'Reconhecer as progressões mais comuns e levá-las para qualquer tom.',
    entender: [
      {
        text: [
          'Pensar em graus é o que permite mudar de tom: a progressão é a mesma, só os nomes mudam.',
          'As que mais aparecem: I–IV–V (rock e blues), I–V–vi–IV (pop, louvor, sertanejo), vi–IV–I–V (a mesma, começando do vi), ii–V–I (jazz e MPB) e, em menor, i–VI–VII (rock).',
          'Blues: I7–IV7–V7. Todos com sétima menor — fora do campo maior de propósito. É a ♭7 que você já toca na pentatônica.',
        ],
      },
    ],
    executar: {
      instructions: [
        'Toque I–V–vi–IV em Sol (G D Em C) e depois em Lá (A E F♯m D) e em Ré (D A Bm G).',
        'Toque I–IV–V em Mi com power chords (E5 A5 B5).',
      ],
      quiz: { ...base, kinds: ['progression'], keys: [0, 7, 2, 9, 4], harmonyMode: 'major', progressions: [[1, 4, 5], [1, 5, 6, 4]] },
    },
    memorizar: { ...base, kinds: ['progression', 'progression', 'choice'], keys: [0, 7, 2, 9, 4], harmonyMode: 'major', progressions: [[1, 4, 5], [1, 5, 6, 4], [2, 5, 1], [6, 4, 1, 5]], choices: C_PROG, count: 10 },
    aplicar: {
      instructions: [
        'Pegue 3 músicas que você toca e escreva a progressão em graus. Muitas vão ser iguais.',
        'Toque uma delas em outro tom usando só os graus.',
      ],
    },
  },
  {
    id: 'p4-escala-acorde', phase: 4, module: 'Harmonia na prática', minutes: 15, prereqs: ['p4-progressoes'],
    title: 'Qual escala usar sobre os acordes',
    goal: 'Escolher a pentatônica certa para uma base e mirar as notas dos acordes.',
    entender: [
      {
        text: [
          'Ache a tônica: o acorde em que a música descansa. Se ele é menor, pentatônica menor dele. Se é maior, pentatônica maior — com o desenho da relativa menor, 3 casas abaixo.',
          'Ex.: G D Em C está em Sol maior → pentatônica maior de Sol = desenho de Mi menor (casa 0 ou 12). Am F G está em Lá menor → pentatônica menor de Lá (casa 5).',
          'Para soar "dentro", termine as frases numa nota do acorde da vez (1, 3 ou 5). Isso é a nota-alvo, que a Fase 6 vai aprofundar.',
        ],
      },
    ],
    executar: {
      instructions: [
        'Sobre G D Em C, toque o box 1 de Mi menor (casa 12 ou aberto) terminando as frases em Sol.',
        'Sobre Am F G, toque o box 1 de Lá menor terminando as frases em Lá.',
      ],
      quiz: { ...base, kinds: ['improv-scale', 'choice'], keys: [0, 7, 2, 9, 4], choices: C_ESCALA },
    },
    memorizar: { ...base, kinds: ['improv-scale', 'improv-scale', 'choice'], keys: [0, 7, 2, 9, 4], choices: C_ESCALA, count: 10 },
    aplicar: {
      instructions: [
        'Grave (ou peça a alguém) uma base de 4 acordes de uma música que você conhece e improvise com a pentatônica certa por 2 minutos.',
        'Quando o acorde mudar, tente terminar a frase na fundamental do novo acorde.',
      ],
    },
  },
];
