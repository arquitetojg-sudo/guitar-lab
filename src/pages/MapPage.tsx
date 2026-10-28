import { useMemo, useState } from 'react';
import { useStore } from '../app/store';
import { Fretboard, type Mark } from '../ui/Fretboard';
import { openStringLabels, shortName, spelledShort } from '../ui/marks';
import { playNote, playSequence, audioSupported } from '../ui/audio';
import {
  INSTRUMENTS, allPositions, conventionalRoot, describeMidiInterval, formatNote, harmonicField, intervalBetweenPcs,
  isNaturalPc, midiOctave, mod12, octavePositions, pcOf, pentatonicBox, positionAt, scaleNotes, SCALES, spellPc,
  INTERVALS, chordSymbol, type FretPosition,
} from '../music';
import type { Instrument } from '../music/fretboard';

type View = 'notas' | 'nota' | 'oitavas' | 'intervalos' | 'escala';
type LabelMode = 'nome' | 'grau' | 'dedo' | 'oculto';

const VIEWS: { id: View; label: string }[] = [
  { id: 'notas', label: 'Notas' },
  { id: 'nota', label: 'Uma nota' },
  { id: 'oitavas', label: 'Oitavas' },
  { id: 'intervalos', label: 'Intervalos' },
  { id: 'escala', label: 'Escalas e acordes' },
];

const SCALE_OPTIONS = [
  { id: 'minorPentatonic', label: 'Pentatônica menor' },
  { id: 'majorPentatonic', label: 'Pentatônica maior' },
  { id: 'blues', label: 'Blues' },
  { id: 'naturalMinor', label: 'Menor natural' },
  { id: 'major', label: 'Maior' },
] as const;
type ScaleId = (typeof SCALE_OPTIONS)[number]['id'];

