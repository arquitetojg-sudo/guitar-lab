import { useState } from 'react';
import { useStore } from '../app/store';
import { allPositions, chordSymbol, conventionalRoot, harmonicField, midiAt, scaleNotes, SCALES } from '../music';
import { Fretboard, type Mark } from '../ui/Fretboard';
import { openStringLabels, spelledShort } from '../ui/marks';
import { playSequence } from '../ui/audio';

const PROGRESSIONS: { label: string; mode: 'major' | 'naturalMinor'; degrees: number[] }[] = [
  { label: 'I – IV – V', mode: 'major', degrees: [1, 4, 5] },
  { label: 'I – V – vi – IV', mode: 'major', degrees: [1, 5, 6, 4] },
  { label: 'ii – V – I', mode: 'major', degrees: [2, 5, 1] },
  { label: 'i – iv – v', mode: 'naturalMinor', degrees: [1, 4, 5] },
  { label: 'i – VI – VII', mode: 'naturalMinor', degrees: [1, 6, 7] },
];

/** Alturas ascendentes a partir da fundamental (região de Dó3). */
function arpeggio(pcs: number[]): number[] {
  let prev = 48 + pcs[0];
  const out = [prev];
  for (const pc of pcs.slice(1)) {
    let m = prev + 1;
    while (m % 12 !== pc) m++;
    out.push(m);
    prev = m;
  }
  return out;
}

export function ChordsPage() {
  const { data } = useStore();
  const st = data.settings;
  const prefs = { naming: st.naming, accidentals: st.accidentals };
  const [rootPc, setRootPc] = useState(7);
  const [mode, setMode] = useState<'major' | 'naturalMinor'>('major');
  const [size, setSize] = useState<3 | 4>(3);
  const [deg, setDeg] = useState(1);

  const root = conventionalRoot(rootPc, mode === 'major' ? 'major' : 'minor');
  const scale = scaleNotes(root, SCALES[mode]);
  const field = harmonicField(root, mode, size);
  const chord = field[deg - 1];
  const tones = new Map(chord.notes.map((n) => [n.pc, n.label]));
  const name = (n: { letter: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'; acc: number }) => spelledShort(n, prefs);
  const marks: Mark[] = allPositions(12).filter((p) => tones.has(p.pc)).map((p) => ({
    string: p.string, fret: p.fret, role: tones.get(p.pc) === '1' ? 'root' : 'chord', label: tones.get(p.pc),
  }));

  return (
    <div className="stack-l">
      <div>
        <h1>Acordes e campo harmônico</h1>
        <p className="muted">Prévia de consulta. As aulas da Fase 4 ainda não foram liberadas; os acordes abaixo são construídos empilhando terças da escala.</p>
      </div>
      <div className="row">
        <label className="field" style={{ width: 'auto' }}><span>Tonalidade</span>
          <select value={rootPc} onChange={(e) => setRootPc(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, pc) => <option key={pc} value={pc}>{name(conventionalRoot(pc, mode === 'major' ? 'major' : 'minor'))}</option>)}
          </select>
        </label>
        <div className="seg" role="group" aria-label="Modo">
          <button aria-pressed={mode === 'major'} onClick={() => setMode('major')}>Maior</button>
          <button aria-pressed={mode === 'naturalMinor'} onClick={() => setMode('naturalMinor')}>Menor natural</button>
        </div>
        <div className="seg" role="group" aria-label="Tamanho">
          <button aria-pressed={size === 3} onClick={() => setSize(3)}>Tríades</button>
          <button aria-pressed={size === 4} onClick={() => setSize(4)}>Tétrades</button>
        </div>
      </div>

      <section className="panel">
        <h2>Escala de {name(root)} {mode === 'major' ? 'maior' : 'menor'}</h2>
        <p>{scale.map((n) => name(n.note)).join(' · ')}</p>
        <table className="data">
          <thead><tr><th>Grau</th><th>Acorde</th><th>Notas</th><th>Função</th></tr></thead>
          <tbody>
            {field.map((c) => (
              <tr key={c.degree} onClick={() => setDeg(c.degree)} style={{ cursor: 'pointer', background: c.degree === deg ? 'var(--surface-2)' : undefined }}>
                <td><button className="btn small ghost" onClick={() => setDeg(c.degree)} aria-pressed={c.degree === deg}>{c.roman}</button></td>
                <td><strong>{chordSymbol(c.root, c.quality)}</strong></td>
                <td className="small">{c.notes.map((n) => name(n.note)).join(' ')}</td>
                <td className="small">{c.fn}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="small muted" style={{ marginTop: 8 }}>Por quê? Cada acorde usa só notas da escala: fundamental, a terça acima e a quinta acima. A distância dessas terças (maior ou menor) define se o acorde é maior, menor ou diminuto.</p>
      </section>

      <section className="panel stack">
        <h2>{chord.roman} · {chordSymbol(chord.root, chord.quality)} — {chord.quality.name.toLowerCase()}</h2>
        <p className="small">{chord.notes.map((n) => `${name(n.note)} (${n.label})`).join(' · ')}</p>
        <div style={{ padding: 0 }}>
          <Fretboard maxFret={12} marks={marks} stringLabels={openStringLabels(prefs)} leftHanded={st.leftHanded} title={`Notas de ${chordSymbol(chord.root, chord.quality, 'en')} no braço`} />
        </div>
        <p className="small muted">Fundamental em vermelho; demais notas do acorde em azul, com sua função. Essas são as notas-alvo naturais para improvisar sobre este acorde.</p>
        <button className="btn small" onClick={() => playSequence(arpeggio(chord.notes.map((n) => n.pc)), st.instrument, 0.25)}>Ouvir arpejo</button>
      </section>

      <section className="panel">
        <h2>Progressões em {name(root)}</h2>
        <ul className="clean">
          {PROGRESSIONS.filter((p) => p.mode === mode).map((p) => (
            <li key={p.label} className="row between">
              <span><strong>{p.label}</strong>: {p.degrees.map((d) => chordSymbol(field[d - 1].root, field[d - 1].quality)).join(' – ')}</span>
              <button className="btn small" onClick={() => playSequence(p.degrees.map((d) => midiAt(6, 0) + ((field[d - 1].notes[0].pc - 4 + 12) % 12)), st.instrument, 0.5)}>Ouvir fundamentais</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
