import { useEffect, useRef, useState } from 'react';
import { useStore } from '../app/store';
import { href } from '../app/router';
import { BACKINGS, STYLE_LABEL, chordName, chordPcs } from '../content/backings';
import { KEY_PC, LICKS } from '../content/licks';
import { allPositions, chordNotes, mod12, INTERVALS } from '../music';
import { Fretboard, type Mark } from '../ui/Fretboard';
import { openStringLabels, spelledShort } from '../ui/marks';
import { audioSupported } from '../ui/audio';
import { BackingPlayer } from '../ui/phrasePlayer';

const PENTA = new Set([0, 3, 5, 7, 10]);
const PENTA_NAMES = 'Sol, Si♭, Dó, Ré, Fá';

export function BackingsPage({ id }: { id?: string }) {
  const { data } = useStore();
  const st = data.settings;
  const prefs = { naming: st.naming, accidentals: st.accidentals };
  const base = BACKINGS.find((b) => b.id === id) ?? BACKINGS[0];
  const [bpm, setBpm] = useState(base.bpm);
  const [bar, setBar] = useState(-1);
  const [running, setRunning] = useState(false);
  const player = useRef<BackingPlayer | null>(null);

  useEffect(() => {
    player.current?.stop();
    setRunning(false);
    setBar(-1);
    setBpm(base.bpm);
  }, [base.id]);
  useEffect(() => () => player.current?.stop(), []);
  useEffect(() => {
    if (player.current) player.current.bpm = bpm;
  }, [bpm]);

  const toggle = () => {
    if (!player.current) {
      player.current = new BackingPlayer();
      player.current.onBar = setBar;
    }
    const p = player.current;
    if (p.running) {
      p.stop();
      setRunning(false);
      setBar(-1);
    } else {
      p.bpm = bpm;
      p.instrument = st.instrument;
      p.start(base);
      setRunning(true);
    }
  };

  const shown = base.bars[Math.max(0, bar)];
  const tones = new Set(chordPcs(shown));
  const toneNotes = chordNotes(shown.root, shown.quality);
  const outside = toneNotes.filter((n) => !PENTA.has(mod12(n.pc - KEY_PC)));
  const marks: Mark[] = allPositions(14)
    .filter((p) => PENTA.has(mod12(p.midi - KEY_PC)))
    .map((p) => ({
      string: p.string, fret: p.fret,
      role: tones.has(p.pc) ? 'chord' : mod12(p.pc - KEY_PC) === 0 ? 'root' : 'scale',
      label: INTERVALS[mod12(p.pc - KEY_PC)].short,
    }));
  const licks = LICKS.filter((l) => l.base === base.id);

  return (
    <div className="stack-l">
      <div>
        <h1>Bases para improvisar</h1>
        <p className="muted">Bases originais, sintetizadas no app (bateria, baixo e acordes), todas para a pentatônica de Sol menor ({PENTA_NAMES}).</p>
      </div>

      <nav className="panel" aria-label="Bases">
        <ul className="clean">
          {BACKINGS.map((b) => (
            <li key={b.id}>
              <a className="row between" href={href(`/bases/${b.id}`)} aria-current={b.id === base.id ? 'true' : undefined}
                style={{ textDecoration: 'none', color: 'var(--ink)', minHeight: 36, fontWeight: b.id === base.id ? 800 : 500 }}>
                <span>{b.title}</span>
                <span className="badge">{STYLE_LABEL[b.style]}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section className="panel stack">
        <h2 style={{ margin: 0 }}>{base.title}</h2>
        <p style={{ margin: 0 }}>{base.about}</p>

        <div role="list" aria-label="Compassos" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {base.bars.map((ch, i) => (
            <div key={i} role="listitem" aria-current={bar === i ? 'true' : undefined}
              style={{
                padding: '10px 4px', textAlign: 'center', borderRadius: 8, fontWeight: 800,
                border: '1px solid var(--line)',
                background: bar === i ? 'var(--c-chord)' : 'var(--surface-2)',
                color: bar === i ? '#fff' : 'var(--ink)',
              }}>
              {chordName(ch)}
            </div>
          ))}
        </div>

        {audioSupported() ? (
          <>
            <div className="row">
              <button className={`btn ${running ? '' : 'primary'}`} onClick={toggle}>{running ? 'Parar a base' : 'Tocar a base'}</button>
              <span className="num"><strong>{bpm}</strong> BPM</span>
              <button className="btn small" onClick={() => setBpm((b) => Math.max(50, b - 5))}>−5</button>
              <button className="btn small" onClick={() => setBpm((b) => Math.min(180, b + 5))}>+5</button>
            </div>
            <input type="range" min={50} max={180} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} aria-label="Andamento da base" style={{ width: '100%' }} />
          </>
        ) : <p className="notice">Este navegador não oferece áudio.</p>}
      </section>

      <section className="panel stack">
        <h2 style={{ margin: 0 }}>{running ? 'Agora: ' : 'Primeiro acorde: '}{chordName(shown)}</h2>
        <p className="small" style={{ margin: 0 }}>
          Notas do acorde: {toneNotes.map((n) => spelledShort(n.note, prefs)).join(' – ')}.
          {outside.length > 0 && <> Fora da pentatônica: <strong>{outside.map((n) => spelledShort(n.note, prefs)).join(', ')}</strong> — não é para tocar, é para saber que ela está soando.</>}
        </p>
        <Fretboard minFret={0} maxFret={14} marks={marks} stringLabels={openStringLabels(prefs)} leftHanded={st.leftHanded} title={`Pentatônica de Sol menor sobre ${chordName(shown)}`} />
        <p className="small muted" style={{ margin: 0 }}>Em azul: notas da pentatônica que fazem parte do acorde da vez. São os melhores lugares para terminar uma frase. O desenho muda sozinho quando o acorde troca.</p>
      </section>

      <section className="panel stack">
        <h2>Dicas</h2>
        <ul>{base.tips.map((t) => <li key={t}>{t}</li>)}</ul>
        {licks.length > 0 && (
          <p className="small">Licks que combinam com esta base: {licks.map((l, i) => (
            <span key={l.id}>{i > 0 && ', '}<a href={href(`/licks/${l.id}`)}>{l.artist ?? l.title}</a></span>
          ))}.</p>
        )}
      </section>
    </div>
  );
}
