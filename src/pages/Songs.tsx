import { useState } from 'react';
import { useStore, uid } from '../app/store';
import type { Certainty, Song, SongField } from '../storage/types';

const PARTS = ['Riff', 'Base', 'Solo', 'Introdução', 'Dedilhado', 'Outra'];
const CERT_LABEL: Record<Certainty, string> = { confirmado: 'Confirmado', hipotese: 'Hipótese', desconhecido: 'Não sei' };

const blank = (): Song => ({
  id: '', title: '', artist: '', instrument: 'guitarra', part: 'Riff',
  key: { value: '', certainty: 'desconhecido' }, chords: { value: '', certainty: 'desconhecido' }, scales: { value: '', certainty: 'desconhecido' },
  techniques: '', difficulties: '', notes: '', createdAt: 0, updatedAt: 0,
});

function FieldWithCertainty({ label, value, onChange, placeholder }: { label: string; value: SongField; onChange: (v: SongField) => void; placeholder: string }) {
  return (
    <div className="stack" style={{ gap: 4 }}>
      <label className="field"><span>{label}</span>
        <input type="text" value={value.value} maxLength={200} placeholder={placeholder}
          onChange={(e) => onChange({ value: e.target.value, certainty: e.target.value && value.certainty === 'desconhecido' ? 'hipotese' : value.certainty })} />
      </label>
      <div className="seg" role="group" aria-label={`Certeza sobre ${label}`}>
        {(Object.keys(CERT_LABEL) as Certainty[]).map((c) => (
          <button type="button" key={c} aria-pressed={value.certainty === c} onClick={() => onChange({ ...value, certainty: c })}>{CERT_LABEL[c]}</button>
        ))}
      </div>
    </div>
  );
}

function CertBadge({ f }: { f: SongField }) {
  if (!f.value) return <span className="muted">—</span>;
  return <>{f.value} <span className={`badge ${f.certainty === 'confirmado' ? 'ok' : 'warn'}`}>{CERT_LABEL[f.certainty]}</span></>;
}

export function SongsPage() {
  const { data, actions } = useStore();
  const [edit, setEdit] = useState<Song | null>(null);
  const [err, setErr] = useState('');

  if (edit) {
    const set = (patch: Partial<Song>) => setEdit({ ...edit, ...patch });
    return (
      <form className="stack-l" onSubmit={(e) => {
        e.preventDefault();
        if (!edit.title.trim()) return setErr('Informe o nome da música.');
        const now = Date.now();
        actions.saveSong({ ...edit, id: edit.id || uid(), title: edit.title.trim(), artist: edit.artist.trim(), createdAt: edit.createdAt || now, updatedAt: now });
        setEdit(null);
        setErr('');
      }}>
        <div>
          <h1>{edit.id ? 'Editar ficha' : 'Nova ficha de análise'}</h1>
          <p className="muted">Preencha aos poucos. Marque o que você confirmou (numa fonte confiável ou de ouvido com certeza) e o que ainda é hipótese.</p>
        </div>
        <section className="panel stack">
          <label className="field"><span>Música *</span><input type="text" value={edit.title} maxLength={120} onChange={(e) => set({ title: e.target.value })} /></label>
          <label className="field"><span>Artista</span><input type="text" value={edit.artist} maxLength={120} onChange={(e) => set({ artist: e.target.value })} /></label>
          <div className="grid2">
            <label className="field"><span>Instrumento</span>
              <select value={edit.instrument} onChange={(e) => set({ instrument: e.target.value as Song['instrument'] })}>
                <option value="guitarra">Guitarra</option><option value="violao">Violão</option>
              </select>
            </label>
            <label className="field"><span>Parte estudada</span>
              <select value={edit.part} onChange={(e) => set({ part: e.target.value })}>{PARTS.map((p) => <option key={p}>{p}</option>)}</select>
            </label>
          </div>
        </section>
        <section className="panel stack">
          <h2>Análise</h2>
          <FieldWithCertainty label="Tonalidade" value={edit.key} onChange={(v) => set({ key: v })} placeholder="Ex.: Lá menor" />
          <FieldWithCertainty label="Acordes" value={edit.chords} onChange={(v) => set({ chords: v })} placeholder="Ex.: Am – G – F – E" />
          <FieldWithCertainty label="Escalas relacionadas" value={edit.scales} onChange={(v) => set({ scales: v })} placeholder="Ex.: pentatônica menor de Lá" />
          <label className="field"><span>Técnicas utilizadas</span><input type="text" value={edit.techniques} maxLength={200} onChange={(e) => set({ techniques: e.target.value })} placeholder="Ex.: bends, hammer-on, palhetada alternada" /></label>
          <label className="field"><span>Dificuldades encontradas</span><textarea value={edit.difficulties} maxLength={1000} onChange={(e) => set({ difficulties: e.target.value })} /></label>
          <label className="field"><span>Observações pessoais</span><textarea value={edit.notes} maxLength={2000} onChange={(e) => set({ notes: e.target.value })} /></label>
        </section>
        {err && <p className="notice bad" role="alert">{err}</p>}
        <div className="row">
          <button className="btn primary" type="submit">Salvar ficha</button>
          <button className="btn" type="button" onClick={() => setEdit(null)}>Cancelar</button>
          {edit.id && <button className="btn danger ghost" type="button" onClick={() => { if (confirm('Excluir esta ficha?')) { actions.deleteSong(edit.id); setEdit(null); } }}>Excluir</button>}
        </div>
      </form>
    );
  }

  const songs = [...data.songs].sort((a, b) => b.updatedAt - a.updatedAt);
  return (
    <div className="stack-l">
      <div>
        <h1>Análise de músicas</h1>
        <p className="muted">Cadastre o que você já toca e entenda o que está tocando. O app não preenche tonalidades ou acordes por conta própria.</p>
      </div>
      <button className="btn primary" onClick={() => setEdit(blank())}>Nova ficha</button>
      {songs.length === 0 ? (
        <div className="panel"><p className="muted">Nenhuma música cadastrada. Comece por uma que você toca bem — é mais fácil analisar o que já está nos dedos.</p></div>
      ) : (
        songs.map((s) => (
          <article key={s.id} className="panel stack">
            <div className="row between">
              <div>
                <h2 style={{ margin: 0 }}>{s.title}</h2>
                <p className="small muted" style={{ margin: 0 }}>{s.artist || 'Artista não informado'} · {s.part} · {s.instrument === 'guitarra' ? 'Guitarra' : 'Violão'}</p>
              </div>
              <button className="btn small" onClick={() => setEdit(s)}>Editar</button>
            </div>
            <table className="data">
              <tbody>
                <tr><th>Tonalidade</th><td><CertBadge f={s.key} /></td></tr>
                <tr><th>Acordes</th><td><CertBadge f={s.chords} /></td></tr>
                <tr><th>Escalas</th><td><CertBadge f={s.scales} /></td></tr>
                {s.techniques && <tr><th>Técnicas</th><td>{s.techniques}</td></tr>}
                {s.difficulties && <tr><th>Dificuldades</th><td>{s.difficulties}</td></tr>}
              </tbody>
            </table>
          </article>
        ))
      )}
    </div>
  );
}
