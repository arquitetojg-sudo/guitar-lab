import { useMemo, useState } from 'react';
import { useStore, uid } from '../app/store';
import { CARD_THEMES, type Card } from '../content/cards';
import { allCards, inRotation as inRot } from '../learning/cardRotation';
import { isDue, prioritize } from '../learning/srs';

type Mode = 'revisar' | 'livre' | 'criar' | 'historico';

function FlashCard({ card, onGrade, gradeLabel }: { card: Card; onGrade: (ok: boolean) => void; gradeLabel?: string }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="panel stack">
      <div className="row between small muted"><span>{card.theme}</span>{gradeLabel && <span>{gradeLabel}</span>}</div>
      <div className="flash">
        <div>{card.front}</div>
        {shown ? <div className="answer" aria-live="polite">{card.back}</div> : <div className="muted small">Responda mentalmente (ou em voz alta) antes de revelar.</div>}
      </div>
      {!shown ? (
        <button className="btn primary block" onClick={() => setShown(true)}>Revelar resposta</button>
      ) : (
        <div className="grid2">
          <button className="btn" onClick={() => onGrade(false)} style={{ borderColor: 'var(--bad)', color: 'var(--bad)' }}>Errei</button>
          <button className="btn primary" onClick={() => onGrade(true)}>Acertei</button>
        </div>
      )}
    </div>
  );
}

export function CardsPage() {
  const { data, actions } = useStore();
  const [mode, setMode] = useState<Mode>('revisar');
  const [theme, setTheme] = useState<string>('Todos');
  const [freeIdx, setFreeIdx] = useState(0);
  const [form, setForm] = useState({ front: '', back: '', theme: 'Pessoais' });
  const [formErr, setFormErr] = useState('');

  const all: Card[] = useMemo(() => allCards(data.settings.naming, data.customCards), [data.settings.naming, data.customCards]);
  const now = Date.now();
  const inRotation = all.filter((c) => inRot(c, data.lessonProgress));
  const due = prioritize(inRotation.map((c) => ({ ...c, state: data.cardStates[c.id] })), now);
  const filtered = all.filter((c) => theme === 'Todos' || c.theme === theme);
  const free = filtered[freeIdx % Math.max(1, filtered.length)];

  return (
    <div className="stack-l">
      <div>
        <h1>Cards de memorização</h1>
        <p className="muted">Revisão espaçada: o que você erra volta logo; o que acerta volta cada vez mais tarde. A prática livre não altera a agenda.</p>
      </div>
      <div className="seg" role="group" aria-label="Modo">
        <button aria-pressed={mode === 'revisar'} onClick={() => setMode('revisar')}>Pendentes ({due.length})</button>
        <button aria-pressed={mode === 'livre'} onClick={() => setMode('livre')}>Prática livre</button>
        <button aria-pressed={mode === 'criar'} onClick={() => setMode('criar')}>Meus cards</button>
        <button aria-pressed={mode === 'historico'} onClick={() => setMode('historico')}>Histórico</button>
      </div>

      {mode === 'revisar' && (
        due.length ? (
          <FlashCard key={due[0].id + (data.cardStates[due[0].id]?.reps ?? 0)} card={due[0]} gradeLabel={`${due.length} pendente(s)`} onGrade={(ok) => actions.reviewCard(due[0].id, ok)} />
        ) : (
          <div className="panel">
            <h2>Nada pendente agora</h2>
            <p className="muted">
              {inRotation.length === 0
                ? 'Os cards entram na revisão conforme você começa as aulas. Comece a primeira aula ou use a prática livre.'
                : `Próxima revisão: ${(() => {
                  const next = inRotation.map((c) => data.cardStates[c.id]?.due).filter((d): d is number => !!d && d > now).sort((a, b) => a - b)[0];
                  return next ? new Date(next).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
                })()}.`}
            </p>
          </div>
        )
      )}

      {mode === 'livre' && (
        <div className="stack">
          <label className="field" style={{ maxWidth: 320 }}>
            <span>Tema</span>
            <select value={theme} onChange={(e) => { setTheme(e.target.value); setFreeIdx(0); }}>
              <option>Todos</option>
              {CARD_THEMES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          {free ? (
            <FlashCard key={free.id + freeIdx} card={free} gradeLabel={`${(freeIdx % filtered.length) + 1} de ${filtered.length}`} onGrade={() => setFreeIdx((i) => i + 1)} />
          ) : <p className="muted">Nenhum card neste tema.</p>}
        </div>
      )}

      {mode === 'criar' && (
        <div className="stack">
          <form
            className="panel stack"
            onSubmit={(e) => {
              e.preventDefault();
              const front = form.front.trim();
              const back = form.back.trim();
              if (!front || !back) return setFormErr('Preencha a pergunta e a resposta.');
              if (front.length > 300 || back.length > 500) return setFormErr('Texto longo demais (máx. 300 caracteres na frente e 500 no verso).');
              actions.saveCustomCard({ id: `u-${uid()}`, front, back, theme: form.theme, createdAt: Date.now() });
              setForm({ front: '', back: '', theme: form.theme });
              setFormErr('');
            }}
          >
            <h2>Novo card</h2>
            <label className="field"><span>Frente (pergunta)</span><input type="text" value={form.front} maxLength={300} onChange={(e) => setForm({ ...form, front: e.target.value })} /></label>
            <label className="field"><span>Verso (resposta)</span><textarea value={form.back} maxLength={500} onChange={(e) => setForm({ ...form, back: e.target.value })} /></label>
            <label className="field"><span>Tema</span>
              <select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })}>{CARD_THEMES.map((t) => <option key={t}>{t}</option>)}</select>
            </label>
            {formErr && <p className="notice bad" role="alert">{formErr}</p>}
            <button className="btn primary" type="submit">Salvar card</button>
          </form>
          <div className="panel">
            <h2>Seus cards ({data.customCards.length})</h2>
            {data.customCards.length === 0 ? <p className="muted small">Você ainda não criou cards. Eles entram direto na revisão.</p> : (
              <ul className="clean">
                {data.customCards.map((c) => (
                  <li key={c.id} className="row between">
                    <span><strong>{c.front}</strong><br /><span className="small muted">{c.back} · {c.theme}</span></span>
                    <button className="btn small danger" onClick={() => confirm('Excluir este card?') && actions.deleteCustomCard(c.id)}>Excluir</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {mode === 'historico' && (
        <div className="panel">
          <h2>Histórico por card</h2>
          {Object.keys(data.cardStates).length === 0 ? <p className="muted small">Nenhuma revisão registrada ainda.</p> : (
            <table className="data">
              <thead><tr><th>Card</th><th>Acertos</th><th>Erros</th><th>Próxima</th></tr></thead>
              <tbody>
                {all.filter((c) => data.cardStates[c.id]).map((c) => {
                  const logs = data.reviews.filter((r) => r.cardId === c.id);
                  const s = data.cardStates[c.id];
                  return (
                    <tr key={c.id}>
                      <td>{c.front}</td>
                      <td className="num">{logs.filter((l) => l.correct).length}</td>
                      <td className="num">{logs.filter((l) => !l.correct).length}</td>
                      <td className="small">{isDue(s, now) ? 'agora' : new Date(s.due).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
