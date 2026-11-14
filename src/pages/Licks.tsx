import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../app/store';
import { href, navigate } from '../app/router';
import { LICKS, LICK_KIND_LABEL, KEY_PC, type LickKind } from '../content/licks';
import { BACKINGS } from '../content/backings';
import { midiAt, mod12, INTERVALS, allPositions, conventionalRoot, scaleNotes, SCALES } from '../music';
import { parsePhrase, phrasePositions, phraseTab } from '../music/tab';
import { Fretboard, type Mark } from '../ui/Fretboard';
import { openStringLabels, spelledShort } from '../ui/marks';
import { audioSupported } from '../ui/audio';
import { playPhrase, type PhraseHandle } from '../ui/phrasePlayer';

const PENTA = new Set([0, 3, 5, 7, 10]);
const stars = (n: number) => '●'.repeat(n) + '○'.repeat(3 - n);
const LEVEL = ['', 'tranquilo', 'médio', 'puxado'];

export function LicksPage({ id }: { id?: string }) {
  const { data, actions } = useStore();
  const st = data.settings;
  const prefs = { naming: st.naming, accidentals: st.accidentals };
  const lick = LICKS.find((l) => l.id === id) ?? LICKS[0];
  const kind = lick.kind;
  const phrase = useMemo(() => parsePhrase(lick.tab), [lick.tab]);
  const [bpm, setBpm] = useState(lick.bpm);
  const [loop, setLoop] = useState(false);
  const [labels, setLabels] = useState<'grau' | 'nota'>('grau');
  const [current, setCurrent] = useState(-1);
  const [saved, setSaved] = useState(false);
  const handle = useRef<PhraseHandle | null>(null);

  const stop = () => {
    handle.current?.stop();
    handle.current = null;
    setCurrent(-1);
  };
  useEffect(() => {
    stop();
    setBpm(lick.bpm);
    setSaved(false);
  }, [lick.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => handle.current?.stop(), []);

  const play = (tempo: number) => {
    stop();
    handle.current = playPhrase(phrase, {
      bpm: tempo, feel: lick.feel, instrument: st.instrument, loop,
      onEvent: (i) => {
        setCurrent(i);
        if (i === -1 && !loop) handle.current = null;
      },
    });
  };

  const notes = scaleNotes(conventionalRoot(KEY_PC, 'minor'), SCALES.blues);
  const labelOf = (s: number, f: number) => {
    const semis = mod12(midiAt(s, f) - KEY_PC);
    if (labels === 'grau') return INTERVALS[semis].short;
    const n = notes.find((x) => x.semitones === semis);
    return n ? spelledShort(n.note, prefs) : '';
  };

  const pos = phrasePositions(phrase);
  const frets = pos.map((p) => p.fret);
  const minF = Math.max(0, Math.min(...frets) - 1);
  const maxF = Math.min(15, Math.max(Math.max(...frets) + 1, minF + 5));
  const playing = current >= 0 ? new Set(phrase.events[current]?.notes.map((n) => `${n.string}:${n.fret}`)) : new Set<string>();
  const inLick = new Set(pos.map((p) => `${p.string}:${p.fret}`));
  const marks: Mark[] = [
    ...allPositions(maxF, undefined, minF)
      .filter((p) => PENTA.has(mod12(p.midi - KEY_PC)) && !inLick.has(`${p.string}:${p.fret}`))
      .map((p) => ({ string: p.string, fret: p.fret, role: 'muted' as const })),
    ...pos.map((p) => {
      const k = `${p.string}:${p.fret}`;
      const isRoot = mod12(midiAt(p.string, p.fret) - KEY_PC) === 0;
      return { string: p.string, fret: p.fret, role: playing.has(k) ? ('focus' as const) : isRoot ? ('root' as const) : ('scale' as const), label: labelOf(p.string, p.fret) };
    }),
  ];

  const exId = `lick:${lick.id}`;
  const history = data.bpm.filter((b) => b.exerciseId === exId);
  const bestClean = history.filter((h) => h.clean).reduce((m, h) => Math.max(m, h.bpm), 0);
  const base = BACKINGS.find((b) => b.id === lick.base);
  const list = LICKS.filter((l) => l.kind === kind);

  return (
    <div className="stack-l">
      <div>
        <h1>Licks e riffs</h1>
        <p className="muted">Tudo na pentatônica de Sol menor, até a casa 14. O objetivo é enxergar o que dá para fazer dentro da escala: sequências, ligações entre boxes, bends que caem certo, o mesmo motivo em lugares diferentes.</p>
      </div>

      <div className="seg" role="group" aria-label="Tipo">
        {(Object.keys(LICK_KIND_LABEL) as LickKind[]).map((k) => (
          <button key={k} aria-pressed={kind === k} onClick={() => { navigate(`/licks/${LICKS.find((l) => l.kind === k)!.id}`); }}>{LICK_KIND_LABEL[k]}</button>
        ))}
      </div>
      {kind === 'estilo' && <p className="small muted" style={{ marginTop: -8 }}>Frases originais com o vocabulário típico de cada guitarrista (tipo de bend, região do braço, ritmo). Não são trechos de músicas.</p>}

      <nav className="panel" aria-label="Lista">
        <ul className="clean">
          {list.map((l) => (
            <li key={l.id}>
              <a className="row between" href={href(`/licks/${l.id}`)} aria-current={l.id === lick.id ? 'true' : undefined}
                style={{ textDecoration: 'none', color: 'var(--ink)', minHeight: 36, fontWeight: l.id === lick.id ? 800 : 500 }}>
                <span>{l.artist ? <><strong>{l.artist}</strong> · </> : null}{l.title}</span>
                <span className="small muted" aria-label={`Dificuldade ${l.level} de 3`}>{stars(l.level)}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section className="panel stack">
        <div>
          <p className="small muted" style={{ margin: 0 }}>{lick.artist ? `No estilo de ${lick.artist}` : LICK_KIND_LABEL[lick.kind].replace(/s$/, '')} · box {lick.boxes.join(', ')} · {stars(lick.level)} {LEVEL[lick.level]}{lick.feel === 'shuffle' ? ' · shuffle' : ''}</p>
          <h2 style={{ margin: '2px 0 0' }}>{lick.title}</h2>
        </div>

        <div className="row">
          <div className="seg" role="group" aria-label="Rótulos">
            <button aria-pressed={labels === 'grau'} onClick={() => setLabels('grau')}>Graus</button>
            <button aria-pressed={labels === 'nota'} onClick={() => setLabels('nota')}>Notas</button>
          </div>
        </div>
        <div style={{ padding: 0 }}>
          <Fretboard minFret={minF} maxFret={maxF} marks={marks} stringLabels={openStringLabels(prefs)} leftHanded={st.leftHanded} title={`Notas de ${lick.title}`} />
        </div>
        <p className="small muted" style={{ marginTop: -4 }}>Notas grandes: as do lick (tônica em vermelho). Pontos claros: o resto da pentatônica nessa região — as outras opções que você tinha.</p>

        <pre className="tab" aria-label="Tablatura">{phraseTab(phrase)}</pre>
        <p className="small muted" style={{ marginTop: -8 }}>h = hammer-on · p = pull-off · / \ = slide · 13b15 = bend da casa 13 até soar como a 15 · pb = pré-bend · r = soltar o bend · ~ = vibrato. Números embaixo: tempos do compasso.</p>

        {audioSupported() ? (
          <div className="stack">
            <div className="row">
              <button className={`btn ${current >= 0 ? '' : 'primary'}`} onClick={() => (current >= 0 ? stop() : play(bpm))}>{current >= 0 ? 'Parar' : `Ouvir a ${bpm} BPM`}</button>
              <button className="btn small" onClick={() => play(Math.round(bpm * 0.6))}>Ouvir devagar</button>
              <label className="row small"><input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} /> Repetir</label>
            </div>
            <input type="range" min={40} max={180} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} aria-label="Andamento em BPM" style={{ width: '100%' }} />
            <p className="small muted" style={{ margin: 0 }}>Áudio sintetizado, para referência de ritmo e de onde o bend chega. Sugestão de andamento inicial: {lick.bpm} BPM.</p>
          </div>
        ) : <p className="notice">Este navegador não oferece áudio.</p>}
      </section>

      <section className="panel stack">
        <h2>O que reparar</h2>
        <ul>{lick.ideas.map((t) => <li key={t}>{t}</li>)}</ul>
        <p className="small"><strong>Como treinar:</strong> {lick.practice}</p>
        {base && (
          <p className="small">Depois de tocar limpo, toque por cima da base <a href={href(`/bases/${base.id}`)}><strong>{base.title}</strong></a> e invente uma variação: mude o ritmo, troque a nota final, leve para outro box.</p>
        )}
      </section>

      <section className="panel stack">
        <h2>Registrar andamento</h2>
        <p className="small muted">O app não escuta sua execução: o registro é o andamento que você declara ter tocado.</p>
        <div className="row">
          <button className="btn small" onClick={() => setBpm((b) => Math.max(40, b - 5))}>−5</button>
          <span className="num"><strong>{bpm}</strong> BPM</span>
          <button className="btn small" onClick={() => setBpm((b) => Math.min(180, b + 5))}>+5</button>
          <button className="btn" disabled={saved} onClick={async () => {
            await actions.addBpm({ ts: Date.now(), exerciseId: exId, bpm, source: 'declared', clean: true });
            setSaved(true);
          }}>{saved ? 'Registrado' : `Toquei limpo a ${bpm}`}</button>
        </div>
        {bestClean > 0 && <p className="small">Maior andamento limpo declarado: <strong className="num">{bestClean}</strong> BPM ({history.length} registro{history.length > 1 ? 's' : ''}).</p>}
      </section>
    </div>
  );
}
