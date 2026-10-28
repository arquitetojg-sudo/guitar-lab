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
];

export const topicLabel = (id: string): string => TOPICS.find((t) => t.id === id)?.label ?? id;

/** Assunto de uma forma de oitava (cordas de origem e destino). */
export function octaveTopic(from: number, to: number): string {
  const skip = from - to;
  const crossesGB = from >= 3 && to <= 2;
  if (skip === 2) return crossesGB ? 'oitava:2c-gb' : 'oitava:2c';
  return crossesGB ? 'oitava:3c-gb' : 'oitava:3c';
}
