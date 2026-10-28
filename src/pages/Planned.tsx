import { href } from '../app/router';

const CONTENT = {
  improvisacao: {
    title: 'Laboratório de improvisação',
    phase: 'Fase 6',
    planned: [
      'Bases instrumentais originais (blues tradicional, blues rock, rock clássico, rock menor) com ajuste de andamento.',
      'Progressão de acordes exibida em tempo real, com escalas recomendadas e notas-alvo.',
      'Desafios com restrição (ex.: improvisar com só três notas) e registro de observações.',
    ],
    now: [
      { to: '/mapa', label: 'Ver notas-alvo no mapa', tip: 'Em "Escalas e acordes", escolha uma escala e sobreponha um acorde: as notas do acorde que estão na escala aparecem como alvo.' },
      { to: '/acordes', label: 'Campo harmônico', tip: 'Monte I–IV–V em qualquer tonalidade e veja as notas de cada acorde.' },
      { to: '/tecnica', label: 'Metrônomo', tip: 'Improvise sobre o clique com a restrição da aula de oitavas (uma nota só, várias oitavas).' },
    ],
    note: 'As bases precisam ser gravações originais ou licenciadas. Nenhuma música protegida será reproduzida.',
  },
  ouvido: {
    title: 'Ouvido musical',
    phase: 'Fases 2 e 6',
    planned: [
      'Reconhecer intervalos (oitava, quinta, terças) tocados pelo app.',
      'Identificar se um acorde é maior ou menor.',
      'Reconhecer graus de progressões simples (I–IV–V).',
    ],
    now: [
      { to: '/mapa', label: 'Mapa com som', tip: 'Toque duas casas em sequência no mapa e compare: mesma nota em oitavas diferentes soa "igual, mais agudo".' },
      { to: '/escalas', label: 'Ouvir pentatônicas', tip: 'Cada box pode ser ouvido nota a nota.' },
    ],
    note: 'O áudio é sintetizado no próprio app; nenhum exercício auditivo depende de conexão.',
  },
} as const;

export function PlannedPage({ kind }: { kind: keyof typeof CONTENT }) {
  const c = CONTENT[kind];
  return (
    <div className="stack-l">
      <div>
        <h1>{c.title}</h1>
        <span className="badge">Em preparação · {c.phase}</span>
      </div>
      <section className="panel">
        <h2>O que este módulo vai ter</h2>
        <ul>{c.planned.map((p) => <li key={p}>{p}</li>)}</ul>
        <p className="small muted">{c.note}</p>
      </section>
      <section className="panel">
        <h2>O que já dá para usar</h2>
        <ul className="clean">
          {c.now.map((n) => (
            <li key={n.to}>
              <a href={href(n.to)}><strong>{n.label}</strong></a>
              <p className="small muted" style={{ margin: '2px 0 0' }}>{n.tip}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
