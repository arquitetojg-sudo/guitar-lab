import { openDB, type IDBPDatabase } from 'idb';

/**
 * Camada de persistência. Uma "store" por entidade.
 * Se o IndexedDB não estiver disponível (modo privado restrito, cota, erro),
 * cai para memória e avisa a interface — os dados não somem silenciosamente.
 */

export const DB_NAME = 'guitar-lab';
export const DB_VERSION = 1;

export const STORES = {
  kv: { keyPath: 'key' },
  lessonProgress: { keyPath: 'lessonId' },
  attempts: { keyPath: 'id', autoIncrement: true },
  customCards: { keyPath: 'id' },
  cardStates: { keyPath: 'cardId' },
  reviews: { keyPath: 'id', autoIncrement: true },
  sessions: { keyPath: 'id' },
  bpm: { keyPath: 'id', autoIncrement: true },
  goals: { keyPath: 'id' },
  songs: { keyPath: 'id' },
} as const;

export type StoreName = keyof typeof STORES;

export interface Persistence {
  kind: 'indexeddb' | 'memory';
  getAll<T>(store: StoreName): Promise<T[]>;
  put<T>(store: StoreName, value: T): Promise<IDBValidKey>;
  delete(store: StoreName, key: IDBValidKey): Promise<void>;
  clear(store: StoreName): Promise<void>;
  /** Substitui todo o conteúdo das stores numa única transação. */
  replaceAll(data: Partial<Record<StoreName, unknown[]>>): Promise<void>;
}

class IdbPersistence implements Persistence {
  kind = 'indexeddb' as const;
  constructor(private db: IDBPDatabase) {}
  getAll<T>(store: StoreName) {
    return this.db.getAll(store) as Promise<T[]>;
  }
  put<T>(store: StoreName, value: T) {
    return this.db.put(store, value);
  }
  delete(store: StoreName, key: IDBValidKey) {
    return this.db.delete(store, key);
  }
  clear(store: StoreName) {
    return this.db.clear(store);
  }
  async replaceAll(data: Partial<Record<StoreName, unknown[]>>) {
    const names = Object.keys(data) as StoreName[];
    const tx = this.db.transaction(names, 'readwrite');
    for (const name of names) {
      const st = tx.objectStore(name);
      await st.clear();
      for (const item of data[name] ?? []) await st.put(item);
    }
    await tx.done;
  }
}

/** Fallback em memória (também usado nos testes). */
export class MemoryPersistence implements Persistence {
  kind = 'memory' as const;
  private data = new Map<StoreName, Map<IDBValidKey, unknown>>();
  private seq = new Map<StoreName, number>();
  private map(store: StoreName) {
    if (!this.data.has(store)) this.data.set(store, new Map());
    return this.data.get(store)!;
  }
  async getAll<T>(store: StoreName) {
    return [...this.map(store).values()] as T[];
  }
  async put<T>(store: StoreName, value: T) {
    const def = STORES[store] as { keyPath: string; autoIncrement?: boolean };
    const v = value as Record<string, unknown>;
    let key = v[def.keyPath] as IDBValidKey | undefined;
    if (key === undefined && def.autoIncrement) {
      const next = (this.seq.get(store) ?? 0) + 1;
      this.seq.set(store, next);
      key = next;
      v[def.keyPath] = key;
    }
    if (key === undefined) throw new Error(`Chave ausente em ${store}`);
    this.map(store).set(key, structuredClone(value));
    return key;
  }
  async delete(store: StoreName, key: IDBValidKey) {
    this.map(store).delete(key);
  }
  async clear(store: StoreName) {
    this.map(store).clear();
  }
  async replaceAll(data: Partial<Record<StoreName, unknown[]>>) {
    for (const name of Object.keys(data) as StoreName[]) {
      await this.clear(name);
      for (const item of data[name] ?? []) await this.put(name, item);
    }
  }
}

export async function openPersistence(): Promise<{ db: Persistence; error?: string }> {
  try {
    if (typeof indexedDB === 'undefined') throw new Error('IndexedDB indisponível neste navegador.');
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        for (const [name, opts] of Object.entries(STORES)) {
          if (!database.objectStoreNames.contains(name)) database.createObjectStore(name, opts);
        }
      },
      blocked() {
        console.warn('Atualização do banco bloqueada por outra aba aberta.');
      },
    });
    // Pede armazenamento persistente (o navegador pode negar; não é obrigatório).
    try {
      await navigator.storage?.persist?.();
    } catch {
      /* opcional */
    }
    return { db: new IdbPersistence(db) };
  } catch (e) {
    return {
      db: new MemoryPersistence(),
      error: `Não foi possível abrir o armazenamento local (${(e as Error).message}). O progresso desta sessão não será salvo ao fechar o app. Exporte um backup antes de sair.`,
    };
  }
}
