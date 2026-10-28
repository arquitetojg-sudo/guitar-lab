import { useEffect, useRef, useState } from 'react';
import { Metronome, audioSupported } from './audio';

export function MetronomePanel({ bpm, onBpm }: { bpm: number; onBpm: (b: number) => void }) {
  const metro = useRef<Metronome | null>(null);
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(-1);

  useEffect(() => () => metro.current?.stop(), []);
  useEffect(() => {
    if (metro.current) metro.current.bpm = bpm;
  }, [bpm]);

  if (!audioSupported()) return <p className="notice">Este navegador não oferece áudio (Web Audio API). Use um metrônomo externo.</p>;

  const toggle = () => {
    if (!metro.current) {
      metro.current = new Metronome();
      metro.current.onBeat = setBeat;
    }
    metro.current.bpm = bpm;
    if (metro.current.running) {
      metro.current.stop();
      setRunning(false);
      setBeat(-1);
    } else {
      metro.current.start();
      setRunning(true);
    }
  };

  const set = (v: number) => onBpm(Math.max(30, Math.min(260, Math.round(v))));

  return (
    <div className="stack">
      <div className="row between">
        <div className="clock num" aria-live="polite">{bpm} <span className="small muted" style={{ fontSize: '1rem' }}>BPM</span></div>
        <div className="beats" aria-hidden="true">
          {[0, 1, 2, 3].map((b) => <i key={b} className={`${beat === b ? 'on' : ''} ${b > 0 ? 'weak' : ''}`} />)}
        </div>
      </div>
      <input type="range" min={30} max={260} value={bpm} onChange={(e) => set(Number(e.target.value))} aria-label="Andamento em BPM" style={{ width: '100%' }} />
      <div className="row">
        <button className="btn small" onClick={() => set(bpm - 5)}>−5</button>
        <button className="btn small" onClick={() => set(bpm - 1)}>−1</button>
        <button className="btn small" onClick={() => set(bpm + 1)}>+1</button>
        <button className="btn small" onClick={() => set(bpm + 5)}>+5</button>
        <button className={`btn ${running ? '' : 'primary'}`} onClick={toggle}>{running ? 'Parar metrônomo' : 'Iniciar metrônomo'}</button>
      </div>
    </div>
  );
}
