import { useState } from 'react';
import { useStore } from '../app/store';
import { href, navigate } from '../app/router';
import { formatClock, useSessionClock, useSessionControls } from '../app/session';
import { nextLesson } from '../learning/progress';
import { topicsToReview } from '../learning/mastery';
import type { SessionBlock } from '../storage/types';

function activityFor(kind: SessionBlock['kind'], lessonId: string | undefined, hasWeak: boolean): { to: string; label: string; tip: string } {
  switch (kind) {
    case 'tecnica': return { to: '/tecnica', label: 'Abrir técnica e metrônomo', tip: 'Exercício cromático com metrônomo. Comece devagar e só suba o BPM quando estiver limpo.' };
    case 'localizacao': return { to: '/treino?set=localizar', label: 'Abrir localização de notas', tip: 'Exercícios de memória do braço.' };
    case 'teoria': return lessonId ? { to: `/aulas/${lessonId}`, label: 'Abrir a aula atual', tip: 'Continue a etapa pendente da aula.' } : { to: '/aulas', label: 'Abrir a trilha', tip: 'Reveja uma aula concluída.' };
    case 'aplicacao': return lessonId ? { to: `/aulas/${lessonId}`, label: 'Abrir a aplicação da aula', tip: 'Leve o assunto da aula para um riff, base ou solo que você já toca.' } : { to: '/mapa', label: 'Abrir o mapa', tip: 'Aplique o que já estudou numa música.' };
    case 'revisao': return hasWeak ? { to: '/treino?set=revisao', label: 'Revisar dificuldades', tip: 'Exercícios dos assuntos com menos acerto.' } : { to: '/treino', label: 'Abrir exercícios', tip: 'Nada pendente — faça prática livre.' };
    case 'cards': return { to: '/cards', label: 'Abrir cards', tip: 'Revise os cards pendentes.' };
  }
}

export function SessionPage() {
  const { data } = useStore();
  const clock = useSessionClock();
  const c = useSessionControls();
  const [note, setNote] = useState('');
  const [finished, setFinished] = useState<number | null>(null);
  const lesson = nextLesson(data.lessonProgress);
  const hasWeak = topicsToReview(data.attempts).length > 0;

  if (finished !== null) {
    return (
      <div className="panel stack">
        <h1>Treino registrado</h1>
        <p>{finished >= 10 ? `${Math.round(finished / 60)} minuto(s) de prática salvos no seu histórico.` : 'Sessão muito curta — não foi registrada.'}</p>
        <p className="small muted">Tempo praticado não mede domínio: ele aparece separado dos resultados dos exercícios.</p>
        <a className="btn primary" href={href('/')}>Voltar ao início</a>
      </div>
    );
  }

  if (!clock) {
    return (
      <div className="panel stack">
        <h1>Nenhum treino em andamento</h1>
        <button className="btn primary" onClick={() => c.start(data.settings.sessionBlocks)}>Iniciar treino de hoje</button>
      </div>
    );
  }

  const act = activityFor(clock.block.kind, lesson?.id, hasWeak);
  const over = clock.blockRemaining <= 0;
  const isLast = clock.index === clock.session.blocks.length - 1;

  return (
    <div className="stack-l">
      <div>
        <h1>Treino de hoje</h1>
        <p className="muted num">Total: {formatClock(clock.total)} de {formatClock(clock.planned)}</p>
      </div>

      <section className="panel hero-next stack">
        <p className="small muted" style={{ margin: 0 }}>Bloco {clock.index + 1} de {clock.session.blocks.length}</p>
        <h2 style={{ margin: 0 }}>{clock.block.label}</h2>
        <div className="clock" role="timer" aria-live="off">{over ? '0:00' : formatClock(clock.blockRemaining)}</div>
        {over && <p className="notice ok" role="status">Tempo do bloco concluído. Siga para o próximo quando quiser.</p>}
        <p className="small">{act.tip}</p>
        <div className="row">
          {clock.running ? <button className="btn" onClick={c.pause}>Pausar</button> : <button className="btn primary" onClick={c.resume}>Retomar</button>}
          <a className="btn" href={href(act.to)}>{act.label}</a>
        </div>
        <div className="row">
          <button className="btn small" disabled={clock.index === 0} onClick={() => c.goTo(clock.index - 1)}>Bloco anterior</button>
          {!isLast && <button className={`btn small ${over ? 'primary' : ''}`} onClick={() => c.goTo(clock.index + 1)}>Próximo bloco</button>}
        </div>
      </section>

      <section className="panel">
        <h2>Blocos</h2>
        <ul className="clean block-list">
          {clock.session.blocks.map((b, i) => (
            <li key={b.id} className={i === clock.index ? 'active' : ''}>
              <span className="num" style={{ width: 92 }}>{formatClock(clock.elapsed[i])} / {b.minutes}:00</span>
              <span>{b.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel stack">
        <h2>Encerrar</h2>
        <label className="field"><span>Observação (opcional)</span><input type="text" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: mão esquerda cansou no cromático" /></label>
        <div className="row">
          <button className="btn primary" onClick={() => setFinished(c.finish(note.trim() || undefined) ?? 0)}>Concluir e salvar</button>
          <button className="btn danger ghost" onClick={() => { if (confirm('Descartar este treino sem salvar o tempo?')) { c.discard(); navigate('/'); } }}>Descartar</button>
        </div>
      </section>
    </div>
  );
}