export function MapPage() {
  const { data, actions } = useStore();
  const st = data.settings;
  const prefs = { naming: st.naming, accidentals: st.accidentals };
  const instFrets = INSTRUMENTS[st.instrument].frets;

  const [view, setView] = useState<View>('notas');
  const [naturalsOnly, setNaturalsOnly] = useState(true);
  const [range, setRange] = useState<'12' | '15' | 'all'>(st.showFretsUpTo === 'all' ? 'all' : String(st.showFretsUpTo) as '12' | '15');
  const [rootPc, setRootPc] = useState(9);
  const [selected, setSelected] = useState<FretPosition | null>(null);
  const [labelMode, setLabelMode] = useState<LabelMode>('nome');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [intervalFilter, setIntervalFilter] = useState<Set<number>>(new Set([0, 3, 4, 7, 10]));
  const [scaleId, setScaleId] = useState<ScaleId>('minorPentatonic');
  const [box, setBox] = useState<number>(0); // 0 = braço todo
  const [chordDeg, setChordDeg] = useState<number>(0); // 0 = nenhum

  const maxFret = range === 'all' ? instFrets : Number(range);
  const testMode = labelMode === 'oculto';

  // Tonalidade com grafia correta (Lá menor → Dó, não Si♯)
  const scaleQuality = scaleId === 'major' || scaleId === 'majorPentatonic' ? 'major' : 'minor';
  const keyRoot = conventionalRoot(rootPc, scaleQuality);
  const scaleList = useMemo(() => scaleNotes(keyRoot, SCALES[scaleId]), [keyRoot.letter, keyRoot.acc, scaleId]);
  const field = useMemo(() => harmonicField(keyRoot, scaleQuality === 'major' ? 'major' : 'naturalMinor'), [keyRoot.letter, keyRoot.acc, scaleQuality]);
  const chord = chordDeg ? field[chordDeg - 1] : undefined;

  const nameForPc = (pc: number) => {
    // dentro de uma escala, usa a grafia da escala
    if (view === 'escala') {
      const sn = scaleList.find((n) => n.pc === pc) ?? chord?.notes.find((n) => n.pc === pc);
      if (sn) return spelledShort(sn.note, prefs);
    }
    return shortName(pc, prefs);
  };

  const marks: Mark[] = useMemo(() => {
    const positions = allPositions(maxFret);
    const lab = (p: FretPosition, grau?: string, dedo?: number) => {
      if (labelMode === 'oculto') return revealed.has(`${p.string}:${p.fret}`) ? nameForPc(p.pc) : undefined;
      if (labelMode === 'grau' && grau) return grau;
      if (labelMode === 'dedo' && dedo) return String(dedo);
      return nameForPc(p.pc);
    };
    switch (view) {
      case 'notas':
        return positions
          .filter((p) => !naturalsOnly || isNaturalPc(p.pc))
          .map((p) => ({ string: p.string, fret: p.fret, role: isNaturalPc(p.pc) ? 'scale' : 'focus', label: lab(p) }));
      case 'nota':
        return positions.filter((p) => p.pc === rootPc).map((p) => ({ string: p.string, fret: p.fret, role: 'root', label: lab(p) }));
      case 'oitavas': {
        const src = selected ?? positionAt(6, 5);
        const octs = octavePositions(src, maxFret);
        const unis = positions.filter((p) => p.midi === src.midi && p.string !== src.string);
        return [
          ...unis.map((p): Mark => ({ string: p.string, fret: p.fret, role: 'target', label: lab(p, '=') })),
          ...octs.map((p): Mark => ({ string: p.string, fret: p.fret, role: 'octave', label: lab(p, `${p.midi > src.midi ? '+' : '−'}${Math.abs(p.midi - src.midi) / 12}`) })),
          { string: src.string, fret: src.fret, role: 'root', label: lab(src, '1') },
        ];
      }
      case 'intervalos':
        return positions
          .filter((p) => intervalFilter.has(mod12(p.pc - rootPc)))
          .map((p) => {
            const iv = INTERVALS[mod12(p.pc - rootPc)];
            const showGrau = labelMode !== 'nome' && labelMode !== 'oculto';
            return { string: p.string, fret: p.fret, role: iv.semitones === 0 ? 'root' : 'scale', label: showGrau ? iv.short : lab(p, iv.short) };
          });
      case 'escala': {
        const pcs = new Map(scaleList.map((n) => [n.pc, n.label]));
        const chordPcs = new Map((chord?.notes ?? []).map((n) => [n.pc, n.label]));
        let src: { string: number; fret: number; pc: number; midi: number }[];
        let minBoxFret = 0;
        if (box && (scaleId === 'minorPentatonic' || scaleId === 'majorPentatonic')) {
          src = pentatonicBox(rootPc, scaleId, box);
          minBoxFret = Math.min(...src.map((n) => n.fret));
        } else {
          src = positions.filter((p) => pcs.has(p.pc) || chordPcs.has(p.pc));
        }
        return src
          .filter((p) => p.fret <= Math.max(maxFret, box ? 24 : 0))
          .map((p) => {
            const inScale = pcs.has(p.pc);
            const inChord = chordPcs.has(p.pc);
            const role: Mark['role'] = p.pc === rootPc && !chord ? 'root'
              : chord ? (inChord ? (inScale ? 'target' : 'chord') : 'muted')
              : 'scale';
            const grau = chord && inChord ? chordPcs.get(p.pc) : pcs.get(p.pc);
            const dedo = box ? Math.min(4, p.fret - minBoxFret + 1) || 1 : undefined;
            const pos = p as FretPosition;
            return { string: p.string, fret: p.fret, role: role === 'muted' && labelMode !== 'oculto' ? 'muted' : role, label: role === 'muted' ? undefined : lab(pos, grau, dedo) };
          });
      }
    }
  }, [view, naturalsOnly, maxFret, rootPc, selected, labelMode, revealed, intervalFilter, scaleId, box, chord, scaleList, prefs.naming, prefs.accidentals]);

  const effectiveMax = view === 'escala' && box ? Math.max(maxFret, ...marks.map((m) => m.fret)) : maxFret;

  const onTap = (pos: { string: number; fret: number }) => {
    const p = positionAt(pos.string, pos.fret);
    setSelected(p);
    if (testMode) {
      const k = `${p.string}:${p.fret}`;
      setRevealed((r) => {
        const n = new Set(r);
        if (n.has(k)) n.delete(k);
        else n.add(k);
        return n;
      });
    }
    if (st.sound) playNote(p.midi, st.instrument);
  };

  const sel = selected;
  const selNote = sel ? spellPc(sel.pc, st.accidentals === 'flat' ? 'flat' : 'sharp') : null;
  const altNote = sel && !isNaturalPc(sel.pc) ? spellPc(sel.pc, st.accidentals === 'flat' ? 'sharp' : 'flat') : null;

  const hasRoot = view !== 'notas' && view !== 'oitavas';
  const isPent = scaleId === 'minorPentatonic' || scaleId === 'majorPentatonic';

  const legend: { cls: string; label: string }[] =
    view === 'escala'
      ? chord
        ? [{ cls: 'role-target', label: 'Nota-alvo (do acorde e da escala)' }, { cls: 'role-chord', label: 'Nota do acorde fora da escala' }, { cls: 'role-muted', label: 'Demais notas da escala' }]
        : [{ cls: 'role-root', label: 'Tônica' }, { cls: 'role-scale', label: 'Notas da escala' }]
      : view === 'oitavas'
        ? [{ cls: 'role-root', label: 'Nota escolhida' }, { cls: 'role-octave', label: 'Oitavas' }, { cls: 'role-target', label: 'Mesma altura (uníssono)' }]
        : view === 'notas'
          ? [{ cls: 'role-scale', label: 'Naturais' }, { cls: 'role-focus', label: 'Sustenidos / bemóis' }]
          : [{ cls: 'role-root', label: 'Fundamental' }, { cls: 'role-scale', label: 'Outras notas' }];

  return (
    <div className="stack-l">
      <div>
        <h1>Mapa do braço</h1>
        <p className="muted">Toque numa casa para ver e ouvir a nota. Todas as posições são calculadas a partir da afinação padrão.</p>
      </div>

      <div className="stack">
        <div className="seg" role="group" aria-label="Visualização">
          {VIEWS.map((v) => (
            <button key={v.id} aria-pressed={view === v.id} onClick={() => { setView(v.id); setRevealed(new Set()); }}>{v.label}</button>
          ))}
        </div>

        <div className="row">
          {view === 'notas' && (
            <div className="seg" role="group" aria-label="Quais notas">
              <button aria-pressed={naturalsOnly} onClick={() => setNaturalsOnly(true)}>Só naturais</button>
              <button aria-pressed={!naturalsOnly} onClick={() => setNaturalsOnly(false)}>Cromáticas</button>
            </div>
          )}
          {hasRoot && (
            <label className="field" style={{ width: 'auto' }}>
              <span>{view === 'escala' ? 'Tonalidade' : view === 'nota' ? 'Nota' : 'Fundamental'}</span>
              <select value={rootPc} onChange={(e) => { setRootPc(Number(e.target.value)); setChordDeg(0); }}>
                {Array.from({ length: 12 }, (_, pc) => (
                  <option key={pc} value={pc}>{view === 'escala' ? spelledShort(conventionalRoot(pc, scaleQuality), prefs) : shortName(pc, { ...prefs, accidentals: 'both' })}</option>
                ))}
              </select>
            </label>
          )}
          {view === 'escala' && (
            <>
              <label className="field" style={{ width: 'auto' }}>
                <span>Escala</span>
                <select value={scaleId} onChange={(e) => { setScaleId(e.target.value as ScaleId); setBox(0); setChordDeg(0); }}>
                  {SCALE_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </label>
              {isPent && (
                <label className="field" style={{ width: 'auto' }}>
                  <span>Desenho</span>
                  <select value={box} onChange={(e) => setBox(Number(e.target.value))}>
                    <option value={0}>Braço todo</option>
                    {[1, 2, 3, 4, 5].map((b) => <option key={b} value={b}>Box {b}</option>)}
                  </select>
                </label>
              )}
              <label className="field" style={{ width: 'auto' }}>
                <span>Sobrepor acorde</span>
                <select value={chordDeg} onChange={(e) => setChordDeg(Number(e.target.value))}>
                  <option value={0}>Nenhum</option>
                  {field.map((c) => <option key={c.degree} value={c.degree}>{c.roman} — {chordSymbol(c.root, c.quality)}</option>)}
                </select>
              </label>
            </>
          )}
        </div>

        {view === 'intervalos' && (
          <div className="row" role="group" aria-label="Intervalos exibidos">
            {INTERVALS.map((iv) => (
              <button
                key={iv.semitones}
                className="chip"
                aria-pressed={intervalFilter.has(iv.semitones)}
                title={iv.name}
                onClick={() => setIntervalFilter((f) => {
                  const n = new Set(f);
                  if (n.has(iv.semitones)) n.delete(iv.semitones);
                  else n.add(iv.semitones);
                  n.add(0);
                  return n;
                })}
              >{iv.short}</button>
            ))}
          </div>
        )}

        <div className="row">
          <div className="seg" role="group" aria-label="Rótulos">
            <button aria-pressed={labelMode === 'nome'} onClick={() => setLabelMode('nome')}>Nomes</button>
            {(view === 'intervalos' || view === 'escala' || view === 'oitavas') && (
              <button aria-pressed={labelMode === 'grau'} onClick={() => setLabelMode('grau')}>{view === 'oitavas' ? 'Oitava' : 'Graus'}</button>
            )}
            {view === 'escala' && box > 0 && <button aria-pressed={labelMode === 'dedo'} onClick={() => setLabelMode('dedo')}>Dedos</button>}
            <button aria-pressed={testMode} onClick={() => { setLabelMode('oculto'); setRevealed(new Set()); }}>Modo teste</button>
          </div>
          <div className="seg" role="group" aria-label="Extensão do braço">
            <button aria-pressed={range === '12'} onClick={() => setRange('12')}>0–12</button>
            <button aria-pressed={range === '15'} onClick={() => setRange('15')}>0–15</button>
            <button aria-pressed={range === 'all'} onClick={() => setRange('all')}>0–{instFrets}</button>
          </div>
          <div className="seg" role="group" aria-label="Instrumento">
            {(Object.keys(INSTRUMENTS) as Instrument[]).map((k) => (
              <button key={k} aria-pressed={st.instrument === k} onClick={() => actions.updateSettings({ instrument: k })}>{k === 'guitarra' ? 'Guitarra' : 'Violão'}</button>
            ))}
          </div>
        </div>
      </div>

      {testMode && <p className="notice small">Modo teste: os nomes ficam ocultos. Diga a nota em voz alta e toque na bolinha para conferir.</p>}
      {view === 'oitavas' && !selected && <p className="small muted">Toque em qualquer casa para ver as oitavas daquela nota.</p>}

      <div className="panel" style={{ padding: 8 }}>
        <Fretboard
          maxFret={effectiveMax}
          marks={marks}
          stringLabels={openStringLabels(prefs)}
          onTap={onTap}
          leftHanded={st.leftHanded}
          title="Braço do instrumento"
          describeCell={(s, f) => `${s}ª corda, casa ${f}`}
        />
        <div className="legend" style={{ padding: '8px 8px 4px' }}>
          {legend.map((l) => (
            <span key={l.label}><i className={l.cls} style={{ background: `var(--${l.cls === 'role-root' ? 'c-root' : l.cls === 'role-octave' ? 'c-octave' : l.cls === 'role-chord' ? 'c-chord' : l.cls === 'role-focus' ? 'c-focus' : l.cls === 'role-muted' ? 'inlay' : 'c-scale'})`, borderColor: l.cls === 'role-target' ? 'var(--c-target)' : undefined, borderWidth: l.cls === 'role-target' ? 3 : 1 }} />{l.label}</span>
          ))}
        </div>
      </div>

      <div className="grid2">
        <div className="panel" aria-live="polite">
          <h2>Posição selecionada</h2>
          {sel && selNote ? (
            <>
              <p style={{ fontSize: '1.4rem', fontWeight: 750, marginBottom: 4 }}>
                {formatNote(selNote, 'both')}{altNote ? ` = ${formatNote(altNote, 'both')}` : ''}
              </p>
              <p className="muted small">
                {sel.string}ª corda, casa {sel.fret} · oitava científica {selNote.letter}{selNote.acc === 1 ? '♯' : selNote.acc === -1 ? '♭' : ''}{midiOctave(sel.midi)}
              </p>
              {hasRoot && (
                <p className="small">Em relação a {nameForPc(rootPc)}: <strong>{intervalBetweenPcs(rootPc, sel.pc).name}</strong> ({intervalBetweenPcs(rootPc, sel.pc).short})</p>
              )}
              {view === 'oitavas' && (
                <p className="small">{octavePositions(sel, maxFret).length} oitava(s) visível(is) nesta extensão. Ex.: {(() => {
                  const o = octavePositions(sel, maxFret)[0];
                  return o ? `${o.string}ª corda, casa ${o.fret} (${describeMidiInterval(Math.min(o.midi, sel.midi), Math.max(o.midi, sel.midi)).toLowerCase()})` : '—';
                })()}</p>
              )}
              {audioSupported() && (
                <button className="btn small" onClick={() => playNote(sel.midi, st.instrument)}>Ouvir nota</button>
              )}
            </>
          ) : (
            <p className="muted">Nenhuma casa selecionada.</p>
          )}
        </div>

        {view === 'escala' && (
          <div className="panel">
            <h2>{spelledShort(keyRoot, prefs)} — {SCALE_OPTIONS.find((s) => s.id === scaleId)?.label}</h2>
            <p>
              {scaleList.map((n) => (
                <span key={n.degree + n.label} style={{ marginRight: 10, whiteSpace: 'nowrap' }}>
                  <strong>{spelledShort(n.note, prefs)}</strong> <span className="muted small">{n.label}</span>
                </span>
              ))}
            </p>
            {chord && (
              <p className="small">
                Acorde {chord.roman} ({chordSymbol(chord.root, chord.quality)}): {chord.notes.map((n) => `${spelledShort(n.note, prefs)} (${n.label})`).join(', ')}.{' '}
                {chord.notes.every((n) => scaleList.some((s) => s.pc === n.pc))
                  ? 'Todas as notas do acorde estão na escala — são boas notas de repouso sobre ele.'
                  : 'Atenção: há nota do acorde fora da escala (em azul). Sobre esse acorde, a escala escolhida pode soar em conflito; prefira as notas do acorde.'}
              </p>
            )}
            {audioSupported() && (
              <button
                className="btn small"
                onClick={() => {
                  const base = 40 + mod12(pcOf(keyRoot) - 4) + 12;
                  playSequence([...scaleList.map((n) => base + n.semitones), base + 12], st.instrument, 0.3);
                }}
              >Ouvir escala</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
