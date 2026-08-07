import { describe, expect, it } from 'vitest';
import { storyToText, storyToMarkdown } from '../src/export/text';
import { newStory } from '../src/managers/story';
import type { SavedPrompt } from '../src/types';

function sampleStory() {
  const s = newStory({ title: 'Morning at the Market', location: 'A neighbourhood market' });
  s.stage = 1;
  const prompt: SavedPrompt = {
    id: 'p1',
    fingerprint: 'fp',
    components: { template: 't', mode: 'Opening Frame' },
    mode: 'Opening Frame',
    title: 'The First to Arrive',
    assignment: 'Photograph the space before anyone arrives.',
    why: 'It sets the rhythm of the day.',
    variation: 'One wide, one close.',
    reflection: 'What is missing here?',
    role: 'Introduction',
    difficulty: 'Focused',
    time: '20–30 min',
    createdAt: new Date().toISOString(),
    status: 'Observed',
    notes: 'Arrived at 5am.',
  };
  s.prompts.push(prompt);
  return s;
}

describe('story exporters', () => {
  it('renders a readable plain-text plan', () => {
    const txt = storyToText(sampleStory());
    expect(txt).toContain('Morning at the Market');
    expect(txt).toContain('The First to Arrive');
    expect(txt).toContain('Field note: Arrived at 5am.');
    expect(txt).toContain('One tap. One place. One story.');
  });

  it('renders valid Markdown with headings and a checklist', () => {
    const md = storyToMarkdown(sampleStory());
    expect(md).toMatch(/^# Morning at the Market/m);
    expect(md).toContain('## Story path');
    expect(md).toMatch(/- \[x\] Story question/);
    expect(md).toContain('### 1. The First to Arrive');
  });
});
