import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../app/store';
import { href, navigate } from '../app/router';
import { LESSONS, lessonById } from '../content/lessons';
import type { DiagramSpec } from '../content/types';
import { generateQuiz, mulberry32 as mulberry } from '../learning/exercises';
import { QUIZ_PASS } from '../learning/mastery';
import { STEPS, lessonState, nextStep } from '../learning/progress';
import { Fretboard } from '../ui/Fretboard';
import { marksFromSpec, openStringLabels } from '../ui/marks';
import { Quiz } from '../ui/Quiz';
import type { Level, StepId } from '../storage/types';

export function Diagram({ spec }: { spec: DiagramSpec }) {
  const { data } = useStore();
  const prefs = { naming: data.settings.naming, accidentals: data.settings.accidentals };
  const marks = marksFromSpec(spec, prefs);
  return (
    <figure className="panel" style={{ padding: 6, margin: '8px 0 12px' }}>
      <Fretboard maxFret={spec.maxFret ?? 12} minFret={spec.minFret ?? 0} marks={marks} stringLabels={openStringLabels(prefs)} leftHanded={data.settings.leftHanded} title={spec.caption ?? 'Diagrama do braço'} />
      {spec.caption && <figcaption className="small muted" style={{ padding: '4px 8px' }}>{spec.caption}</figcaption>}
    </figure>
  );
}

