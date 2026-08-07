/**
 * Story manager.
 *
 * Owns the lifecycle of a documentary story: creating it, saving prompts into
 * it, suggesting the next Story Path stage, reordering and re-statusing saved
 * prompts, and editing stages. It sits between the UI and the storage layer so
 * views never touch IndexedDB directly.
 */

import type { Mode, Prompt, PromptStatus, SavedPrompt, Story } from '../types';
import { DEFAULT_STAGES, STAGE_MODE } from '../data/story-stages';
import { deleteStory, getStories, getStory, putStory } from '../storage/db';
import { sanitizeMultiline, sanitizeText } from '../util/sanitize';
import { uuid } from '../util/rng';

export function newStory(partial: Partial<Story> = {}): Story {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    title: sanitizeText(partial.title || 'Untitled story'),
    location: sanitizeText(partial.location || ''),
    placeType: partial.placeType,
    question: sanitizeText(partial.question || 'What does careful observation reveal here?'),
    theme: sanitizeText(partial.theme || 'Everyday life'),
    contextTags: partial.contextTags ?? [],
    prompts: [],
    stages: partial.stages ?? [...DEFAULT_STAGES],
    stage: 0,
    reflection: '',
    createdAt: now,
    updatedAt: now,
  };
}

export async function listStories(): Promise<Story[]> {
  return getStories();
}

export async function saveStory(story: Story): Promise<void> {
  await putStory(story);
}

export async function removeStory(id: string): Promise<void> {
  await deleteStory(id);
}

/** The mode that best matches a story's current stage. */
export function modeForStage(stage: string | undefined): Mode | undefined {
  if (!stage) return undefined;
  return STAGE_MODE[stage];
}

/**
 * Save a prompt into a story and advance the Story Path to the next useful
 * stage. Returns the updated story and the suggested next stage name.
 */
export async function savePromptToStory(
  storyId: string,
  prompt: Prompt,
): Promise<{ story: Story; nextStage: string | undefined }> {
  let story = await getStory(storyId);
  if (!story) throw new Error('Story not found');

  if (!story.prompts.some((p) => p.id === prompt.id)) {
    const saved: SavedPrompt = { ...prompt, status: 'Not started', notes: '' };
    story.prompts = [...story.prompts, saved];
    // Advance the stage pointer, but never past the end of the path.
    story.stage = Math.min(story.stage + 1, story.stages.length);
  }
  await putStory(story);
  story = (await getStory(storyId))!;
  const nextStage = story.stages[story.stage];
  return { story, nextStage };
}

/** Update the field-work status of a saved prompt. */
export async function setPromptStatus(
  storyId: string,
  promptId: string,
  status: PromptStatus,
): Promise<void> {
  const story = await getStory(storyId);
  if (!story) return;
  const p = story.prompts.find((x) => x.id === promptId);
  if (!p) return;
  p.status = status;
  await putStory(story);
}

/** Update the field note attached to a saved prompt. */
export async function setPromptNote(
  storyId: string,
  promptId: string,
  note: string,
  tags: string[] = [],
): Promise<void> {
  const story = await getStory(storyId);
  if (!story) return;
  const p = story.prompts.find((x) => x.id === promptId);
  if (!p) return;
  p.notes = sanitizeMultiline(note);
  p.noteTags = tags;
  p.noteUpdatedAt = new Date().toISOString();
  await putStory(story);
}

/** Reorder saved prompts (drag and drop) by moving one from → to. */
export async function reorderPrompts(
  storyId: string,
  from: number,
  to: number,
): Promise<void> {
  const story = await getStory(storyId);
  if (!story) return;
  const list = story.prompts;
  if (from < 0 || from >= list.length || to < 0 || to >= list.length) return;
  const [moved] = list.splice(from, 1);
  list.splice(to, 0, moved);
  await putStory(story);
}

/** Remove a saved prompt from a story. */
export async function removePrompt(storyId: string, promptId: string): Promise<void> {
  const story = await getStory(storyId);
  if (!story) return;
  story.prompts = story.prompts.filter((p) => p.id !== promptId);
  await putStory(story);
}

/** Replace the ordered stages of a story (skip/reorder/remove/repeat). */
export async function setStages(
  storyId: string,
  stages: string[],
): Promise<void> {
  const story = await getStory(storyId);
  if (!story) return;
  story.stages = stages.map((s) => sanitizeText(s)).filter(Boolean);
  story.stage = Math.min(story.stage, story.stages.length);
  await putStory(story);
}

/** A simple 0–1 progress ratio for the story path indicator. */
export function progress(story: Story): number {
  if (!story.stages.length) return 0;
  const done = story.prompts.filter((p) => p.status === 'Complete').length;
  return Math.min(1, Math.max(done, story.stage) / story.stages.length);
}
