import { useStore } from '../app/store';
import { href } from '../app/router';
import { LESSONS, PHASES } from '../content/lessons';
import { lessonState, trailProgress } from '../learning/progress';

const STATE_LABEL = { locked: 'Bloqueada', available: 'Disponível', 'in-progress': 'Em andamento', done: 'Concluída' };

export function TrailPage() {
  const { data } = useStore();
  const prog = trailProgress(data.lessonProgress);
  const modules = [...new Set(LESSONS.map((l) => l.module))];

  return (
    <div className="stack-l">
      <div>
        <h1>Aulas e trilhas</h1>
        <p className="muted">Cada aula: entender, executar, memorizar e aplicar. A seguinte só abre depois do quiz de memorização.</p>
        <div className="meter" aria-label={`${prog.done} de ${prog.total} aulas concluídas`}><i style={{ width: `${(prog.done / prog.total) * 100}%` }} /></div>
        <p className="small muted num" style={{ marginTop: 4 }}>{prog.done} de {prog.total} aulas da Fase 1</p>
      </div>

      {PHASES.map((ph) => (
        <section key={ph.id} className="panel">
          <div className="row between">
            <h2 style={{ margin: 0 }}>Fase {ph.id} · {ph.title}</h2>
            {!ph.available && <span className="badge">Em preparação</span>}
          </div>
          <p className="small muted" style={{ marginTop: 6 }}>{ph.summary}</p>
          {ph.available ? (
            modules.map((m) => (
              <div key={m} style={{ marginTop: 12 }}>
                <h3>{m}</h3>
                <ul className="clean">
                  {LESSONS.filter((l) => l.phase === ph.id && l.module === m).map((l) => {
                    const s = lessonState(l, data.lessonProgress);
                    const n = LESSONS.indexOf(l) + 1;
                    const inner = (
                      <>
                        <span className={`state ${s === 'done' ? 'done' : s === 'in-progress' || s === 'available' ? 'current' : ''}`} aria-hidden="true">{s === 'done' ? '✓' : n}</span>
                        <span>
                          <strong>{l.title}</strong>
                          <span className="small muted" style={{ display: 'block' }}>{STATE_LABEL[s]} · ~{l.minutes} min</span>
                        </span>
                      </>
                    );
                    return (
                      <li key={l.id}>
                        {s === 'locked' ? (
                          <div className="lesson-row locked">{inner}</div>
                        ) : (
                          <a className="lesson-row" href={href(`/aulas/${l.id}`)}>{inner}</a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          ) : (
            <p className="small">Conteúdo previsto: {ph.topics.join(', ')}.</p>
          )}
        </section>
      ))}
    </div>
  );
}
