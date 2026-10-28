import { useEffect, useState } from 'react';
import { useStore, uid } from './store';
import type { ActiveSession, SessionBlock } from '../storage/types';

/** Segundos decorridos no bloco atual, incluindo o trecho em andamento. */
export function liveElapsed(s: ActiveSession, now = Date.now()): number[] {
  const out = [...s.elapsed];
  if (s.runningSince !== undefined) out[s.index] += Math.max(0, (now - s.runningSince) / 1000);
  return out;
}

export function formatClock(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export function useSessionClock() {
  const { data } = useStore();
  const s = data.activeSession;
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!s?.runningSince) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [s?.runningSince]);
  if (!s) return null;
  const el = liveElapsed(s, now);
  const block = s.blocks[s.index];
  return {
    session: s,
    block,
    index: s.index,
    elapsed: el,
    blockRemaining: block.minutes * 60 - el[s.index],
    total: el.reduce((a, b) => a + b, 0),
    planned: s.blocks.reduce((a, b) => a + b.minutes * 60, 0),
    running: s.runningSince !== undefined,
  };
}

export function useSessionControls() {
  const { data, actions } = useStore();
  const s = data.activeSession;
  const freeze = (x: ActiveSession): ActiveSession => ({ ...x, elapsed: liveElapsed(x), runningSince: undefined });
  return {
    start(blocks: SessionBlock[]) {
      actions.setActiveSession({ id: uid(), startedAt: Date.now(), blocks, index: 0, elapsed: blocks.map(() => 0), runningSince: Date.now() });
    },
    pause() {
      if (s) actions.setActiveSession(freeze(s));
    },
    resume() {
      if (s && s.runningSince === undefined) actions.setActiveSession({ ...s, runningSince: Date.now() });
    },
    goTo(index: number) {
      if (!s) return;
      const f = freeze(s);
      actions.setActiveSession({ ...f, index: Math.max(0, Math.min(s.blocks.length - 1, index)), runningSince: s.runningSince !== undefined ? Date.now() : undefined });
    },
    finish(note?: string) {
      if (!s) return;
      const el = liveElapsed(s);
      const seconds = Math.round(el.reduce((a, b) => a + b, 0));
      if (seconds >= 10) {
        actions.savePracticeSession({
          id: s.id, startedAt: s.startedAt, endedAt: Date.now(), seconds,
          blocks: s.blocks.map((b, i) => ({ label: b.label, seconds: Math.round(el[i]) })), note,
        });
      }
      actions.setActiveSession(null);
      return seconds;
    },
    discard() {
      actions.setActiveSession(null);
    },
  };
}
