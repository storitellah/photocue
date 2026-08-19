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
  'a face caught between two expressions',
  'the space a person keeps returning to',
  'a moment of transaction, however small',
  'a gesture handed down through repetition',
  'the threshold where a private world meets a public one',
  'the object someone reaches for without looking',
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
  'anticipate the moment instead of reacting to it, and be ready before it arrives',
  'compose the empty frame first, then let the story walk into it',
  'shoot through something in the foreground to give the frame depth',
  'stay at eye level with your subject rather than above or below them',
  'work the scene: make ten frames of the same subject, each one different',
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

/**
 * lens — focal-length and depth guidance in a documentary photographer's terms.
 * Neutral craft language: how to see, not what to conclude.
 */
export const lenses = [
  'work wide (24–35mm) and step in close, letting the room breathe around your subject',
  'stay at a normal 50mm and keep the distance a person would naturally stand at',
  'reach with a short telephoto (85mm) and compress the layers of the scene',
  'shoot at your widest and let the foreground fall away into the background',
  'keep a shallow depth of field so one detail stays sharp and the rest softens',
  'stop down for deep focus so near and far read as one continuous space',
  'frame with a longer lens from across the room, present but unobtrusive',
];

/**
 * light quality — named documentary light, described observationally.
 */
export const lightQualities = [
  'in raking window light that skims across the surface',
  'in flat, even shade where nothing competes for attention',
  'against the light, letting a rim of brightness separate figure from ground',
  'in the warm, low light of the last hour',
  'in the hard midday light and its short, decisive shadows',
  'in the blue quiet just before the lights come on',
  'where a single practical light does all the work',
  'in the mixed light where daylight and interior light meet',
];

/**
 * film grammar — visual-storytelling and cinematographer's framing methods,
 * translated to still documentary work.
 */
export const filmGrammar = [
  'block the frame in layers — a foreground element, your subject, a background that explains the place',
  'hold on one composition and let the action move through it, the way a locked-off shot would',
  'find a natural frame within the frame — a doorway, a window, a gap between people',
  'use leading lines already in the scene to carry the eye to your subject',
  'build an establishing frame, then a detail, then a reaction, as if cutting a scene',
  'shoot the same beat from two distances so the pair reads like a wide and a close-up',
  'let negative space carry the mood rather than filling the frame',
  'place the horizon or a strong line off-centre and let the imbalance create tension',
];

/**
 * moment — the kind of instant a documentary photographer waits for.
 */
export const moments = [
  'the decisive moment where gesture, light, and composition briefly align',
  'the quiet beat just after the main action, when people forget the camera',
  'the in-between moment that a posed photograph would skip',
  'the exchange of a glance that lasts less than a second',
  'the moment a routine reaches its small turning point',
  'the pause where anticipation is visible on a face or in the hands',
  'the overlap where one activity ends and the next has not yet begun',
];

/**
 * story spine — a one-line narrative intention, in a filmmaker's terms.
 */
export const storySpines = [
  'treat this frame as the opening shot of a longer film',
  'imagine this as the single image a whole story would be captioned by',
  'shoot it as the cutaway that gives a sequence its breathing room',
  'make it the reveal that recontextualises everything before it',
  'let it be the closing image a viewer keeps after the story ends',
  'build it as the establishing frame a narrator would speak over',
];

/** Difficulty and time banks (secondary variation). */
export const difficulties = ['Gentle', 'Focused', 'Challenging'] as const;
export const times = ['10–15 min', '20–30 min', '30–45 min', '45–60 min'];
