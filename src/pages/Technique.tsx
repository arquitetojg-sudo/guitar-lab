import { useState } from 'react';
import { useStore } from '../app/store';
import { TECH_EXERCISES, toTab } from '../content/technique';
import { MetronomePanel } from '../ui/MetronomePanel';

export function TechniquePage() {
  const { data, actions } = useStore();
  const [exId, setExId] = useState(TECH_EXERCISES[0].id);
  const ex = TECH_EXERCISES.find((e) => e.id === exId)!;
  const [bpm, setBpm] = useState(ex.startBpm);
  const [clean, setClean] = useState(true);
  const [saved, setSaved] = useState(false);
  const history = data.bpm.filter((b) => b.exerciseId === ex.id);
  const bestClean = history.filter((h) => h.clean).reduce((m, h) => Math.max(m, h.bpm), 0);

  return (
    <div className="stack-l">
      <div>
        <h1>Técnica e agilidade</h1>
        <p className="muted">Velocidade é consequência de precisão. Se sentir dor, pare — tensão não é treino.</p>
      </div>

      <div className="seg" role="group" aria-label="Exercício">
        {TECH_EXERCISES.map((e) => (
          <button key={e.id} aria-pressed={e.id === exId} onClick={() => { setExId(e.id); setBpm(e.startBpm); setSaved(false); }}>{e.title}</button>
        ))}
      </div>

      <section className="panel stack">
        <p className="small muted" style={{ margin: 0 }}>{ex.category}</p>
        <h2 style={{ margin: 0 }}>{ex.title}</h2>
        <p><strong>Objetivo:</strong> {ex.goal}</p>
        <pre className="tab" aria-label="Tablatura">{toTab(ex.notes)}</pre>
        <p className="small"><strong>Dedilhado:</strong> o número da casa é o dedo (1 indicador … 4 mínimo). <strong>Palhetada:</strong> {ex.picking}</p>
        <p className="small"><strong>Andamento inicial:</strong> {ex.startBpm} BPM em {ex.subdivision}.</p>
        <ul className="small">{ex.posture.map((p) => <li key={p}>{p}</li>)}</ul>
        <p className="small"><strong>Execução limpa:</strong> {ex.cleanCriteria}</p>
        <p className="small"><strong>Para subir o andamento:</strong> só depois de 3 passagens limpas seguidas; suba 4–5 BPM. Se errar, volte 10 BPM.</p>
      </section>

      <section className="panel">
        <h2>Metrônomo</h2>
        <MetronomePanel bpm={bpm} onBpm={(b) => { setBpm(b); setSaved(false); }} />
      </section>

      <section className="panel stack">
        <h2>Registrar andamento</h2>
        <p className="small muted">O app não escuta sua execução: o registro é o andamento do metrônomo que <em>você</em> declara ter tocado. Ele não mede precisão.</p>
        <div className="row">
          <label className="row small"><input type="checkbox" checked={clean} onChange={(e) => setClean(e.target.checked)} /> Toquei limpo a {bpm} BPM</label>
        </div>
        <button className="btn" disabled={saved} onClick={async () => {
          await actions.addBpm({ ts: Date.now(), exerciseId: ex.id, bpm, source: 'declared', clean });
          setSaved(true);
        }}>{saved ? 'Registrado' : `Registrar ${bpm} BPM`}</button>
        {history.length > 0 && (
          <>
            <p className="small">Maior andamento limpo declarado: <strong className="num">{bestClean || '—'}</strong> BPM</p>
            <table className="data">
              <thead><tr><th>Data</th><th>BPM</th><th>Limpo?</th><th></th></tr></thead>
              <tbody>
                {[...history].reverse().slice(0, 10).map((h) => (
                  <tr key={h.id}>
                    <td>{new Date(h.ts).toLocaleDateString('pt-BR')}</td>
                    <td className="num">{h.bpm}</td>
                    <td>{h.clean ? 'Sim' : 'Não'}</td>
                    <td><button className="btn small ghost danger" onClick={() => h.id !== undefined && actions.deleteBpm(h.id)} aria-label="Excluir registro">Excluir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>
    </div>
  );
}
