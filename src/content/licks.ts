/**
 * Riffs, frases e licks na pentatônica de Sol menor (G B♭ C D F), até a casa 14.
 *
 * Os licks "no estilo de" são frases ORIGINAIS escritas com o vocabulário típico
 * de cada guitarrista (tipo de bend, região do braço, ritmo, recursos). Não são
 * transcrições de músicas.
 *
 * A tablatura usa a notação de `src/music/tab.ts`. Os testes conferem, pela altura
 * de cada nota, que tudo está na escala (ou é uma nota extra declarada).
 */

export type LickKind = 'riff' | 'frase' | 'estilo';

export interface Lick {
  id: string;
  kind: LickKind;
  title: string;
  /** Guitarrista de referência (só para `estilo`). */
  artist?: string;
  level: 1 | 2 | 3;
  bpm: number;
  feel: 'straight' | 'shuffle';
  /** Boxes da pentatônica de Sol menor usados. */
  boxes: number[];
  tab: string;
  /** Notas fora da pentatônica permitidas, em semitons acima de Sol (6 = b5, a blue note). */
  extras?: number[];
  /** O que reparar: por que a frase funciona dentro da escala. */
  ideas: string[];
  practice: string;
  /** Base sugerida para tocar por cima. */
  base?: string;
}

export const KEY_PC = 7; // Sol

