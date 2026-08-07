// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { createBackup, inspectBackup, applyBackup, MAX_IMPORT_BYTES } from '../src/managers/backup';
import { newStory, saveStory, savePromptToStory, listStories } from '../src/managers/story';
import { generatePrompt } from '../src/engine';
import { clearAllData } from '../src/storage/db';
import { BACKUP_FORMAT_VERSION } from '../src/version';

beforeEach(async () => {
  await clearAllData();
  localStorage.clear();
});

describe('backup export', () => {
  it('produces a versioned envelope and can strip the installation seed for sharing', async () => {
    const s = newStory({ title: 'Backup me', location: 'A market' });
    await saveStory(s);
    const local = await createBackup(false);
    expect(local.application).toBe('PhotoCue');
    expect(local.backupFormatVersion).toBe(BACKUP_FORMAT_VERSION);
    expect(local.stories).toHaveLength(1);

    const shareable = await createBackup(true);
    expect(shareable.installationSeed).toBeUndefined();
  });
});

describe('backup import validation', () => {
  it('rejects non-JSON and non-PhotoCue files', () => {
    expect(inspectBackup('not json').ok).toBe(false);
    expect(inspectBackup(JSON.stringify({ application: 'Something' })).ok).toBe(false);
  });

  it('rejects a backup from a newer format version', () => {
    const future = JSON.stringify({
      application: 'PhotoCue',
      backupFormatVersion: BACKUP_FORMAT_VERSION + 5,
      stories: [],
    });
    expect(inspectBackup(future).ok).toBe(false);
  });

  it('rejects oversized files', () => {
    const huge = 'x'.repeat(MAX_IMPORT_BYTES + 1);
    expect(inspectBackup(huge).ok).toBe(false);
  });

  it('sanitises malicious content and never carries HTML through', () => {
    const malicious = JSON.stringify({
      application: 'PhotoCue',
      backupFormatVersion: BACKUP_FORMAT_VERSION,
      stories: [
        {
          id: 'x',
          title: '<img src=x onerror=alert(1)>',
          location: '<script>evil()</script>',
          question: 'q',
          stages: ['Opening image'],
          stage: 0,
          prompts: [
            {
              id: 'p1',
              title: '<b>t</b>',
              assignment: 'Do <script>bad</script>',
              status: 'Photographed',
              notes: '<iframe></iframe>',
            },
          ],
        },
      ],
    });
    const summary = inspectBackup(malicious);
    expect(summary.ok).toBe(true);
    const story = summary.data!.stories[0];
    expect(story.title).not.toContain('<');
    expect(story.location).not.toContain('<');
    expect(story.prompts[0].assignment).not.toContain('<');
    expect(story.prompts[0].notes).not.toContain('<');
    expect(story.prompts[0].status).toBe('Photographed');
  });

  it('round-trips a real backup and imports it with fresh ids', async () => {
    const s = newStory({ title: 'Original', location: 'A school' });
    await saveStory(s);
    const p = generatePrompt({ seed: 's', mode: 'Character', spin: 1, entropy: 1 });
    await savePromptToStory(s.id, p);

    const backup = await createBackup(true);
    await clearAllData();

    const summary = inspectBackup(JSON.stringify(backup));
    expect(summary.ok).toBe(true);
    const n = await applyBackup(summary);
    expect(n).toBe(1);

    const restored = await listStories();
    expect(restored).toHaveLength(1);
    expect(restored[0].title).toBe('Original');
    expect(restored[0].prompts).toHaveLength(1);
    // Imported stories get fresh ids to avoid clobbering existing ones.
    expect(restored[0].id).not.toBe(s.id);
  });
});
