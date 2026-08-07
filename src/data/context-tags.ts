/** Optional context tags a user can attach to a location or story. */
export const CONTEXT_TAGS = [
  'Identity',
  'Belonging',
  'Community',
  'Family',
  'Work',
  'Youth',
  'Environment',
  'Migration',
  'Health',
  'Education',
  'Tradition',
  'Change',
  'Resilience',
  'Conflict',
  'Joy',
  'Memory',
  'Home',
  'Culture',
  'Public space',
] as const;

export type ContextTag = (typeof CONTEXT_TAGS)[number];

/**
 * A neutral lens line per tag. Used to gently steer a prompt when the user has
 * opted into a theme. Never states a fact about the place — only a way to look.
 */
export const TAG_LENS: Record<string, string> = {
  Identity: 'how people present who they are',
  Belonging: 'the signs that someone feels part of a place',
  Community: 'what is shared and how it is looked after',
  Family: 'the small acts that hold a household together',
  Work: 'the rhythm and tools of daily labour',
  Youth: 'how younger people use and change a space',
  Environment: 'how the surroundings shape a daily choice',
  Migration: 'what people carry, keep, and rebuild',
  Health: 'the quiet routines of care and recovery',
  Education: 'where learning happens, formal or not',
  Tradition: 'a practice passed from one person to another',
  Change: 'evidence that something is in transition',
  Resilience: 'how people adapt and keep going',
  Conflict: 'competing needs held in the same frame',
  Joy: 'a moment of ease or celebration',
  Memory: 'what is kept, marked, or remembered',
  Home: 'the meaning of a personal space',
  Culture: 'a shared practice expressed in daily life',
  'Public space': 'how a shared place is used and negotiated',
};
