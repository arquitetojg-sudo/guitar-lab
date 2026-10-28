import { DEFAULT_SETTINGS, SCHEMA_VERSION, type Backup, type Settings } from './types';

export class BackupError extends Error {}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const arr = (v: unknown, name: string): unknown[] => {
  if (v === undefined) return [];
  if (!Array.isArray(v)) throw new BackupError(`Campo "${name}" deveria ser uma lista.`);
  return v;
};
const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
const str = (v: unknown) => typeof v === 'string';

function check<T>(list: unknown[], name: string, ok: (x: Record<string, unknown>) => boolean): T[] {
  list.forEach((x, i) => {
    if (!isObj(x) || !ok(x)) throw new BackupError(`Item ${i + 1} de "${name}" está em formato inválido.`);
  });
  return list as T[];
}

function cleanSettings(v: unknown): Settings {
  if (!isObj(v)) return DEFAULT_SETTINGS;
  // Só aceita chaves conhecidas, com o mesmo tipo do padrão.
  const out: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const [k, def] of Object.entries(DEFAULT_SETTINGS)) {
    const val = v[k];
    if (val !== undefined && typeof val === typeof def && Array.isArray(val) === Array.isArray(def)) out[k] = val;
  }
  return out as unknown as Settings;
}

/** Valida e normaliza um backup JSON. Lança BackupError com mensagem clara. */
export function parseBackup(text: string): Backup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new BackupError('O arquivo não é um JSON válido.');
  }
  if (!isObj(raw) || raw.app !== 'guitar-lab') throw new BackupError('Este arquivo não é um backup do Guitar Lab.');
  if (!num(raw.schema) || (raw.schema as number) > SCHEMA_VERSION) {
    throw new BackupError('Backup criado por uma versão mais nova do app. Atualize o app antes de importar.');
  }
  return {
    app: 'guitar-lab',
    schema: SCHEMA_VERSION,
    exportedAt: str(raw.exportedAt) ? (raw.exportedAt as string) : new Date().toISOString(),
    settings: cleanSettings(raw.settings),
    lessonProgress: check(arr(raw.lessonProgress, 'lessonProgress'), 'lessonProgress', (x) => str(x.lessonId) && isObj(x.steps)),
    attempts: check(arr(raw.attempts, 'attempts'), 'attempts', (x) => num(x.ts) && str(x.topic) && typeof x.correct === 'boolean'),
    customCards: check(arr(raw.customCards, 'customCards'), 'customCards', (x) => str(x.id) && str(x.front) && str(x.back)),
    cardStates: check(arr(raw.cardStates, 'cardStates'), 'cardStates', (x) => str(x.cardId) && num(x.box) && num(x.due)),
    reviews: check(arr(raw.reviews, 'reviews'), 'reviews', (x) => str(x.cardId) && num(x.ts)),
    sessions: check(arr(raw.sessions, 'sessions'), 'sessions', (x) => str(x.id) && num(x.seconds) && x.seconds as number >= 0),
    activeSession: isObj(raw.activeSession) ? (raw.activeSession as unknown as Backup['activeSession']) : null,
    bpm: check(arr(raw.bpm, 'bpm'), 'bpm', (x) => num(x.bpm) && (x.bpm as number) > 0 && (x.bpm as number) < 400 && str(x.exerciseId)),
    goals: check(arr(raw.goals, 'goals'), 'goals', (x) => str(x.id) && str(x.text)),
    songs: check(arr(raw.songs, 'songs'), 'songs', (x) => str(x.id) && str(x.title)),
    lastRoute: str(raw.lastRoute) ? (raw.lastRoute as string) : '/',
  };
}

export function backupFileName(date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `guitar-lab-backup-${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}.json`;
}
