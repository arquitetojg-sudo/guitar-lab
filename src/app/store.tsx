import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { openPersistence, type Persistence } from '../storage/db';
import {
  DEFAULT_SETTINGS, SCHEMA_VERSION, type ActiveSession, type Attempt, type Backup, type BpmEntry, type CardState,
  type CustomCard, type Goal, type LessonProgress, type PracticeSession, type ReviewLog, type Settings, type Song, type StepId,
} from '../storage/types';
import { newCardState, review } from '../learning/srs';

export interface Data {
  settings: Settings;
  lessonProgress: Record<string, LessonProgress>;
  attempts: Attempt[];
  customCards: CustomCard[];
  cardStates: Record<string, CardState>;
  reviews: ReviewLog[];
  sessions: PracticeSession[];
  activeSession: ActiveSession | null;
  bpm: BpmEntry[];
  goals: Goal[];
  songs: Song[];
  lastRoute: string;
}

const EMPTY: Data = {
  settings: DEFAULT_SETTINGS, lessonProgress: {}, attempts: [], customCards: [], cardStates: {}, reviews: [],
  sessions: [], activeSession: null, bpm: [], goals: [], songs: [], lastRoute: '/',
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function useStoreImpl() {
  const [data, setData] = useState<Data>(EMPTY);
  const [ready, setReady] = useState(false);
  const [storageKind, setStorageKind] = useState<'indexeddb' | 'memory'>('indexeddb');
  const [storageError, setStorageError] = useState<string | undefined>();
  const dbRef = useRef<Persistence | null>(null);
  const dataRef = useRef<Data>(EMPTY);

  useEffect(() => {
    (async () => {
      const { db, error } = await openPersistence();
      dbRef.current = db;
      setStorageKind(db.kind);
      setStorageError(error);
      try {
        const [kv, lp, attempts, customCards, cardStates, reviews, sessions, bpm, goals, songs] = await Promise.all([
          db.getAll<{ key: string; value: unknown }>('kv'),
          db.getAll<LessonProgress>('lessonProgress'),
          db.getAll<Attempt>('attempts'),
          db.getAll<CustomCard>('customCards'),
          db.getAll<CardState>('cardStates'),
          db.getAll<ReviewLog>('reviews'),
          db.getAll<PracticeSession>('sessions'),
          db.getAll<BpmEntry>('bpm'),
          db.getAll<Goal>('goals'),
          db.getAll<Song>('songs'),
        ]);
        const kvMap = Object.fromEntries(kv.map((k) => [k.key, k.value]));
        const loaded: Data = ({
          settings: { ...DEFAULT_SETTINGS, ...((kvMap.settings as Partial<Settings>) ?? {}) },
          lessonProgress: Object.fromEntries(lp.map((p) => [p.lessonId, p])),
          attempts: attempts.sort((a, b) => a.ts - b.ts),
          customCards,
          cardStates: Object.fromEntries(cardStates.map((c) => [c.cardId, c])),
          reviews,
          sessions: sessions.sort((a, b) => a.startedAt - b.startedAt),
          activeSession: (kvMap.activeSession as ActiveSession | null) ?? null,
          bpm: bpm.sort((a, b) => a.ts - b.ts),
          goals,
          songs,
          lastRoute: (kvMap.lastRoute as string) ?? '/',
        });
        dataRef.current = loaded;
        setData(loaded);
      } catch (e) {
        setStorageError(`Falha ao ler os dados salvos: ${(e as Error).message}`);
      }
      setReady(true);
    })();
  }, []);

  /** Executa a gravação e mostra o erro na interface se falhar. */
  const persist = useCallback((fn: (db: Persistence) => Promise<unknown>) => {
    const db = dbRef.current;
    if (!db) return Promise.resolve();
    return fn(db).catch((e: Error) => {
      setStorageError(`Não foi possível salvar: ${e.message}. Verifique o espaço disponível e exporte um backup.`);
    });
  }, []);

  const setKv = useCallback((key: string, value: unknown) => persist((db) => db.put('kv', { key, value })), [persist]);

  // Estado atual sempre acessível sem efeitos colaterais dentro de setState.
  const commit = useCallback((next: Data) => {
    dataRef.current = next;
    setData(next);
  }, []);
  const blankProgress = (lessonId: string): LessonProgress => ({ lessonId, steps: {}, bestQuizScore: 0, quizRuns: 0, lastVisitedAt: Date.now() });

  const actions = useMemo(() => {
    const cur = () => dataRef.current;
    const saveProgress = (next: LessonProgress) => {
      persist((db) => db.put('lessonProgress', next));
      commit({ ...cur(), lessonProgress: { ...cur().lessonProgress, [next.lessonId]: next } });
    };
    return {
      updateSettings(patch: Partial<Settings>) {
        const settings = { ...cur().settings, ...patch };
        setKv('settings', settings);
        commit({ ...cur(), settings });
      },
      setLastRoute(route: string) {
        if (cur().lastRoute === route) return;
        setKv('lastRoute', route);
        commit({ ...cur(), lastRoute: route });
      },
      async recordAttempt(a: Attempt) {
        const copy = { ...a };
        await persist(async (db) => {
          copy.id = (await db.put('attempts', copy)) as number;
        });
        commit({ ...cur(), attempts: [...cur().attempts, copy] });
      },
      deleteAttemptsForTopic(topic: string) {
        const remove = cur().attempts.filter((a) => a.topic === topic);
        persist(async (db) => {
          for (const a of remove) if (a.id !== undefined) await db.delete('attempts', a.id);
        });
        commit({ ...cur(), attempts: cur().attempts.filter((a) => a.topic !== topic) });
      },
      touchLesson(lessonId: string) {
        const lp = cur().lessonProgress[lessonId] ?? blankProgress(lessonId);
        saveProgress({ ...lp, lastVisitedAt: Date.now() });
      },
      completeStep(lessonId: string, step: StepId) {
        const lp = cur().lessonProgress[lessonId] ?? blankProgress(lessonId);
        const next: LessonProgress = { ...lp, steps: { ...lp.steps, [step]: lp.steps[step] ?? Date.now() }, lastVisitedAt: Date.now() };
        const all: StepId[] = ['entender', 'executar', 'memorizar', 'aplicar'];
        if (!next.completedAt && all.every((x) => next.steps[x])) next.completedAt = Date.now();
        saveProgress(next);
      },
      recordQuizRun(lessonId: string, score: number) {
        const lp = cur().lessonProgress[lessonId] ?? blankProgress(lessonId);
        saveProgress({ ...lp, quizRuns: lp.quizRuns + 1, bestQuizScore: Math.max(lp.bestQuizScore, score) });
      },
      /** Conclui aulas pelo teste direto ("Já sei isso" ou prova da fase). */
      testOut(lessonIds: string[], score: number) {
        const now = Date.now();
        for (const id of lessonIds) {
          const lp = cur().lessonProgress[id] ?? blankProgress(id);
          if (lp.completedAt) continue;
          saveProgress({
            ...lp,
            steps: { ...lp.steps, memorizar: lp.steps.memorizar ?? now },
            bestQuizScore: Math.max(lp.bestQuizScore, score),
            quizRuns: lp.quizRuns + 1,
            completedAt: now,
            testedOutAt: now,
            lastVisitedAt: now,
          });
        }
      },
      resetLesson(lessonId: string) {
        const lp = cur().lessonProgress[lessonId];
        // mantém completedAt: rever uma aula não bloqueia as seguintes
        if (lp) saveProgress({ ...lp, steps: {} });
      },
      reviewCard(cardId: string, correct: boolean) {
        const now = Date.now();
        const st = review(cur().cardStates[cardId] ?? newCardState(cardId, now), correct, now);
        const log: ReviewLog = { cardId, ts: now, correct };
        persist(async (db) => {
          await db.put('cardStates', st);
          log.id = (await db.put('reviews', { ...log })) as number;
        });
        commit({ ...cur(), cardStates: { ...cur().cardStates, [cardId]: st }, reviews: [...cur().reviews, log] });
      },
      saveCustomCard(card: CustomCard) {
        persist((db) => db.put('customCards', card));
        commit({ ...cur(), customCards: [...cur().customCards.filter((c) => c.id !== card.id), card] });
      },
      deleteCustomCard(id: string) {
        persist(async (db) => {
          await db.delete('customCards', id);
          await db.delete('cardStates', id);
        });
        const cs = { ...cur().cardStates };
        delete cs[id];
        commit({ ...cur(), customCards: cur().customCards.filter((c) => c.id !== id), cardStates: cs });
      },
      setActiveSession(s: ActiveSession | null) {
        setKv('activeSession', s);
        commit({ ...cur(), activeSession: s });
      },
      savePracticeSession(s: PracticeSession) {
        persist((db) => db.put('sessions', s));
        commit({ ...cur(), sessions: [...cur().sessions.filter((x) => x.id !== s.id), s].sort((a, b) => a.startedAt - b.startedAt) });
      },
      deletePracticeSession(id: string) {
        persist((db) => db.delete('sessions', id));
        commit({ ...cur(), sessions: cur().sessions.filter((x) => x.id !== id) });
      },
      async addBpm(e: BpmEntry) {
        const copy = { ...e };
        await persist(async (db) => {
          copy.id = (await db.put('bpm', copy)) as number;
        });
        commit({ ...cur(), bpm: [...cur().bpm, copy] });
      },
      deleteBpm(id: number) {
        persist((db) => db.delete('bpm', id));
        commit({ ...cur(), bpm: cur().bpm.filter((x) => x.id !== id) });
      },
      saveGoal(g: Goal) {
        persist((db) => db.put('goals', g));
        commit({ ...cur(), goals: [...cur().goals.filter((x) => x.id !== g.id), g] });
      },
      deleteGoal(id: string) {
        persist((db) => db.delete('goals', id));
        commit({ ...cur(), goals: cur().goals.filter((x) => x.id !== id) });
      },
      saveSong(song: Song) {
        persist((db) => db.put('songs', song));
        commit({ ...cur(), songs: [...cur().songs.filter((x) => x.id !== song.id), song] });
      },
      deleteSong(id: string) {
        persist((db) => db.delete('songs', id));
        commit({ ...cur(), songs: cur().songs.filter((x) => x.id !== id) });
      },
      dismissStorageError() {
        setStorageError(undefined);
      },
    };
  }, [persist, setKv, commit]);

  const exportBackup = useCallback((): Backup => ({
    app: 'guitar-lab',
    schema: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    settings: data.settings,
    lessonProgress: Object.values(data.lessonProgress),
    attempts: data.attempts,
    customCards: data.customCards,
    cardStates: Object.values(data.cardStates),
    reviews: data.reviews,
    sessions: data.sessions,
    activeSession: data.activeSession,
    bpm: data.bpm,
    goals: data.goals,
    songs: data.songs,
    lastRoute: data.lastRoute,
  }), [data]);

  const importBackup = useCallback(async (b: Backup) => {
    const db = dbRef.current;
    if (!db) throw new Error('Armazenamento indisponível.');
    await db.replaceAll({
      kv: [{ key: 'settings', value: b.settings }, { key: 'activeSession', value: b.activeSession }, { key: 'lastRoute', value: b.lastRoute }],
      lessonProgress: b.lessonProgress, attempts: b.attempts, customCards: b.customCards, cardStates: b.cardStates,
      reviews: b.reviews, sessions: b.sessions, bpm: b.bpm, goals: b.goals, songs: b.songs,
    });
    // relê do banco para obter as chaves geradas
    const [attempts, bpm, reviews] = await Promise.all([db.getAll<Attempt>('attempts'), db.getAll<BpmEntry>('bpm'), db.getAll<ReviewLog>('reviews')]);
    commit({
      settings: { ...DEFAULT_SETTINGS, ...b.settings },
      lessonProgress: Object.fromEntries(b.lessonProgress.map((p) => [p.lessonId, p])),
      attempts: attempts.sort((x, y) => x.ts - y.ts),
      customCards: b.customCards,
      cardStates: Object.fromEntries(b.cardStates.map((c) => [c.cardId, c])),
      reviews,
      sessions: b.sessions,
      activeSession: b.activeSession,
      bpm: bpm.sort((x, y) => x.ts - y.ts),
      goals: b.goals,
      songs: b.songs,
      lastRoute: b.lastRoute,
    });
  }, [commit]);

  const resetAll = useCallback(async () => {
    const db = dbRef.current;
    if (!db) return;
    await db.replaceAll({ kv: [], lessonProgress: [], attempts: [], customCards: [], cardStates: [], reviews: [], sessions: [], bpm: [], goals: [], songs: [] });
    commit(EMPTY);
  }, [commit]);

  return { data, ready, storageKind, storageError, actions, exportBackup, importBackup, resetAll };
}

type Store = ReturnType<typeof useStoreImpl>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useStoreImpl();
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore fora do StoreProvider');
  return s;
}
