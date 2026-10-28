import { useState } from 'react';
import { useStore, uid } from '../app/store';
import { href } from '../app/router';
import { allTopicStats, type TopicStatus } from '../learning/mastery';
import { TOPICS, topicLabel } from '../learning/topics';
import { nextLesson, trailProgress } from '../learning/progress';
import { TECH_EXERCISES } from '../content/technique';

const STATUS: Record<TopicStatus, { label: string; cls: string }> = {
  novo: { label: 'Não praticado', cls: '' },
  aprendendo: { label: 'Aprendendo', cls: 'warn' },
  revisar: { label: 'Revisar', cls: 'bad' },
  dominado: { label: 'Dominado', cls: 'ok' },
};

export function ProgressPage() {
  const { data, actions } = useStore();
  const [goal, setGoal] = useState('');
  const trail = trailProgress(data.lessonProgress);
  const stats = allTopicStats(data.attempts);
  const clean = data.attempts.filter((a) => a.correct && !a.usedHint && !a.revealed).length;
  const totalSec = data.sessions.reduce((a, s) => a + s.seconds, 0);
  const next = nextLesson(data.lessonProgress);
  const ordered = TOPICS.map((t) => stats.find((s) => s.topic === t.id) ?? { topic: t.id, total: 0, correct: 0, recentAccuracy: 0, status: 'novo' as TopicStatus });

  return (
    <div className="stack-l">
      <div>
        <h1>Minha evolução</h1>
        <p className="muted">Domínio vem de acertos consistentes sem ajuda, em dias diferentes. Tempo de prática aparece à parte e não conta como domínio.</p>
      </div>

      <div className="grid2">
        <section className="panel">
          <h2>Resumo</h2>
          <table className="data">
            <tbody>
              <tr><th>Aulas concluídas</th><td className="num">{trail.done} / {trail.total}</td></tr>
              <tr><th>Exercícios respondidos</th><td className="num">{data.attempts.length}</td></tr>
              <tr><th>Certos sem ajuda</th><td className="num">{data.attempts.length ? Math.round((clean / data.attempts.length) * 100) : 0}%</td></tr>
              <tr><th>Assuntos dominados</th><td className="num">{stats.filter((s) => s.status === 'dominado').length} / {TOPICS.length}</td></tr>
              <tr><th>Tempo de prática cronometrado</th><td className="num">{Math.floor(totalSec / 3600)}h {Math.round((totalSec % 3600) / 60)}min</td></tr>
              <tr><th>Cards revisados</th><td className="num">{data.reviews.length}</td></tr>
            </tbody>
          </table>
        </section>
        <section className="panel">
          <h2>Próximo conteúdo</h2>
          {next ? <><p>{next.title}</p><a className="btn" href={href(`/aulas/${next.id}`)}>Abrir aula</a></> : <p className="muted">Fase 1 concluída.</p>}
          <h3 style={{ marginTop: 16 }}>Metas pessoais</h3>
          <form className="row" onSubmit={(e) => {
            e.preventDefault();
            const t = goal.trim();
            if (!t) return;
            actions.saveGoal({ id: uid(), text: t.slice(0, 200), createdAt: Date.now(), done: false });
            setGoal('');
          }}>
            <input type="text" value={goal} maxLength={200} onChange={(e) => setGoal(e.target.value)} placeholder="Ex.: achar qualquer nota da 5ª corda em 3 s" aria-label="Nova meta" style={{ flex: 1, minWidth: 180 }} />
            <button className="btn" type="submit">Adicionar</button>
          </form>
          <ul className="clean">
            {data.goals.map((g) => (
              <li key={g.id} className="row between">
                <label className="row"><input type="checkbox" checked={g.done} onChange={(e) => actions.saveGoal({ ...g, done: e.target.checked, doneAt: e.target.checked ? Date.now() : undefined })} /> <span style={{ textDecoration: g.done ? 'line-through' : undefined }}>{g.text}</span></label>
                <button className="btn small ghost danger" onClick={() => actions.deleteGoal(g.id)}>Excluir</button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel">
        <h2>Assuntos</h2>
        <table className="data">
          <thead><tr><th>Assunto</th><th>Respostas</th><th>Acerto recente</th><th>Situação</th><th></th></tr></thead>
          <tbody>
            {ordered.map((s) => (
              <tr key={s.topic}>
                <td>{topicLabel(s.topic)}</td>
                <td className="num">{s.total}</td>
                <td className="num">{s.total ? `${Math.round(s.recentAccuracy * 100)}%` : '—'}</td>
                <td><span className={`badge ${STATUS[s.status].cls}`}>{STATUS[s.status].label}</span></td>
                <td>{s.total > 0 && <button className="btn small ghost" onClick={() => confirm(`Apagar as ${s.total} respostas de "${topicLabel(s.topic)}"? Use se registrou respostas por engano.`) && actions.deleteAttemptsForTopic(s.topic)}>Limpar</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2>Andamento declarado (técnica)</h2>
        <p className="small muted">Valores que você informou após tocar com o metrônomo. Não são medidos pelo app.</p>
        <table className="data">
          <thead><tr><th>Exercício</th><th>Primeiro limpo</th><th>Melhor limpo</th><th>Registros</th></tr></thead>
          <tbody>
            {TECH_EXERCISES.map((ex) => {
              const h = data.bpm.filter((b) => b.exerciseId === ex.id && b.clean);
              return (
                <tr key={ex.id}>
                  <td>{ex.title}</td>
                  <td className="num">{h[0]?.bpm ?? '—'}</td>
                  <td className="num">{h.length ? Math.max(...h.map((x) => x.bpm)) : '—'}</td>
                  <td className="num">{data.bpm.filter((b) => b.exerciseId === ex.id).length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2>Sessões de prática</h2>
        {data.sessions.length === 0 ? <p className="muted small">Nenhuma sessão registrada. Use "Iniciar treino" na tela inicial.</p> : (
          <table className="data">
            <thead><tr><th>Data</th><th>Duração</th><th>Observação</th><th></th></tr></thead>
            <tbody>
              {[...data.sessions].reverse().slice(0, 30).map((s) => (
                <tr key={s.id}>
                  <td>{new Date(s.startedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="num">{Math.round(s.seconds / 60)} min</td>
                  <td className="small">{s.note ?? ''}</td>
                  <td><button className="btn small ghost danger" onClick={() => confirm('Excluir esta sessão do histórico?') && actions.deletePracticeSession(s.id)}>Excluir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
