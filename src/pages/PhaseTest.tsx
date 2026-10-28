import { useMemo, useState } from 'react';
import { useStore } from '../app/store';
import { href, navigate } from '../app/router';
import { PHASES, lessonById } from '../content/lessons';
import { generateQuiz, mulberry32, type Question } from '../learning/exercises';
import { QUIZ_PASS } from '../learning/mastery';
import { pendingPhaseLessons, phaseTestOutcome, type PhaseTestOutcome } from '../learning/progress';
import { Quiz } from '../ui/Quiz';

/** Perguntas por aula na prova da fase. */
const PER_LESSON = 2;

/**
 * Prova da fase: perguntas do quiz de memorização de cada aula pendente.
 * Passou no geral → conclui a fase. Senão → conclui até a primeira aula com erro.
 */
export function PhaseTestPage({ phase }: { phase: number }) {
  const { data, actions } = useStore();
  const ph = PHASES.find((x) => x.id === phase);
  // Fixa as aulas no início: concluir aulas durante a prova não muda a lista.
  const [lessons] = useState(() => pendingPhaseLessons(phase, data.lessonProgress));
  const [seed, setSeed] = useState(() => Date.now());
  const [outcome, setOutcome] = useState<(PhaseTestOutcome & { score: number }) | null>(null);

  const { questions, owner } = useMemo(() => {
    const rng = mulberry32(seed);
    const qs: Question[] = [];
    const own: string[] = [];
    for (const l of lessons) {
      for (const q of generateQuiz(l.memorizar, PER_LESSON, rng)) {
        qs.push(q);
        own.push(l.id);
      }
    }
    return { questions: qs, owner: own };
  }, [lessons, seed]);

  if (!ph || !ph.available) {
    return (
      <div className="panel stack">
        <h1>Prova indisponível</h1>
        <p>Esta fase ainda está em preparação.</p>
        <a className="btn" href={href('/aulas')}>Voltar para a trilha</a>
      </div>
    );
  }

  if (!lessons.length) {
    return (
      <div className="panel stack">
        <h1>Fase {ph.id} concluída</h1>
        <p>Todas as aulas desta fase já estão concluídas.</p>
        <a className="btn" href={href('/aulas')}>Voltar para a trilha</a>
      </div>
    );
  }

  const stopLesson = outcome?.stopAt ? lessonById(outcome.stopAt) : undefined;

  return (
    <div className="stack-l">
      <div>
        <a href={href('/aulas')} className="small">Trilha</a>
        <h1 style={{ marginTop: 6 }}>Prova da Fase {ph.id}</h1>
        <p className="muted">
          {questions.length} perguntas, {PER_LESSON} de cada aula pendente, sem consulta. Com {Math.round(QUIZ_PASS * 100)}% ou mais sem dica, a fase inteira fica concluída.
          Abaixo disso, ficam concluídas as aulas que você acertou tudo, até a primeira com erro.
        </p>
      </div>

      <div className="panel">
        <Quiz
          key={`p${seed}`}
          questions={questions}
          level={2}
          passScore={QUIZ_PASS}
          onFinish={(results, score) => {
            const perLesson = lessons.map((l) => {
              const mine = results.filter((_, i) => owner[i] === l.id);
              return { lessonId: l.id, total: mine.length, clean: mine.filter((r) => r.correct && !r.usedHint && !r.revealed).length };
            });
            const out = phaseTestOutcome(perLesson, QUIZ_PASS);
            actions.testOut(out.pass, score);
            setOutcome({ ...out, score });
          }}
          onRestart={() => { setOutcome(null); setSeed(Date.now()); }}
        />
      </div>

      {outcome && (
        <div className="stack">
          {outcome.passedAll ? (
            <p className="notice ok">Fase {ph.id} concluída: {lessons.length} aulas liberadas. Elas continuam disponíveis pra revisar.</p>
          ) : (
            <p className="notice">
              {outcome.pass.length
                ? `${outcome.pass.length} ${outcome.pass.length === 1 ? 'aula concluída' : 'aulas concluídas'}. `
                : 'Nenhuma aula concluída. '}
              {stopLesson && <>Vale começar por <strong>{stopLesson.title}</strong>: lá teve erro.</>}
            </p>
          )}
          <div className="row">
            {stopLesson ? (
              <button className="btn primary" onClick={() => navigate(`/aulas/${stopLesson.id}`)}>Ir para {stopLesson.title}</button>
            ) : (
              <a className="btn primary" href={href('/aulas')}>Voltar para a trilha</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