export const LICKS: Lick[] = [
  // ---------- Riffs ----------
  {
    id: 'riff-abertura',
    kind: 'riff',
    title: 'Riff grave no box 1',
    level: 1,
    bpm: 90,
    feel: 'straight',
    boxes: [1],
    tab: '6:3@e 6:3 6:6 6:3 5:5@q 5:3@e 6:6 | 6:3@e 6:3 6:6 6:3 5:3@e h5:5 4:3@q',
    ideas: [
      'Só as duas cordas graves do box 1: 1 (Sol), b3 (Si♭), 4 (Dó), 5 (Ré).',
      'O segundo compasso responde ao primeiro e termina na b7 (Fá), que puxa de volta para o Sol.',
    ],
    practice: 'Abafe de leve com a lateral da mão direita (palm mute) nas notas da 6ª corda.',
    base: 'groove-gm',
  },
  {
    id: 'riff-cordas-soltas',
    kind: 'riff',
    title: 'Riff com Ré e Sol soltas',
    level: 2,
    bpm: 100,
    feel: 'straight',
    boxes: [1],
    tab: '4:0@e 4:3 4:0 4:5 4:0 4:3 h4:5 p4:3 | 5:5@e 4:0 5:3 4:0 5:5 3:3 /3:5@q',
    ideas: [
      'A corda Ré solta é a 5ª de Sol e a corda Sol solta é a tônica: no violão elas viram um "pedal" que deixa o riff cheio.',
      'Alternar nota presa com corda solta é um jeito de enxergar a escala além do desenho do box.',
    ],
    practice: 'Deixe a corda solta soar curta; a nota presa é a melodia.',
    base: 'groove-gm',
  },
  {
    id: 'riff-hard-rock',
    kind: 'riff',
    title: 'Riff hard rock com bend grave',
    level: 2,
    bpm: 96,
    feel: 'straight',
    boxes: [1],
    tab: '6:3@e 6:3 5:5@s p5:3 6:6@e 6:3 5:3b2@q 6:3@e | 6:3@e 6:3 5:5@s p5:3 6:6@e 4:3 h4:5 5:5 6:3',
    ideas: [
      'O bend na 5ª corda leva o Dó (4) até o Ré (5): bend bom sempre chega numa nota da escala.',
      'O pull-off rápido 5–3 na 5ª corda é o "tempero" do riff.',
    ],
    practice: 'Bend na corda grave: empurre para baixo (em direção ao chão) para não escapar do braço.',
    base: 'rock-power',
  },
  {
    id: 'riff-boogie',
    kind: 'riff',
    title: 'Riff shuffle 1–b3–4–5',
    level: 2,
    bpm: 110,
    feel: 'shuffle',
    boxes: [1],
    tab: '6:3@e 6:6 5:3 5:5 4:3 5:5 5:3 6:6 | 6:3@e 6:6 5:3 5:5 4:3@q 4:5@e p4:3',
    ideas: [
      'Sobe pela escala (1, b3, 4, 5, b7) e desce de volta: é a escala inteira virando riff.',
      'No shuffle, a primeira colcheia de cada tempo é mais longa (“tá...ta tá...ta”).',
    ],
    practice: 'Ouça primeiro no app para pegar o balanço do shuffle antes de acelerar.',
    base: 'blues-shuffle',
  },

  // ---------- Frases (possibilidades dentro da escala) ----------
  {
    id: 'frase-tercinas-box1',
    kind: 'frase',
    title: 'Box 1 descendo em grupos de 3',
    level: 1,
    bpm: 70,
    feel: 'straight',
    boxes: [1],
    tab: '1:6@t 1:3 2:6 1:3 2:6 2:3 2:6 2:3 3:5 2:3 3:5 3:3 | 3:5@t 3:3 4:5 3:3 4:5 4:3 4:5 4:3 5:5 4:3 5:5 5:3 | 5:5@t 5:3 6:6 6:3@h~ -@q',
    ideas: [
      'Mesmo desenho, outro caminho: em vez de descer nota a nota, cada grupo começa uma nota abaixo do anterior.',
      'Sequências assim mostram combinações de notas que você não acharia tocando a escala reta.',
    ],
    practice: 'Palhetada alternada estrita. Cada grupo de 3 cabe em um clique do metrônomo.',
    base: 'groove-gm',
  },
  {
    id: 'frase-quatro-subindo',
    kind: 'frase',
    title: 'Sequência de 4 subindo + bend',
    level: 2,
    bpm: 70,
    feel: 'straight',
    boxes: [1, 2],
    tab: '6:3@s 6:6 5:3 5:5 6:6 5:3 5:5 4:3 5:3 5:5 4:3 4:5 5:5 4:3 4:5 3:3 | 4:3@s 4:5 3:3 3:5 4:5 3:3 3:5 2:3 3:3 3:5 2:3 2:6 3:5 2:3 2:6 1:3 | 2:3@s 2:6 1:3 1:6 1:8b2@h~ r1:8@e 1:6@s p1:3',
    ideas: [
      'Grupos de 4 notas, cada um começando uma nota acima: a mesma escala soa como “corrida”.',
      'O fim sai do box 1 para a casa 8 (Dó), sobe com bend até o Ré e resolve no Sol.',
    ],
    practice: 'Comece a 60 BPM. Só suba quando o bend chegar afinado no Ré (compare com a casa 10).',
    base: 'rock-gm-f-eb',
  },
  {
    id: 'frase-ligando-boxes',
    kind: 'frase',
    title: 'Do box 1 ao box 3 pela corda Sol',
    level: 2,
    bpm: 80,
    feel: 'straight',
    boxes: [1, 2, 3],
    tab: '4:3@e 4:5 3:3 3:5 /3:7@q 2:6@e 2:8 | 3:7@e /3:10 2:8 2:11 1:8 h1:10 2:11 2:8 | 3:10b2@q~ r3:10@e 3:7 4:10 4:8 4:5@q',
    ideas: [
      'Os slides na 3ª corda são as “pontes” entre os boxes: 3:5 → 3:7 leva do box 1 ao 2, 3:7 → 3:10 do 2 ao 3.',
      'A frase termina no Sol da 4ª corda casa 5: a mesma tônica do box 1, alcançada por outro caminho.',
    ],
    practice: 'Marque no braço onde cada box começa e termina antes de tocar rápido.',
    base: 'rock-gm-f-eb',
  },
  {
    id: 'frase-motivo-4-lugares',
    kind: 'frase',
    title: 'O mesmo motivo em 4 lugares',
    level: 2,
    bpm: 80,
    feel: 'straight',
    boxes: [1, 3, 4],
    tab: '4:5@e 3:3 3:5 3:3 4:5@q -@q | 2:8@e 2:11 1:8 2:11 2:8@q -@q | 3:12@e 2:11 2:13 2:11 3:12@q -@q | 5:10@e 4:8 4:10 4:8 5:10@h~',
    ideas: [
      'O motivo é sempre 1 – b3 – 4 – b3 – 1 (Sol, Si♭, Dó, Si♭, Sol).',
      'Compasso 1: box 1. Compasso 2: uma oitava acima, no box 3. Compasso 3: mesma altura do 2, no box 4. Compasso 4: volta à altura do 1, no box 3.',
      'É o que as aulas de oitavas e intervalos prometiam: a ideia musical não depende do desenho.',
    ],
    practice: 'Invente um motivo de 3–4 notas e leve para os mesmos quatro lugares.',
    base: 'groove-gm',
  },
  {
    id: 'frase-pergunta-resposta',
    kind: 'frase',
    title: 'Pergunta e resposta',
    level: 1,
    bpm: 75,
    feel: 'straight',
    boxes: [2, 3],
    tab: '2:8@e 1:6 1:8b2@q~ r1:8@e 1:6 2:8@q | -@w | 2:11@e 2:8 3:10 3:7 4:10@q 4:8@e 4:10 | 5:10@w~',
    ideas: [
      'Frase, silêncio, frase. O compasso vazio é parte do solo: dá tempo de a frase “ser ouvida”.',
      'A pergunta termina no Sol agudo; a resposta desce e termina no Sol grave.',
    ],
    practice: 'Sobre a base, toque só pergunta e resposta, sempre deixando um compasso de silêncio.',
    base: 'balada-gm',
  },
  {
    id: 'frase-bends-alvos',
    kind: 'frase',
    title: 'Os bends que funcionam na escala',
    level: 2,
    bpm: 70,
    feel: 'straight',
    boxes: [1, 4],
    tab: '3:5b2@h~ r3:5@e 3:3 4:5@q | 2:6b2@h~ r2:6@e 2:3 3:5@q | 1:6b2@h~ r1:6@e 1:3 2:3@q | 2:13b2@h~ r2:13@e 2:11 3:12@q',
    ideas: [
      'Na pentatônica menor, bend de um tom só cai em nota da escala a partir de três graus: 4 → 5 (Dó → Ré), b7 → 1 (Fá → Sol) e b3 → 4 (Si♭ → Dó).',
      'Bend de um tom saindo do 1 ou do 5 cai fora da escala (Lá, Mi). Por isso os bends “clássicos” estão sempre nas mesmas casas.',
    ],
    practice: 'Antes de cada bend, toque a nota-alvo presa (2 casas acima) para ter o som de referência.',
    base: 'balada-gm',
  },
  {
    id: 'frase-sextinas-box4',
    kind: 'frase',
    title: 'Descida em sextinas com pull-off (box 4)',
    level: 3,
    bpm: 66,
    feel: 'straight',
    boxes: [4],
    tab: '1:13@x p1:10 2:13 p2:11 3:12 p3:10 2:13 p2:11 3:12 p3:10 4:12 p4:10 3:12 p3:10 4:12 p4:10 5:13 p5:10 4:12 p4:10 5:13 p5:10 6:13 p6:10 | 6:10@e h6:13 5:10 h5:13 5:13b2@q~ r5:13@e p5:10',
    ideas: [
      'Duas notas por corda, sempre “casa de cima com pull-off para a de baixo”: o box 4 inteiro em um gesto.',
      'Cada tempo começa uma corda abaixo do anterior; o padrão se repete deslocado.',
    ],
    practice: 'Treine um tempo (6 notas) de cada vez em loop. A palheta só toca a primeira nota de cada corda.',
    base: 'rock-gm-f-eb',
  },

  // ---------- No estilo de… ----------
  {
    id: 'estilo-bb-king',
    kind: 'estilo',
    artist: 'B.B. King',
    title: 'Poucas notas, bend e vibrato largo',
    level: 1,
    bpm: 70,
    feel: 'shuffle',
    boxes: [3],
    tab: '-@e 2:8 1:8b2@h~ r1:8@e 2:11 | 2:8@h~ -@h | 2:11@e 1:8 1:10@q~ 1:8@e 2:11 2:11b2@q~ | r2:11@e 2:8 3:10 3:7 2:8@h~',
    ideas: [
      'Região das casas 8–11, nas duas primeiras cordas (o famoso “box do B.B.”, entre os boxes 2 e 3).',
      'Cada nota longa ganha vibrato de punho; o silêncio entre as frases vale tanto quanto as notas.',
      'O bend sai do Dó (casa 8) e chega no Ré — a 5ª —, depois resolve na tônica.',
    ],
    practice: 'Toque com metade da velocidade que você acha que precisa. O segredo é a afinação do bend e o vibrato.',
    base: 'blues-menor',
  },
  {
    id: 'estilo-clapton',
    kind: 'estilo',
    artist: 'Eric Clapton (fase blues-rock)',
    title: 'Bend, pull-off e tercinas no box 1',
    level: 2,
    bpm: 80,
    feel: 'straight',
    boxes: [1],
    tab: '1:6b2@q~ r1:6@t p1:3 2:6 1:3@t 2:6 2:3 3:5b2@q~ | r3:5@t 3:3 4:5 3:3@e h3:5 3:3 4:5 4:5@q~',
    ideas: [
      'Box 1 no agudo, com bend de Si♭ para Dó na 1ª corda e de Dó para Ré na 3ª.',
      'Depois de cada bend, a frase desce em tercinas: tensão, depois movimento.',
    ],
    practice: 'Separe em dois pedaços (bend + tercinas). Junte só quando cada um sair limpo.',
    base: 'blues-menor',
  },
  {
    id: 'estilo-page',
    kind: 'estilo',
    artist: 'Jimmy Page',
    title: 'A tercina repetida com pull-off',
    level: 2,
    bpm: 84,
    feel: 'straight',
    boxes: [1],
    tab: '1:6@t p1:3 2:6 1:6 p1:3 2:6 1:6 p1:3 2:6 1:6 p1:3 2:6 | 1:6@t p1:3 2:6 1:6 p1:3 2:6 2:6 p2:3 3:5 2:6 p2:3 3:5 | 3:5b2@h~ r3:5@e 3:3 4:5@q',
    ideas: [
      'Um padrão de três notas repetido muitas vezes vira uma “parede” de som: típico do rock dos anos 70.',
      'Depois o mesmo padrão desce uma corda, e a frase termina no bend Dó → Ré.',
    ],
    practice: 'Só a primeira nota de cada tercina é palhetada; o pull-off faz a segunda.',
    base: 'rock-gm-f-eb',
  },
  {
    id: 'estilo-hendrix',
    kind: 'estilo',
    artist: 'Jimi Hendrix',
    title: 'Double stops nas cordas Sol e Si',
    level: 2,
    bpm: 84,
    feel: 'straight',
    boxes: [1, 2],
    tab: '3:7+2:8@e 3:7+2:8 3:5+2:6 3:7+2:8@q 3:5+2:6@e 3:3+2:3@q | 4:3@e h4:5 3:3 h3:5 4:5@q~ -@q | 2:8+1:8@q 2:6+1:6 2:8+1:8@e 2:6+1:6 3:7+2:8@q~',
    ideas: [
      'Duas notas da escala ao mesmo tempo em cordas vizinhas (quartas e terças): soa mais “acorde” que solo.',
      'As duplas vêm da própria pentatônica: Ré+Sol, Dó+Fá, Si♭+Ré.',
    ],
    practice: 'Use um dedo deitado (pestana pequena) para as duplas na mesma casa.',
    base: 'groove-gm',
  },
  {
    id: 'estilo-srv',
    kind: 'estilo',
    artist: 'Stevie Ray Vaughan',
    title: 'Corrida agressiva e a blue note',
    level: 3,
    bpm: 76,
    feel: 'straight',
    boxes: [1],
    extras: [6],
    tab: '1:6@s p1:3 2:6 p2:3 3:5 p3:3 4:5 3:3 3:5b2@h~ | r3:5@e 3:3 4:5 4:3 5:5 5:4 5:3 6:6 | 6:3@w~',
    ideas: [
      'Desce o box 1 com pull-offs em semicolcheias, ataque forte da palheta.',
      'No compasso 2 aparece a única nota fora da pentatônica: Ré♭ (b5, a “blue note”), passando de Ré para Dó.',
      'A b5 é nota de passagem: nunca pare nela.',
    ],
    practice: 'Ataque forte, mas sem tensionar o braço. Se as notas embolarem, volte 10 BPM.',
    base: 'blues-menor',
  },
  {
    id: 'estilo-angus',
    kind: 'estilo',
    artist: 'Angus Young',
    title: 'Repetição rápida no box 4',
    level: 3,
    bpm: 84,
    feel: 'straight',
    boxes: [4],
    tab: '2:13@s p2:11 3:12 p3:10 2:13 p2:11 3:12 p3:10 2:13 p2:11 3:12 p3:10 2:13 p2:11 3:12 p3:10 | 2:13b2@q~ r2:13@e p2:11 1:10@h~',
    ideas: [
      'Quatro notas (Dó, Si♭, Sol, Fá) repetidas em loop no box 4: energia por repetição.',
      'Termina com bend de Dó para Ré e o mesmo Ré preso na 1ª corda (casa 10).',
    ],
    practice: 'Primeiro sem metrônomo, bem devagar, depois em 60 BPM. Vibrato bem largo no final.',
    base: 'rock-power',
  },
  {
    id: 'estilo-gilmour',
    kind: 'estilo',
    artist: 'David Gilmour',
    title: 'Melodia lenta com pré-bend',
    level: 2,
    bpm: 66,
    feel: 'straight',
    boxes: [3, 4],
    tab: '2:11pb2@q r2:11 2:8@e 3:10 3:7@q~ | -@q 1:10@e 1:13 1:13b2@h~ | r1:13@q 1:10 2:13b2@q~ r2:13@e 2:11 | 3:12@w~',
    ideas: [
      'Pré-bend: dobre a corda antes de tocar e solte ouvindo a nota descer (Dó → Si♭).',
      'Bends grandes e lentos, com espaço: a frase canta como uma voz.',
      'Termina no Sol da 3ª corda, casa 12 — a tônica, longa e com vibrato.',
    ],
    practice: 'Antes do pré-bend, confira o som da casa 13 da 2ª corda: o pré-bend tem que soar igual.',
    base: 'balada-gm',
  },
  {
    id: 'estilo-slash',
    kind: 'estilo',
    artist: 'Slash',
    title: 'Corrida subindo e bend no box 4',
    level: 3,
    bpm: 80,
    feel: 'straight',
    boxes: [4],
    tab: '3:10@s h3:12 2:11 2:13 2:13b2@q~ r2:13@e p2:11 3:12 3:10 | 4:10@s 4:12 3:10 3:12 2:11 2:13 1:10 1:13 1:13b2@h~ | r1:13@e 1:10 2:13 2:11 3:12@h~',
    ideas: [
      'Corridas curtas que sobem duas notas por corda e explodem num bend.',
      'Os bends são sempre de 4 → 5 (Dó → Ré) e b7 → 1 (Fá → Sol).',
    ],
    practice: 'Isole a subida do compasso 2 em loop antes de juntar com o bend.',
    base: 'rock-power',
  },
];

export const LICK_KIND_LABEL: Record<LickKind, string> = {
  riff: 'Riffs',
  frase: 'Frases',
  estilo: 'No estilo de…',
};
