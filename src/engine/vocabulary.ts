/**
 * Prompt vocabulary banks.
 *
 * Each exported array is one "dimension" the compositional engine can vary.
 * Templates (see templates.ts) reference these by name and the engine picks a
 * fresh entry per dimension using a seeded RNG. The product of these bank sizes
 * across the dimensions a template uses runs into the hundreds of thousands of
 * unique combinations, well before difficulty / time / title variants.
 *
 * CONTRIBUTING: add entries to a bank, or add a whole new bank plus a template
 * that uses it. Never add complete pre-written prompts — variety comes from
 * combination, not from a long list of fixed sentences. Keep language neutral
 * and observational; do not assume anything about a place or its people.
 */

/** subject — the thing the photographer looks for. */
export const subjects = [
  'a routine most visitors would overlook',
  'a person whose work shapes the place',
  'an object that passes between several people',
  'a boundary people cross, avoid, or negotiate',
  'a threshold between one space and another',
  'a place where people pause before moving on',
  'a surface that records daily use',
  'a repeated gesture that carries meaning',
  'a corner where different routines overlap',
  'an arrangement someone made with care',
  'a tool that only makes sense in this setting',
  'a small act of maintenance or repair',
  'a shared resource many people depend on',
  'a quiet exchange between two people',
  'a sign of preparation before an activity begins',
  'a trace left by someone who is no longer present',
  'a spot where waiting happens',
  'a detail that shows how time passes here',
];

/** activity — human action in progress. */
export const activities = [
  'preparing',
  'waiting',
  'repairing',
  'teaching',
  'carrying something',
  'arriving',
  'departing',
  'listening',
  'sorting',
  'sharing',
  'cleaning',
  'measuring',
  'negotiating',
  'resting between tasks',
  'setting things in order',
  'greeting someone',
  'watching over the space',
  'handing something across',
];

/** approach — a visual method or way of working. */
export const approaches = [
  'build a short three-frame sequence',
  'work from one position for ten minutes',
  'follow the changing light across the scene',
  'photograph without directing the action',
  'pair a wide frame with a close detail',
  'use the foreground and background together',
  'observe for a while before raising the camera',
  'return to the same frame at two different times',
  'let one gesture repeat until it feels natural',
  'frame the space first, then wait for a person to enter it',
  'photograph what happens at the edges, not the centre',
  'move closer in three steps rather than zooming',
];

/** purpose — the narrative reason for the image. */
export const purposes = [
  'reveal how the place functions',
  'introduce a possible character',
  'show a relationship that is easy to miss',
  'connect a private action to its public setting',
  'suggest what happened just before this moment',
  'leave room for uncertainty rather than resolving it',
  'establish the rhythm of an ordinary day',
  'give a sense of scale between people and place',
  'record a change that would otherwise pass unnoticed',
  'let an object stand in for a person',
];

/** detail — a close observation. */
export const details = [
  'worn tools',
  'hands mid-task',
  'traces left on a surface',
  'personal objects arranged by habit',
  'signs of repair or improvisation',
  'the light at an entrance',
  'what remains after an activity ends',
  'a handwritten note or marking',
  'the wear on a well-used threshold',
  'an object that has been mended more than once',
  'the way things are stacked or stored',
  'a small repair no one was meant to notice',
];

/** shot distance. */
export const distances = [
  'a wide establishing frame',
  'a medium frame that holds a person and their setting',
  'a close detail',
  'a frame that moves from near to far in one glance',
];

/** perspective / camera position. */
export const perspectives = [
  'from the height of someone seated',
  'from across the space',
  'from just behind the action',
  'from the level of the object itself',
  'from a doorway looking in',
  'from within the flow of movement',
];

/** lighting condition. */
export const lighting = [
  'in available light only',
  'where light meets shadow',
  'against a bright background',
  'in the softer light near an opening',
  'as the light changes',
  'in the last usable light of the setting',
];

/** relationship between elements. */
export const relationships = [
  'between two people who rely on each other',
  'between a person and the tools of their work',
  'between an individual and the group around them',
  'between what is kept and what is discarded',
  'between one generation and another',
  'between a person and the space they maintain',
  'between those arriving and those already present',
];

/** atmosphere / emotion (neutral, observational). */
export const atmospheres = [
  'a sense of quiet concentration',
  'the ordinary calm before activity',
  'a moment of shared attention',
  'the pause that follows effort',
  'a feeling of steady routine',
  'the alertness of someone at work',
];

/** movement. */
export const movements = [
  'a movement that repeats through the day',
  'the moment something is set down',
  'a hand passing an object across',
  'the point where stillness becomes motion',
  'a path people follow without thinking',
  'the last movement before a pause',
];

/** timeframe. */
export const timeframes = [
  'early, before most people arrive',
  'during the busiest stretch',
  'in a lull between tasks',
  'as the day begins to close',
  'across two moments an hour apart',
  'at the change between one activity and the next',
];

/** contrast pair. */
export const contrasts = [
  'stillness and movement',
  'public and private space',
  'preparation and completion',
  'individual effort and shared work',
  'what is permanent and what is temporary',
  'expectation and what actually happens',
  'the centre of activity and its quiet edges',
  'arrival and departure',
];

/** creative constraint (for Constraint Challenge and optional flavour). */
export const constraints = [
  'use only one focal length for the whole set',
  'stay in a single position and let the scene come to you',
  'follow one colour through the space',
  'avoid faces and let context carry the meaning',
  'photograph only reflections',
  'work with available light alone',
  'make no more than five frames',
  'keep every frame at the same distance',
  'include a doorway or opening in each image',
  'photograph only what is at hand height',
];

/** reflection question. */
export const reflections = [
  'What might a viewer misunderstand if they saw only one frame?',
  'Whose perspective is missing from this set?',
  'What changed once you stayed longer than felt comfortable?',
  'Does the frame preserve the dignity of the people in it?',
  'What lies just outside the edge of the frame?',
  'What would this image mean to the person in it?',
  'What did you assume before looking, and did it hold?',
  'Which detail did you almost overlook?',
  'What would be lost if this moment went unphotographed?',
];

/**
 * ethics — practical reminders, surfaced only when the mode or subject makes
 * them relevant. Deliberately plain and non-legal.
 */
export const ethics = [
  'Ask for consent when appropriate, and give people room to decline.',
  'Do not pressure anyone to participate or to repeat a sensitive action.',
  'Avoid revealing private information or a vulnerable person’s location.',
  'Distinguish observation from staging, and be honest about which you did.',
  'Consider how the image might affect the person photographed.',
  'Explain, if you can, how the image may be used.',
  'Do not use stereotypes as a shortcut for understanding.',
];

/** title fragments — combined for variety, never used as the whole prompt. */
export const titleOpeners = [
  'A Rhythm Beneath',
  'The Space Between',
  'What the Place Holds',
  'A Trace of',
  'Where Paths Cross',
  'Before the Next',
  'The Person Who',
  'Small Signs of',
  'At the Edge of',
  'The Weight of',
  'Between Arrivals',
  'A Quiet Order',
];
export const titleClosers = [
  'the Surface',
  'Ordinary Work',
  'Daily Life',
  'a Shared Space',
  'the Everyday',
  'a Passing Hour',
  'Careful Hands',
  'the Threshold',
  'the Waiting',
  'Steady Routine',
  'What Remains',
  'the Overlooked',
];

/** Difficulty and time banks (secondary variation). */
export const difficulties = ['Gentle', 'Focused', 'Challenging'] as const;
export const times = ['10–15 min', '20–30 min', '30–45 min', '45–60 min'];
