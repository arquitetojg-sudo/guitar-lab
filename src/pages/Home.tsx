import { useMemo } from 'react';
import { useStore } from '../app/store';
import { href, navigate } from '../app/router';
import { nextLesson, nextStep, trailProgress, STEPS } from '../learning/progress';
import { topicsToReview } from '../learning/mastery';
import { topicLabel } from '../learning/topics';
import { allCards, dueCount } from '../learning/cardRotation';
import { formatClock, useSessionClock, useSessionControls } from '../app/session';

const DAY = 86_400_000;

export function HomePage() {
  const { data } = useStore();
  const clock = useSessionClock();
  const controls = useSessionControls();
  const lesson = nextLesson(data.lessonProgress);
  const trail = trailProgress(data.lessonProgress);
  const weak = topicsToReview(data.attempts);
  const blocks = data.settings.sessionBlocks;
  const total = blocks.reduce((a, b) => a + b.minutes, 0);

  const dueCards = useMemo(
    () => dueCount(allCards(data.settings.naming, data.customCards), data.lessonProgress, data.cardStates),
    [data.settings.naming, data.customCards, data.lessonProgress, data.cardStates],
  );

  const week = data.attempts.filter((a) => a.ts > Date.now() - 7 * DAY);
  const weekAcc = week.length ? Math.round((week.filter((a) => a.correct && !a.usedHint && !a.revealed).length / week.length) * 100) : null;
  const last = data.sessions.at(-1);
  const resume = data.lastRoute && data.lastRoute !== '/' ? data.lastRoute : null;

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="stack-l">
      <div>
        <h1>{greet}. Treino de hoje</h1>
        <p className="muted">{total} minutos, em {blocks.length} blocos. Você pode pausar e retomar quando quiser.</p>
      </div>

      <section className="panel hero-next stack">
        {clock ? (
          <>
            <div className="row between">
              <h2 style={{ margin: 0 }}>Treino em andamento</h2>
              <span className={`badge ${clock.running ? 'warn' : ''}`}>{clock.running ? 'Rodando' : 'Pausado'}</span>
            </div>
            <p style={{ margin: 0 }}>Bloco {clock.index + 1} de {clock.session.blocks.length}: <strong>{clock.block.label}</strong> · <span className="num">{formatClock(clock.blockRemaining)}</span> restantes</p>
            <div className="row">
              <a className="btn primary" href={href('/sessao')}>Continuar treino</a>
            </div>
          </>
        ) : (
          <>
            <ol className="steps" style={{ margin: 0 }}>
              {blocks.map((b) => <li key={b.id}><span className="num">{b.minutes} min</span> · {b.label}</li>)}
            </ol>
            <div className="row">
              <button className="btn primary" onClick={() => { controls.start(blocks); navigate('/sessao'); }}>Iniciar treino de {total} min</button>
              <a className="btn ghost" href={href('/config')}>Ajustar blocos</a>
            </div>
          </>
        )}
      </section>

      {resume && (
        <a className="btn block" href={`#${resume}`} style={{ justifyContent: 'space-between' }}>
          <span>Continuar de onde parou</span>
          <span className="small muted">{describeRoute(resume)}</span>
        </a>
      )}

      <div className="grid2">
        <section className="panel">
          <h2>Próxima aula</h2>
          {lesson ? (
            <>
              <p style={{ marginBottom: 4 }}><strong>{lesson.title}</strong></p>
              <p className="small muted">{lesson.goal}</p>
              <p className="small">Etapa: {STEPS.find((s) => s.id === nextStep(lesson, data.lessonProgress))?.label}</p>
              <a className="btn" href={href(`/aulas/${lesson.id}`)}>Abrir aula</a>
            </>
          ) : (
            <p className="muted">Fase 1 concluída. Mantenha a revisão em dia enquanto as próximas fases não são liberadas.</p>
          )}
          <div style={{ marginTop: 14 }}>
            <div className="meter"><i style={{ width: `${(trail.done / trail.total) * 100}%` }} /></div>
            <p className="small muted num" style={{ marginTop: 4 }}>Trilha atual: {trail.done}/{trail.total} aulas</p>
          </div>
        </section>

        <section className="panel">
          <h2>Para revisar</h2>
          <ul className="clean">
            <li className="row between">
              <span>{dueCards} card(s) pendente(s)</span>
              <a className="btn small" href={href('/cards')}>Revisar</a>
            </li>
            <li className="row between">
              <span>{weak.length ? `${weak.length} assunto(s) com dificuldade` : 'Nenhum assunto com dificuldade'}</span>
              {weak.length > 0 && <a className="btn small" href={href('/treino?set=revisao')}>Treinar</a>}
            </li>
          </ul>
          {weak.length > 0 && <p className="small muted">{weak.slice(0, 3).map((w) => topicLabel(w.topic)).join(' · ')}</p>}
        </section>
      </div>

      <div className="grid2">
        <section className="panel">
          <h2>Desempenho recente</h2>
          {week.length ? (
            <p>Últimos 7 dias: <strong className="num">{week.length}</strong> respostas, <strong className="num">{weekAcc}%</strong> certas sem ajuda.</p>
          ) : <p className="muted">Sem exercícios nos últimos 7 dias.</p>}
          {last ? (
            <p className="small muted">Última sessão: {new Date(last.startedAt).toLocaleDateString('pt-BR')} · {Math.round(last.seconds / 60)} min</p>
          ) : <p className="small muted">Nenhuma sessão cronometrada ainda.</p>}
          <a className="small" href={href('/evolucao')}>Ver evolução completa</a>
        </section>
        <section className="panel">
          <h2>Atalhos</h2>
          <div className="row">
            <a className="btn" href={href('/mapa')}>Mapa do braço</a>
            <a className="btn" href={href('/treino')}>Exercícios</a>
            <a className="btn" href={href('/tecnica')}>Metrônomo</a>
            <a className="btn" href={href('/improvisacao')}>Improvisação</a>
          </div>
        </section>
      </div>
    </div>
  );
}

function describeRoute(r: string): string {
  if (r.startsWith('/aulas/')) return 'Aula';
  const map: Record<string, string> = { '/mapa': 'Mapa do braço', '/aulas': 'Trilha', '/treino': 'Exercícios', '/cards': 'Cards', '/tecnica': 'Técnica', '/escalas': 'Escalas', '/acordes': 'Acordes', '/musicas': 'Músicas', '/evolucao': 'Evolução', '/config': 'Configurações', '/sessao': 'Treino' };
  return map[r.split('?')[0]] ?? '';
}
