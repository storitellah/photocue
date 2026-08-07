import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  newStory,
  saveStory,
  savePromptToStory,
  setPromptStatus,
  setPromptNote,
  reorderPrompts,
  removePrompt,
  setStages,
  listStories,
  progress,
} from '../src/managers/story';
import { generatePrompt } from '../src/engine';
import { clearAllData } from '../src/storage/db';
import { DEFAULT_STAGES } from '../src/data/story-stages';

beforeEach(async () => {
  await clearAllData();
});

describe('story progression', () => {
  it('creates a story with the default story path', () => {
    const s = newStory({ title: 'Test', location: 'A market' });
    expect(s.stages).toEqual(DEFAULT_STAGES);
    expect(s.stage).toBe(0);
  });

  it('advances the stage and suggests the next stage when a prompt is saved', async () => {
    const story = newStory({ title: 'Market day', location: 'A market' });
    await saveStory(story);
    const p = generatePrompt({ seed: 's', mode: 'Opening Frame', spin: 1, entropy: 1 });

    const r1 = await savePromptToStory(story.id, p);
    expect(r1.story.prompts).toHaveLength(1);
    expect(r1.story.stage).toBe(1);
    expect(r1.nextStage).toBe(DEFAULT_STAGES[1]);
  });

  it('does not duplicate the same prompt or over-advance the path', async () => {
    const story = newStory({ title: 'X' });
    await saveStory(story);
    const p = generatePrompt({ seed: 's', mode: 'Detail', spin: 1, entropy: 2 });
    await savePromptToStory(story.id, p);
    const r = await savePromptToStory(story.id, p); // same prompt again
    expect(r.story.prompts).toHaveLength(1);
    expect(r.story.stage).toBe(1);
  });

  it('marks status and stores field notes', async () => {
    const story = newStory({ title: 'Y' });
    await saveStory(story);
    const p = generatePrompt({ seed: 's', mode: 'Action', spin: 1, entropy: 3 });
    await savePromptToStory(story.id, p);

    await setPromptStatus(story.id, p.id, 'Photographed');
    await setPromptNote(story.id, p.id, 'Went back at dawn <ok>', ['dawn']);

    const [saved] = await listStories();
    expect(saved.prompts[0].status).toBe('Photographed');
    expect(saved.prompts[0].notes).toContain('Went back at dawn');
    expect(saved.prompts[0].notes).not.toContain('<');
    expect(saved.prompts[0].noteTags).toContain('dawn');
  });

  it('reorders prompts by drag index and can remove one', async () => {
    const story = newStory({ title: 'Z' });
    await saveStory(story);
    const a = generatePrompt({ seed: 's', mode: 'Detail', spin: 1, entropy: 1 });
    const b = generatePrompt({ seed: 's', mode: 'Detail', spin: 2, entropy: 2 });
    await savePromptToStory(story.id, a);
    await savePromptToStory(story.id, b);

    await reorderPrompts(story.id, 0, 1);
    let [s] = await listStories();
    expect(s.prompts[0].id).toBe(b.id);

    await removePrompt(story.id, b.id);
    [s] = await listStories();
    expect(s.prompts).toHaveLength(1);
    expect(s.prompts[0].id).toBe(a.id);
  });

  it('allows editing the story stages (skip/reorder/remove)', async () => {
    const story = newStory({ title: 'Edit stages' });
    await saveStory(story);
    await setStages(story.id, ['Opening image', 'Closing image']);
    const [s] = await listStories();
    expect(s.stages).toEqual(['Opening image', 'Closing image']);
  });

  it('reports progress as a bounded ratio', () => {
    const s = newStory({ title: 'P' });
    s.stage = 6;
    expect(progress(s)).toBeCloseTo(0.5, 1);
  });
});
