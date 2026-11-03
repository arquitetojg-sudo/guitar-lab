/** Assuntos rastreados para revisão e domínio. Cada exercício pertence a um assunto. */
export interface TopicDef {
  id: string;
  label: string;
  lessonId: string;
}

export const TOPICS: TopicDef[] = [
  { id: 'cordas-soltas', label: 'Cordas soltas', lessonId: 'f1-afinacao' },
  { id: 'cromatica', label: 'Tons e semitons', lessonId: 'f1-cromatica' },
  { id: 'nota:6', label: 'Notas na 6ª corda (Mi grave)', lessonId: 'f1-cordas-mi' },
  { id: 'nota:1', label: 'Notas na 1ª corda (Mi aguda)', lessonId: 'f1-cordas-mi' },
  { id: 'nota:5', label: 'Notas na 5ª corda (Lá)', lessonId: 'f1-corda-la' },
  { id: 'nota:4', label: 'Notas na 4ª corda (Ré)', lessonId: 'f1-cordas-internas' },
  { id: 'nota:3', label: 'Notas na 3ª corda (Sol)', lessonId: 'f1-cordas-internas' },
  { id: 'nota:2', label: 'Notas na 2ª corda (Si)', lessonId: 'f1-cordas-internas' },
  { id: 'acidentes', label: 'Sustenidos e bemóis', lessonId: 'f1-acidentes' },
  { id: 'unissono', label: 'Mesma nota em outra corda', lessonId: 'f1-unissono' },
  { id: 'oitava:2c', label: 'Oitava pulando uma corda (6ª→4ª, 5ª→3ª)', lessonId: 'f2-oitava-basica' },
  { id: 'oitava:2c-gb', label: 'Oitava pulando uma corda, com ajuste Sol–Si', lessonId: 'f2-oitava-sol-si' },
  { id: 'oitava:3c', label: 'Oitava pulando duas cordas (6ª→3ª)', lessonId: 'f2-oitava-longa' },
  { id: 'oitava:3c-gb', label: 'Oitava pulando duas cordas, com ajuste Sol–Si', lessonId: 'f2-oitava-longa' },
  { id: 'oitava:mapa', label: 'Oitavas pelo braço todo', lessonId: 'f2-mapa-oitavas' },
  { id: 'intervalo:nome', label: 'Nomes dos intervalos', lessonId: 'p2-intervalos' },
  { id: 'intervalo:quinta', label: 'Quinta e quarta justas no braço', lessonId: 'p2-quinta' },
  { id: 'intervalo:terca', label: 'Terça maior e terça menor no braço', lessonId: 'p2-tercas' },
  { id: 'intervalo:setima', label: 'Sétima menor e o mapa em volta da tônica', lessonId: 'p2-mapa-tonica' },
  { id: 'penta:box1', label: 'Pentatônica menor: box 1', lessonId: 'p3-box1' },
  { id: 'penta:tom', label: 'Mudar a pentatônica de tom', lessonId: 'p3-tonalidade' },
  { id: 'penta:box2', label: 'Pentatônica menor: box 2', lessonId: 'p3-box2' },
  { id: 'penta:box3', label: 'Pentatônica menor: box 3', lessonId: 'p3-box3' },
  { id: 'penta:box4', label: 'Pentatônica menor: box 4', lessonId: 'p3-box45' },
  { id: 'penta:box5', label: 'Pentatônica menor: box 5', lessonId: 'p3-box45' },
  { id: 'penta:maior', label: 'Pentatônica maior', lessonId: 'p3-maior' },
];

/** Assunto de um exercício de intervalo. */
export function intervalTopic(semis: number, mode?: 'same' | 'cross'): string {
  if (mode === 'same') return 'intervalo:nome';
  if (semis === 3 || semis === 4) return 'intervalo:terca';
  if (semis === 5 || semis === 7) return 'intervalo:quinta';
  if (semis === 10) return 'intervalo:setima';
  if (semis === 12) return 'oitava:mapa';
  return 'intervalo:nome';
}

/** Assunto de um exercício de box de pentatônica. */
export function boxTopic(box: number, scale: 'minorPentatonic' | 'majorPentatonic'): string {
  return scale === 'majorPentatonic' ? 'penta:maior' : `penta:box${box}`;
}

export const topicLabel = (id: string): string => TOPICS.find((t) => t.id === id)?.label ?? id;

/** Assunto de uma forma de oitava (cordas de origem e destino). */
export function octaveTopic(from: number, to: number): string {
  const skip = from - to;
  const crossesGB = from >= 3 && to <= 2;
  if (skip === 2) return crossesGB ? 'oitava:2c-gb' : 'oitava:2c';
  return crossesGB ? 'oitava:3c-gb' : 'oitava:3c';
}
