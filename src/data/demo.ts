import type { Story } from '../types';
import { uuid } from '../util/rng';

/**
 * The built-in demo story "Morning at the Market". Seeded on first run so a new
 * user can see how a story develops. It is a real, editable story — not a
 * locked example — and can be deleted like any other.
 */
export function createDemoStory(): Story {
  const now = new Date().toISOString();
  const stages = [
    'Empty or preparing space',
    'First person to arrive',
    'Opening routines',
    'Tools and objects',
    'Relationships between traders',
    'Customers entering',
    'Movement and exchange',
    'A quiet detail',
    'Evidence of pressure or change',
    'Closing routine',
  ];
  return {
    id: uuid(),
    title: 'Morning at the Market',
    location: 'A neighbourhood market',
    placeType: 'Market',
    question: 'How does the market move from preparation to full activity?',
    theme: 'Work',
    contextTags: ['Work', 'Community', 'Public space'],
    prompts: [],
    stages,
    stage: 0,
    reflection: '',
    createdAt: now,
    updatedAt: now,
  };
}

export const DEMO_SEEDED_KEY = 'pc-demo-seeded';