export function LessonPage({ id }: { id: string }) {
  const { data, actions } = useStore();
  const lesson = lessonById(id);
  const progress = data.lessonProgress;
  const [step, setStep] = useState<StepId>(() => (lesson ? nextStep(lesson, progress) : 'entender'));
  const [seed, setSeed] = useState(() => Date.now());
  const [quizLevel, setQuizLevel] = useState<Level>(2);
  const [guidedDone, setGuidedDone] = useState(false);

  useEffect(() => {
    if (lesson) actions.touchLesson(lesson.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const guidedQs = useMemo(() => (lesson ? generateQuiz(lesson.executar.quiz, 6, mulberry(seed)) : []), [lesson, seed]);
  const memQs = useMemo(() => (lesson ? generateQuiz(lesson.memorizar, lesson.memorizar.count, mulberry(seed + 1)) : []), [lesson, seed]);

  if (!lesson) {
    return (
      <div className="panel">
        <h1>Aula não encontrada</h1>
        <a className="btn" href={href('/aulas')}>Voltar para a trilha</a>
      </div>
    );
  }

  const state = lessonState(lesson, progress);
  const p = progress[lesson.id];
  const steps = p?.steps ?? {};
  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  const nextL = LESSONS[idx + 1];

  if (state === 'locked') {
    const missing = lesson.prereqs.map((x) => lessonById(x)).filter((l) => l && !progress[l.id]?.completedAt);
    return (
      <div className="panel stack">
        <h1>{lesson.title}</h1>
        <p>Esta aula depende de:</p>
        <ul>{missing.map((m) => <li key={m!.id}><a href={href(`/aulas/${m!.id}`)}>{m!.title}</a></li>)}</ul>
        <p className="muted small">A trilha só avança depois de verificar a aprendizagem no quiz de memorização.</p>
      </div>
    );
  }

  const go = (s: StepId) => {
    setStep(s);
    window.scrollTo(0, 0);
  };

  return (
    <div className="stack-l">
      <div>
        <a href={href('/aulas')} className="small">Trilha</a>
        <h1 style={{ marginTop: 6 }}>{lesson.title}</h1>
        <p className="muted">{lesson.goal} <span className="num">· ~{lesson.minutes} min</span></p>
        {state === 'done' && <span className="badge ok">Concluída · melhor resultado {Math.round((p?.bestQuizScore ?? 0) * 100)}%</span>}
      </div>

      <nav className="stepper" aria-label="Etapas da aula">
        {STEPS.map((s) => (
          <button key={s.id} className={steps[s.id] ? 'done' : ''} aria-current={step === s.id ? 'step' : undefined} onClick={() => go(s.id)}>{s.label}</button>
        ))}
      </nav>

      {step === 'entender' && (
        <section className="stack">
          {lesson.entender.map((b, i) => (
            <div key={i}>
              {b.text.map((t, k) => <p key={k}>{t}</p>)}
              {b.diagram && <Diagram spec={b.diagram} />}
            </div>
          ))}
          <button className="btn primary" onClick={() => { actions.completeStep(lesson.id, 'entender'); go('executar'); }}>Entendi, ir para Executar</button>
        </section>
      )}

      {step === 'executar' && (
        <section className="stack">
          <h2>No instrumento</h2>
          <ol className="steps">{lesson.executar.instructions.map((t, k) => <li key={k}>{t}</li>)}</ol>
          {lesson.executar.diagram && <Diagram spec={lesson.executar.diagram} />}
          <h2>No app (com ajuda)</h2>
          <p className="small muted">Referências visíveis e dicas liberadas. Este treino não reprova.</p>
          <div className="panel">
            <Quiz
              key={`g${seed}`}
              questions={guidedQs}
              level={1}
              lessonId={lesson.id}
              onFinish={() => {
                setGuidedDone(true);
                actions.completeStep(lesson.id, 'executar');
              }}
              onRestart={() => setSeed(Date.now())}
            />
          </div>
          {(guidedDone || steps.executar) && <button className="btn primary" onClick={() => go('memorizar')}>Ir para Memorizar</button>}
        </section>
      )}

      {step === 'memorizar' && (
        <section className="stack">
          <h2>Sem consulta</h2>
          <p>Responda de memória. Para concluir, acerte pelo menos {Math.round(QUIZ_PASS * 100)}% sem dica nem resposta revelada.</p>
          <div className="seg" role="group" aria-label="Modo">
            <button aria-pressed={quizLevel === 2} onClick={() => { setQuizLevel(2); setSeed(Date.now()); }}>Sem tempo</button>
            <button aria-pressed={quizLevel === 3} onClick={() => { setQuizLevel(3); setSeed(Date.now()); }}>Com tempo ({data.settings.quickTimerSeconds}s)</button>
          </div>
          <div className="panel">
            <Quiz
              key={`m${seed}-${quizLevel}`}
              questions={memQs}
              level={quizLevel}
              lessonId={lesson.id}
              passScore={QUIZ_PASS}
              onFinish={(_, score) => {
                actions.recordQuizRun(lesson.id, score);
                if (score >= QUIZ_PASS) actions.completeStep(lesson.id, 'memorizar');
              }}
              onRestart={() => setSeed(Date.now())}
            />
          </div>
          {steps.memorizar && <button className="btn primary" onClick={() => go('aplicar')}>Ir para Aplicar</button>}
        </section>
      )}

      {step === 'aplicar' && (
        <section className="stack">
          <h2>Use na música</h2>
          <ol className="steps">{lesson.aplicar.instructions.map((t, k) => <li key={k}>{t}</li>)}</ol>
          {lesson.aplicar.diagram && <Diagram spec={lesson.aplicar.diagram} />}
          {!steps.memorizar ? (
            <p className="notice">Conclua a etapa Memorizar para registrar esta aula como concluída.</p>
          ) : steps.aplicar ? (
            <p className="notice ok">Aplicação registrada.</p>
          ) : (
            <>
              <p className="small muted">O app não escuta você tocando. Marque quando tiver feito a aplicação no instrumento.</p>
              <button className="btn primary" onClick={() => actions.completeStep(lesson.id, 'aplicar')}>Fiz a aplicação no instrumento</button>
            </>
          )}
          {state === 'done' || (steps.memorizar && steps.aplicar) ? (
            nextL ? (
              <button className="btn primary" onClick={() => navigate(`/aulas/${nextL.id}`)}>Próxima aula: {nextL.title}</button>
            ) : (
              <p className="notice ok">Você concluiu todo o conteúdo disponível da Fase 1. As próximas fases serão liberadas em novas versões.</p>
            )
          ) : null}
        </section>
      )}

      {p && Object.keys(steps).length > 0 && (
        <div className="row">
          <button className="btn small ghost" onClick={() => { if (confirm('Refazer as etapas desta aula? A aula continua contando como concluída na trilha e seu histórico é mantido.')) { actions.resetLesson(lesson.id); go('entender'); } }}>Refazer aula do início</button>
        </div>
      )}
    </div>
  );
}
