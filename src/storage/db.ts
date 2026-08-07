/**
 * IndexedDB access with versioned migrations.
 *
 * Stories, prompt history, and custom tags live here. The migration ladder in
 * `upgrade` only ever *adds* stores or back-fills fields — it must never drop a
 * user's saved stories. Each version step is idempotent and forward-only.
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Prompt, Story } from '../types';

export const DB_NAME = 'photocue';
export const DB_VERSION = 2;

interface PhotoCueDB extends DBSchema {
  stories: { key: string; value: Story; indexes: { updatedAt: string } };
  history: { key: string; value: Prompt; indexes: { createdAt: string } };
  meta: { key: string; value: unknown };
}

let dbPromise: Promise<IDBPDatabase<PhotoCueDB>> | undefined;

export function getDB(): Promise<IDBPDatabase<PhotoCueDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PhotoCueDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, tx) {
        // v1 → base stores.
        if (oldVersion < 1) {
          const stories = db.createObjectStore('stories', { keyPath: 'id' });
          stories.createIndex('updatedAt', 'updatedAt');
          const history = db.createObjectStore('history', { keyPath: 'id' });
          history.createIndex('createdAt', 'createdAt');
        }
        // v2 → meta store, plus back-fill missing fields on existing stories.
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('meta')) {
            db.createObjectStore('meta');
          }
          // Ensure the stories index exists for pre-index installs.
          const storeNames = db.objectStoreNames;
          if (storeNames.contains('stories')) {
            const store = tx.objectStore('stories');
            store.getAll().then((all) => {
              for (const s of all as Story[]) {
                let changed = false;
                if (!Array.isArray(s.stages)) {
                  // Older stories had a stage count only; nothing to lose.
                  changed = true;
                }
                if (!s.createdAt) {
                  s.createdAt = new Date().toISOString();
                  changed = true;
                }
                if (!s.updatedAt) {
                  s.updatedAt = s.createdAt;
                  changed = true;
                }
                if (!Array.isArray(s.contextTags)) {
                  s.contextTags = [];
                  changed = true;
                }
                if (changed) store.put(s);
              }
            });
          }
        }
      },
    });
  }
  return dbPromise;
}

export async function getStories(): Promise<Story[]> {
  const db = await getDB();
  const all = await db.getAll('stories');
  return all.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

export async function getStory(id: string): Promise<Story | undefined> {
  return (await getDB()).get('stories', id);
}

export async function putStory(story: Story): Promise<void> {
  story.updatedAt = new Date().toISOString();
  await (await getDB()).put('stories', story);
}

export async function deleteStory(id: string): Promise<void> {
  await (await getDB()).delete('stories', id);
}

export async function getHistory(): Promise<Prompt[]> {
  const db = await getDB();
  const all = await db.getAll('history');
  return all.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
}

/** Recent prompts, oldest→newest, capped at `limit`. */
export async function getRecentHistory(limit = 100): Promise<Prompt[]> {
  const all = await getHistory();
  return all.slice(-limit);
}

export async function addHistory(prompt: Prompt): Promise<void> {
  const db = await getDB();
  await db.put('history', prompt);
  // Keep history bounded so IndexedDB stays small on long-lived installs.
  const count = await db.count('history');
  const CAP = 500;
  if (count > CAP) {
    const all = await getHistory();
    const excess = all.slice(0, count - CAP);
    const tx = db.transaction('history', 'readwrite');
    await Promise.all(excess.map((p) => tx.store.delete(p.id)));
    await tx.done;
  }
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  return (await getDB()).get('meta', key) as Promise<T | undefined>;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await (await getDB()).put('meta', value, key);
}

/** Destroy every trace of user data on this device. */
export async function clearAllData(): Promise<void> {
  if (dbPromise) {
    (await dbPromise).close();
    dbPromise = undefined;
  }
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
}
