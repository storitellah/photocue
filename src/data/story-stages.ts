import type { Mode } from '../types';

/**
 * The default Story Path stages, in narrative order. A story keeps its own copy
 * so users can skip, reorder, repeat, or remove stages without affecting the
 * defaults.
 */
export const DEFAULT_STAGES = [
  'Story question',
  'Opening image',
  'Location and context',
  'Main character',
  'Daily routine',
  'Relationships',
  'Important details',
  'Challenge or tension',
  'Change or response',
  'Consequences',
  'Quiet moment',
  'Closing image',
];

/**
 * Maps a story stage to the prompt mode that best serves it, so that saving a
 * prompt can suggest a *relevant* next assignment rather than a random one.
 */
export const STAGE_MODE: Record<string, Mode> = {
  'Story question': 'Story Starter',
  'Opening image': 'Opening Frame',
  'Location and context': 'Context',
  'Main character': 'Character',
  'Daily routine': 'Action',
  Relationships: 'Relationship',
  'Important details': 'Detail',
  'Challenge or tension': 'Tension',
  'Change or response': 'Change',
  Consequences: 'Before and After',
  'Quiet moment': 'Reflection',
  'Closing image': 'Closing Frame',
};

/** A short prompt to the user describing what a stage is for. */
export const STAGE_HINT: Record<string, string> = {
  'Story question': 'What do you want this story to find out?',
  'Opening image': 'An image that invites the viewer in.',
  'Location and context': 'Where this happens, and how the setting matters.',
  'Main character': 'A person the story can follow.',
  'Daily routine': 'The ordinary rhythm that structures the days.',
  Relationships: 'The connections that hold the story together.',
  'Important details': 'The close observations that carry meaning.',
  'Challenge or tension': 'The pressure, contrast, or uncertainty at play.',
  'Change or response': 'How people adapt, resist, or respond.',
  Consequences: 'What follows from the change.',
  'Quiet moment': 'A pause that lets the story breathe.',
  'Closing image': 'An ending that does not simply repeat the opening.',
};
