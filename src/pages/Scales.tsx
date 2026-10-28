import { useState } from 'react';
import { useStore } from '../app/store';
import { href } from '../app/router';
import { conventionalRoot, pentatonicBox, scaleNotes, SCALES, midiAt } from '../music';
import { Fretboard, type Mark } from '../ui/Fretboard';
import { openStringLabels, shortName, spelledShort } from '../ui/marks';
import { playSequence } from '../ui/audio';

export function ScalesPage() {
  const { data } = useStore();
  const st = data.settings;
  const prefs = { naming: st.naming, accidentals: st.accidentals };
  const [rootPc, setRootPc] = useState(9);
  const [kind, setKind] = useState<'minorPentatonic' | 'majorPentatonic'>('minorPentatonic');
  const [box, setBox] = useState(1);
  const [labels, setLabels] = useState<'nome' | 'grau' | 'dedo'>('grau');

  const root = conventionalRoot(rootPc, kind === 'minorPentatonic' ? 'minor' : 'major');
  const notes = scaleNotes(root, SCALES[kind]);
  const shape = pentatonicBox(rootPc, kind, box);
  const minF = Math.min(...shape.map((n) => n.fret));
  const maxF = Math.max(...shape.map((n) => n.fret));
  const nameOf = (pc: number) => {
    const n = notes.find((x) => x.pc === pc);
    return n ? spelledShort(n.note, prefs) : shortName(pc, prefs);
  };
  const marks: Mark[] = shape.map((n) => ({
    string: n.string, fret: n.fret, role: n.isRoot ? 'root' : 'scale',
    label: labels === 'grau' ? n.label : labels === 'dedo' ? String(Math.min(4, n.fret - minF + 1)) : nameOf(n.pc),
  }));
  const relativePc = kind === 'minorPentatonic' ? (rootPc + 3) % 12 : (rootPc + 9) % 12;
  const relative = conventionalRoot(relativePc, kind === 'minorPentatonic' ? 'major' : 'minor');

  return (
    <div className="stack-l">
      <div>
        <h1>Escalas e pentatônicas</h1>
        <p className="muted">Prévia de consulta. As aulas da Fase 3 (pentatônicas) ainda não foram liberadas; os desenhos abaixo já são calculados pelo motor musical.</p>
      </div>
      <div className="row">
        <label className="field" style={{ width: 'auto' }}><span>Tonalidade</span>
          <select value={rootPc} onChange={(e) => setRootPc(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, pc) => <option key={pc} value={pc}>{spelledShort(conventionalRoot(pc, kind === 'minorPentatonic' ? 'minor' : 'major'), prefs)}</option>)}
          </select>
        </label>
        <div className="seg" role="group" aria-label="Escala">
          <button aria-pressed={kind === 'minorPentatonic'} onClick={() => setKind('minorPentatonic')}>Pentatônica menor</button>
          <button aria-pressed={kind === 'majorPentatonic'} onClick={() => setKind('majorPentatonic')}>Pentatônica maior</button>
        </div>
      </div>
      <div className="row">
        <div className="seg" role="group" aria-label="Box">
          {[1, 2, 3, 4, 5].map((b) => <button key={b} aria-pressed={box === b} onClick={() => setBox(b)}>Box {b}</button>)}
        </div>
        <div className="seg" role="group" aria-label="Rótulos">
          <button aria-pressed={labels === 'grau'} onClick={() => setLabels('grau')}>Graus</button>
          <button aria-pressed={labels === 'nome'} onClick={() => setLabels('nome')}>Notas</button>
          <button aria-pressed={labels === 'dedo'} onClick={() => setLabels('dedo')}>Dedos</button>
        </div>
      </div>
      <div className="panel" style={{ padding: 6 }}>
        <Fretboard minFret={Math.max(0, minF - 1)} maxFret={Math.max(maxF + 1, minF + 5)} marks={marks} stringLabels={openStringLabels(prefs)} leftHanded={st.leftHanded} title={`Box ${box}`} />
      </div>
      <div className="panel">
        <h2>{spelledShort(root, prefs)} {kind === 'minorPentatonic' ? 'pentatônica menor' : 'pentatônica maior'} — box {box}, casas {minF}–{maxF}</h2>
        <p>{notes.map((n) => `${spelledShort(n.note, prefs)} (${n.label})`).join(' · ')}</p>
        <p className="small">Mesmas notas da {kind === 'minorPentatonic' ? 'pentatônica maior' : 'pentatônica menor'} de <strong>{spelledShort(relative, prefs)}</strong> (relativa). O que muda é qual nota funciona como repouso.</p>
        <p className="small muted">Fundamentais em vermelho. Repare como elas caem nos desenhos de oitava da Fase 1.</p>
        <div className="row">
          <button className="btn small" onClick={() => playSequence([...shape].map((n) => midiAt(n.string, n.fret)), st.instrument, 0.22)}>Ouvir o box</button>
          <a className="btn small" href={href('/mapa')}>Ver no mapa completo</a>
        </div>
      </div>
    </div>
  );
}
