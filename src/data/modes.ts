import type { Mode } from '../types';

/** Ordered list of every prompt mode. */
export const MODES: Mode[] = [
  'General Prompt',
  'Location Prompt',
  'Story Starter',
  'Opening Frame',
  'Character',
  'Context',
  'Relationship',
  'Detail',
  'Action',
  'Tension',
  'Change',
  'Sound Into Image',
  'Before and After',
  'Portrait',
  'Sequence',
  'Closing Frame',
  'Reflection',
  'Constraint Challenge',
];

/** Short story-role label shown on a prompt card for each mode. */
export const MODE_ROLE: Record<Mode, string> = {
  'General Prompt': 'Observation and context',
  'Location Prompt': 'Place and context',
  'Story Starter': 'Subject and premise',
  'Opening Frame': 'Introduction',
  Character: 'Character',
  Context: 'Context and setting',
  Relationship: 'Connection',
  Detail: 'Detail and texture',
  Action: 'Action and routine',
  Tension: 'Tension and contrast',
  Change: 'Change over time',
  'Sound Into Image': 'Atmosphere',
  'Before and After': 'Sequence and time',
  Portrait: 'Character',
  Sequence: 'Sequence',
  'Closing Frame': 'Resolution',
  Reflection: 'Reflection',
  'Constraint Challenge': 'Craft and observation',
};

/** One-line description shown in the mode selector help. */
export const MODE_DESCRIPTION: Record<Mode, string> = {
  'General Prompt': 'An open assignment suitable for almost any location.',
  'Location Prompt': 'Uses your place, its type, and the time of day.',
  'Story Starter': 'Find a possible subject, issue, or recurring activity.',
  'Opening Frame': 'An image that can introduce a place or situation.',
  Character: 'Find a person who could carry the story.',
  Context: 'Show where the story happens and how the setting shapes it.',
  Relationship: 'Photograph connections between people, objects, or systems.',
  Detail: 'Close observations that reveal labour, memory, or change.',
  Action: 'Moments of movement, work, routine, waiting, or interaction.',
  Tension: 'Contrast, absence, pressure, or competing realities.',
  Change: 'Evidence of transition, adaptation, or resistance.',
  'Sound Into Image': 'Notice a sound and find a way to picture it.',
  'Before and After': 'Evidence of what happened before and what may follow.',
  Portrait: 'Environmental, observational, and collaborative portraits.',
  Sequence: 'A short three- or five-photo sequence.',
  'Closing Frame': 'An image that can end a story without repeating the open.',
  Reflection: 'Consider why an image matters and what stays out of frame.',
  'Constraint Challenge': 'A practical creative limitation to sharpen seeing.',
};
