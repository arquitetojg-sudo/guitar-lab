import { useMemo, useState } from 'react';
import { useStore } from '../app/store';
import { useRoute, navigate } from '../app/router';
import { generateQuiz, mulberry32 } from '../learning/exercises';
import { topicsToReview } from '../learning/mastery';
import { PRACTICE_SETS, reviewQuiz } from '../learning/specs';
import { topicLabel } from '../learning/topics';
import { Quiz } from '../ui/Quiz';
import type { Level } from '../storage/types';

export function PracticePage() {
  const { data } = useStore();
  const { query } = useRoute();
  const set = query.get('set') ?? '';
  const [level, setLevel] = useState<Level>((Number(query.get('nivel')) as Level) || 2);
  const [seed, setSeed] = useState(Date.now());
  const weak = topicsToReview(data.attempts);

  const questions = useMemo(() => {
    if (set === 'revisao') return reviewQuiz(weak.map((w) => w.topic), 10, seed);
    const ps = PRACTICE_SETS.find((p) => p.id === set);
    return ps ? generateQuiz(ps.spec, 10, mulberry32(seed)) : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set, seed]);

  const current = set === 'revisao' ? { label: 'Revisão de dificuldades' } : PRACTICE_SETS.find((p) => p.id === set);

  if (!current) {
    return (
      <div className="stack-l">
        <div>
          <h1>Exercícios</h1>
          <p className="muted">Prática livre: escolha um tipo. Acertos e erros entram no seu histórico e definem o que precisa de revisão.</p>
        </div>
        <div className="panel">
          <h2>Revisão de dificuldades</h2>
          {weak.length ? (
            <>
              <p className="small">Assuntos com menos de 70% de acerto recente: {weak.map((w) => topicLabel(w.topic)).join(', ')}.</p>
              <button className="btn primary" onClick={() => navigate('/treino?set=revisao')}>Revisar agora</button>
            </>
          ) : (
            <p className="small muted">Nada pendente. Os assuntos aparecem aqui quando o acerto recente fica abaixo de 70%.</p>
          )}
        </div>
        <div className="grid2">
          {PRACTICE_SETS.map((p) => (
            <div key={p.id} className="panel">
              <h3>{p.label}</h3>
              <p className="small muted">{p.description}</p>
              <button className="btn" onClick={() => navigate(`/treino?set=${p.id}`)}>Começar</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stack-l">
      <div>
        <a className="small" href="#/treino">Exercícios</a>
        <h1 style={{ marginTop: 6 }}>{current.label}</h1>
      </div>
      <div className="seg" role="group" aria-label="Nível">
        {([1, 2, 3] as Level[]).map((l) => (
          <button key={l} aria-pressed={level === l} onClick={() => { setLevel(l); setSeed(Date.now()); }}>
            {l === 1 ? 'Guiado' : l === 2 ? 'Memória' : 'Rápido'}
          </button>
        ))}
      </div>
      {level === 3 && <p className="small muted">O tempo limite é opcional e não é usado sozinho para medir domínio.</p>}
      {questions.length ? (
        <div className="panel">
          <Quiz key={`${set}-${seed}-${level}`} questions={questions} level={level} onRestart={() => setSeed(Date.now())} />
        </div>
      ) : (
        <p className="notice">Nenhum assunto para revisar no momento.</p>
      )}
    </div>
  );
}
