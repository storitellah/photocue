import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { openDB } from 'idb';
import { DB_NAME, DB_VERSION, getStories, clearAllData } from '../src/storage/db';

/**
 * Verifies the migration ladder preserves user stories. We seed a "v1"-shaped
 * database directly, then open through the app's migration path and confirm the
 * story survives and is back-filled with the newer fields.
 */
describe('database migrations', () => {
  it('upgrades a v1 database without destroying saved stories', async () => {
    await clearAllData();

    // Create a v1 database with a story that lacks the newer fields.
    const v1 = await openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore('stories', { keyPath: 'id' });
        db.createObjectStore('history', { keyPath: 'id' });
      },
    });
    await v1.put('stories', {
      id: 'legacy-1',
      title: 'Legacy story',
      location: 'A market',
      question: 'q',
      prompts: [],
      stage: 2,
    });
    v1.close();

    // Re-open through the app at the current version (runs the migrations).
    const stories = await getStories();
    const legacy = stories.find((s) => s.id === 'legacy-1');
    expect(legacy).toBeDefined();
    expect(legacy!.title).toBe('Legacy story');
    // Back-filled fields:
    expect(Array.isArray(legacy!.contextTags)).toBe(true);
    expect(typeof legacy!.createdAt).toBe('string');
    expect(typeof legacy!.updatedAt).toBe('string');
  });

  it('reports the expected current version', () => {
    expect(DB_VERSION).toBeGreaterThanOrEqual(2);
  });
});
