import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../app/store';
import {
  DISTANCE_OPTIONS, checkAnswer, correctPositions, hintFor, type Answer, type Question,
} from '../learning/exercises';
import { quizScore } from '../learning/mastery';
import { topicLabel } from '../learning/topics';
import { formatNote, midiAt, mod12, spellPc, isNaturalPc } from '../music';
import { Fretboard, type Mark } from './Fretboard';
import { openStringLabels, shortName } from './marks';
import { playNote } from './audio';
import type { Level } from '../storage/types';

export interface QuizResult {
  topic: string;
  correct: boolean;
  usedHint: boolean;
  revealed: boolean;
}

interface Props {
  questions: Question[];
  level: Level;
  lessonId?: string;
  onFinish?: (results: QuizResult[], score: number) => void;
  onRestart?: () => void;
  passScore?: number;
}

const LEVEL_LABEL: Record<Level, string> = { 1: 'Aprendizagem guiada', 2: 'Recuperação da memória', 3: 'Recuperação rápida' };

export function Quiz({ questions, level, lessonId, onFinish, onRestart, passScore }: Props) {
  const { data, actions } = useStore();
  const st = data.settings;
  const prefs = { naming: st.naming, accidentals: st.accidentals };
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState<{ ok: boolean; ans?: Answer; timeout?: boolean } | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [done, setDone] = useState(false);
  const started = useRef(Date.now());
  const [now, setNow] = useState(Date.now());

  const q = questions[i];
  const limitMs = level === 3 ? st.quickTimerSeconds * 1000 : 0;

  useEffect(() => {
    started.current = Date.now();
    setNow(Date.now());
  }, [i]);

  // cronômetro opcional (nível 3)
  useEffect(() => {
    if (!limitMs || answered || done) return;
    const t = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(t);
  }, [limitMs, answered, done, i]);

  useEffect(() => {
    if (limitMs && !answered && !done && now - started.current > limitMs) submit(undefined, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const boardMax = useMemo(() => {
    if (!q) return 12;
    if (q.kind === 'octave' || q.kind === 'unison') return 15;
    if (q.kind === 'locate') return Math.max(12, q.maxFret);
    if (q.kind === 'identify' && q.pos.fret <= 5) return 5;
    return 12;
  }, [q]);

  if (!q && !done) return <p className="muted">Nenhuma pergunta disponível.</p>;

  function submit(ans: Answer | undefined, timeout = false) {
    if (answered || !q) return;
    const ok = !!ans && checkAnswer(q, ans);
    setAnswered({ ok, ans, timeout });
    const r: QuizResult = { topic: q.topic, correct: ok, usedHint, revealed };
    // só a primeira resposta de cada pergunta conta para o resultado do quiz
    setResults((rs) => (rs.length > i ? rs : [...rs, r]));
    void actions.recordAttempt({
      ts: Date.now(), topic: q.topic, kind: q.kind, level, correct: ok, usedHint, revealed, ms: Date.now() - started.current, lessonId,
    });
    if (st.sound && ans && 'pos' in ans) playNote(midiAt(ans.pos.string, ans.pos.fret), st.instrument);
  }

  function reveal() {
    setRevealed(true);
    submit(undefined);
  }

  function next() {
    if (i + 1 >= questions.length) {
      setDone(true);
      const all = results;
      onFinish?.(all, quizScore(all));
      return;
    }
    setI(i + 1);
    setAnswered(null);
    setUsedHint(false);
    setShowHint(false);
    setRevealed(false);
  }

  function retry() {
    setAnswered(null);
    setShowHint(false);
    started.current = Date.now();
  }

  if (done) {
    const score = quizScore(results);
    const missed = [...new Set(results.filter((r) => !(r.correct && !r.usedHint && !r.revealed)).map((r) => r.topic))];
    const passed = passScore === undefined || score >= passScore;
    return (
      <div className="stack">
        <h2>Resultado: {Math.round(score * 100)}%</h2>
        <p className="muted small">{results.filter((r) => r.correct && !r.usedHint && !r.revealed).length} de {results.length} certas sem ajuda (respostas com dica ou reveladas não contam).</p>
        {passScore !== undefined && (
          <div className={`notice ${passed ? 'ok' : ''}`}>
            {passed ? 'Aprovado nesta etapa.' : `Para avançar, é preciso ${Math.round(passScore * 100)}% sem ajuda. Revise e tente de novo — novas perguntas serão sorteadas.`}
          </div>
        )}
        {missed.length > 0 && (
          <div>
            <h3>Para revisar</h3>
            <ul>{missed.map((t) => <li key={t}>{topicLabel(t)}</li>)}</ul>
          </div>
        )}
        {onRestart && <button className="btn" onClick={onRestart}>Repetir com novas perguntas</button>}
      </div>
    );
  }

  // ---------- marcações do braço ----------
  const sol = answered ? correctPositions(q, boardMax) : [];
  const marks: Mark[] = [];
  let focusString: number | undefined;
  const guided = level === 1;
  const refMarks = (s: number) => [0, 5, 7, 12].filter((f) => f <= boardMax).map((f): Mark => ({ string: s, fret: f, role: 'muted', label: shortName(mod12(midiAt(s, f)), prefs) }));

  if (q.kind === 'identify') {
    marks.push({ string: q.pos.string, fret: q.pos.fret, role: answered ? (answered.ok ? 'right' : 'root') : 'focus', label: answered ? shortName(mod12(midiAt(q.pos.string, q.pos.fret)), { ...prefs, accidentals: 'both' }) : '?' });
    focusString = q.pos.string;
    if (guided && !answered) marks.push(...refMarks(q.pos.string).filter((m) => m.fret !== q.pos.fret));
  }
  if (q.kind === 'locate') {
    focusString = q.string;
    if (guided && !answered) marks.push(...refMarks(q.string));
  }
  if (q.kind === 'unison' || q.kind === 'octave') {
    marks.push({ string: q.from.string, fret: q.from.fret, role: 'root', label: shortName(mod12(midiAt(q.from.string, q.from.fret)), prefs) });
    focusString = q.toString;
  }
  if (q.kind === 'distance') {
    for (const f of [q.fretA, q.fretB]) marks.push({ string: q.string, fret: f, role: 'focus', label: guided || answered ? shortName(mod12(midiAt(q.string, f)), { ...prefs, accidentals: 'both' }) : undefined });
    focusString = q.string;
  }
  if (answered && 'pos' in (answered.ans ?? {})) {
    const p = (answered.ans as { pos: { string: number; fret: number } }).pos;
    if (!answered.ok) marks.push({ string: p.string, fret: p.fret, role: 'wrong', label: shortName(mod12(midiAt(p.string, p.fret)), prefs) });
  }
  if (answered) {
    for (const p of sol) marks.push({ string: p.string, fret: p.fret, role: 'right', label: shortName(mod12(midiAt(p.string, p.fret)), prefs) });
  }

  const usesBoardInput = q.kind === 'locate' || q.kind === 'unison' || q.kind === 'octave';
  const pcLabel = (pc: number) => shortName(pc, { ...prefs, accidentals: 'both' });
  const targetName = q.kind === 'locate' ? formatNote(spellPc(q.pc, st.accidentals === 'flat' ? 'flat' : 'sharp'), st.naming) + (isNaturalPc(q.pc) ? '' : ` / ${formatNote(spellPc(q.pc, st.accidentals === 'flat' ? 'sharp' : 'flat'), st.naming)}`) : '';

  let prompt = '';
  switch (q.kind) {
    case 'identify': prompt = `Qual nota está na ${q.pos.string}ª corda, casa ${q.pos.fret}?`; break;
    case 'locate': prompt = `Toque ${targetName} na ${q.string}ª corda.`; break;
    case 'unison': prompt = `Encontre o mesmo som (mesma altura) na ${q.toString}ª corda.`; break;
    case 'octave': prompt = `Encontre a oitava acima desta nota na ${q.toString}ª corda.`; break;
    case 'distance': prompt = `Qual é a distância entre as casas ${q.fretA} e ${q.fretB} da ${q.string}ª corda?`; break;
    case 'choice': prompt = q.prompt; break;
  }

  const elapsed = now - started.current;

  return (
    <div className="stack">
      <div className="row between small muted">
        <span>{LEVEL_LABEL[level]}</span>
        <span className="num">{i + 1} / {questions.length}</span>
      </div>
      {limitMs > 0 && !answered && (
        <div className="timer-bar" aria-hidden="true"><i style={{ width: `${Math.max(0, 100 - (elapsed / limitMs) * 100)}%` }} /></div>
      )}
      <p className="quiz-prompt" aria-live="polite">{prompt}</p>

      {q.kind !== 'choice' && (
        <div className="panel" style={{ padding: 6 }}>
          <Fretboard
            maxFret={boardMax}
            marks={marks}
            stringLabels={openStringLabels(prefs)}
            focusString={focusString}
            onTap={usesBoardInput && !answered ? (pos) => submit({ pos }) : undefined}
            leftHanded={st.leftHanded}
            title="Braço para responder"
          />
        </div>
      )}

      {q.kind === 'identify' && (
        <div className="note-pad" role="group" aria-label="Escolha a nota">
          {Array.from({ length: 12 }, (_, pc) => {
            const correctPc = mod12(midiAt(q.pos.string, q.pos.fret));
            const chosen = answered?.ans && 'pc' in answered.ans && answered.ans.pc === pc;
            const cls = answered ? (pc === correctPc ? 'right' : chosen ? 'wrong' : '') : '';
            return (
              <button key={pc} className={`btn ${cls}`} disabled={!!answered && !cls} onClick={() => submit({ pc })}>{pcLabel(pc)}</button>
            );
          })}
        </div>
      )}

      {(q.kind === 'choice' || q.kind === 'distance') && (
        <div className="choices" role="group" aria-label="Opções">
          {(q.kind === 'choice' ? q.options : DISTANCE_OPTIONS.map((o) => o.label)).map((opt, idx) => {
            const isRight = q.kind === 'choice' ? idx === q.answer : DISTANCE_OPTIONS[idx].semitones === Math.abs(q.fretB - q.fretA);
            const chosen = answered?.ans && 'index' in answered.ans && answered.ans.index === idx;
            const cls = answered ? (isRight ? 'right' : chosen ? 'wrong' : '') : '';
            return <button key={opt} className={`btn ${cls}`} disabled={!!answered && !cls} onClick={() => submit({ index: idx })}>{opt}</button>;
          })}
        </div>
      )}

      {showHint && !answered && <div className="notice small">{hintFor(q)}</div>}

      {answered && (
        <div className={`feedback ${answered.ok ? 'ok' : 'bad'}`} role="status">
          {answered.ok ? 'Correto.' : answered.timeout ? 'Tempo esgotado.' : revealed ? 'Resposta revelada.' : 'Não é essa.'}
          {!answered.ok && q.kind !== 'choice' && sol.length > 0 && <span style={{ fontWeight: 500 }}> A resposta certa está em verde no braço.</span>}
          {q.kind === 'choice' && <div style={{ fontWeight: 500, marginTop: 4 }}>{q.explain}</div>}
          {q.kind === 'distance' && !answered.ok && <div style={{ fontWeight: 500, marginTop: 4 }}>São {Math.abs(q.fretB - q.fretA)} casas = {DISTANCE_OPTIONS.find((o) => o.semitones === Math.abs(q.fretB - q.fretA))?.label}.</div>}
        </div>
      )}

      <div className="row">
        {!answered ? (
          <>
            <button className="btn" onClick={() => { setShowHint(true); setUsedHint(true); }} disabled={showHint}>Dica</button>
            <button className="btn ghost" onClick={reveal}>Ver resposta</button>
          </>
        ) : (
          <>
            <button className="btn primary" onClick={next}>{i + 1 >= questions.length ? 'Ver resultado' : 'Próxima'}</button>
            {!answered.ok && <button className="btn" onClick={retry}>Tentar de novo</button>}
          </>
        )}
      </div>
      <p className="small muted">Assunto: {topicLabel(q.topic)}</p>
    </div>
  );
}
