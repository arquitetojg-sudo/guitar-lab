/** Exercícios técnicos. A tablatura é gerada a partir da sequência de notas. */
export interface TechNote {
  string: number;
  fret: number;
  finger: number;
}

export interface TechExercise {
  id: string;
  title: string;
  category: string;
  goal: string;
  notes: TechNote[];
  picking: string;
  startBpm: number;
  subdivision: string;
  posture: string[];
  cleanCriteria: string;
}

const ascendDescend = (pattern: number[]): TechNote[] => {
  const up: TechNote[] = [];
  for (const s of [6, 5, 4, 3, 2, 1]) for (const f of pattern) up.push({ string: s, fret: f, finger: f });
  const down: TechNote[] = [];
  for (const s of [1, 2, 3, 4, 5, 6]) for (const f of [...pattern].reverse()) down.push({ string: s, fret: f, finger: f });
  return [...up, ...down];
};

export const TECH_EXERCISES: TechExercise[] = [
  {
    id: 'cromatico-1234',
    title: 'Cromático 1-2-3-4',
    category: 'Cromatismos',
    goal: 'Um dedo por casa, sincronizando palhetada e mão esquerda.',
    notes: ascendDescend([1, 2, 3, 4]),
    picking: 'Alternada: baixo, cima, baixo, cima — começando para baixo em cada corda.',
    startBpm: 60,
    subdivision: 'colcheias (2 notas por clique)',
    posture: [
      'Polegar atrás do braço, apoiado de leve; punho reto.',
      'Mantenha os dedos que já tocaram pressionados até precisar deles (subindo) e perto das cordas.',
      'Movimento de palheta curto, vindo do punho, não do braço.',
    ],
    cleanCriteria: 'Todas as notas soam com o mesmo volume, sem trastejar e sem cordas soltas vazando.',
  },
  {
    id: 'cromatico-1324',
    title: 'Permutação 1-3-2-4',
    category: 'Independência da mão esquerda',
    goal: 'Quebrar a dependência entre dedos vizinhos (especialmente 3 e 4).',
    notes: ascendDescend([1, 3, 2, 4]),
    picking: 'Alternada estrita.',
    startBpm: 50,
    subdivision: 'colcheias',
    posture: ['Dedos arredondados, pontas perpendiculares à escala.', 'Se o 4º dedo sair muito da corda, diminua o BPM.'],
    cleanCriteria: 'Dedos voltam à posição sem levantar mais de 1–2 cm da corda.',
  },
  {
    id: 'aranha',
    title: 'Aranha (cordas alternadas)',
    category: 'Coordenação e mudança de corda',
    goal: 'Trocar de corda a cada duas notas, coordenando as duas mãos.',
    notes: [6, 5, 4, 3, 2].flatMap((s) => [
      { string: s, fret: 1, finger: 1 }, { string: s - 1, fret: 2, finger: 2 },
      { string: s, fret: 3, finger: 3 }, { string: s - 1, fret: 4, finger: 4 },
    ]),
    picking: 'Alternada. Observe que a palheta precisa "pular" para a corda seguinte sem movimento extra.',
    startBpm: 50,
    subdivision: 'colcheias',
    posture: ['Abafe com a mão direita as cordas graves que não estão em uso.', 'Mantenha o pulso relaxado; a força vem dos dedos, não do braço.'],
    cleanCriteria: 'Nenhuma nota anterior continua soando quando a próxima corda é tocada.',
  },
];

/** Gera tablatura ASCII simples (até `perLine` notas por linha). */
export function toTab(notes: TechNote[], perLine = 16): string {
  const names = ['e', 'B', 'G', 'D', 'A', 'E'];
  const blocks: string[] = [];
  for (let i = 0; i < notes.length; i += perLine) {
    const chunk = notes.slice(i, i + perLine);
    const lines = names.map((n) => `${n}|-`);
    for (const nt of chunk) {
      for (let s = 1; s <= 6; s++) {
        const cell = nt.string === s ? String(nt.fret) : '-'.repeat(String(nt.fret).length);
        lines[s - 1] += `${cell}-`;
      }
    }
    blocks.push(lines.map((l) => `${l}|`).join('\n'));
  }
  return blocks.join('\n\n');
}
