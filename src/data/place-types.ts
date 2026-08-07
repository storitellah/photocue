import type { PlaceType } from '../types';

/** Selectable place types. Order is presentation order. */
export const PLACE_TYPES: PlaceType[] = [
  'Neighbourhood',
  'Market',
  'Home',
  'School',
  'Workplace',
  'Transport hub',
  'Street',
  'Rural area',
  'Waterfront',
  'Public institution',
  'Religious space',
  'Event',
  'Landscape',
  'Community centre',
  'Health facility',
  'Unknown or mixed',
];

/**
 * Neutral, observational orientation lines per place type. These describe a
 * way of *looking* — never a fact or an assumption about the place. The engine
 * folds one of these into location-aware prompts.
 */
export const PLACE_ORIENTATION: Record<PlaceType, string[]> = {
  Neighbourhood: [
    'find a corner where different daily routines overlap',
    'look for a shared space that several households pass through',
  ],
  Market: [
    'identify one item that moves through several stages before it reaches a customer',
    'follow the people, tools, and decisions behind a single transaction',
  ],
  Home: [
    'photograph how one room changes during the day',
    'notice how objects mark the habits of the people who live there',
  ],
  School: [
    'look for how learning appears outside a classroom',
    'watch for gestures, preparation, and informal teaching',
  ],
  Workplace: [
    'follow one task from preparation to completion',
    'look for the tools and small routines that structure the work',
  ],
  'Transport hub': [
    'follow the visual journey of one departure or arrival',
    'photograph preparation, waiting, movement, and what remains after',
  ],
  Street: [
    'find a threshold where public activity briefly becomes private',
    'watch a single stretch of pavement through several passers-by',
  ],
  'Rural area': [
    'look for evidence of how distance shapes a daily decision',
    'let the setting explain a specific action rather than a general view',
  ],
  Waterfront: [
    'follow how the edge between land and water organises the work',
    'watch what people carry toward and away from the water',
  ],
  'Public institution': [
    'observe the small routines that keep a shared service running',
    'look for the space between waiting and being attended to',
  ],
  'Religious space': [
    'observe the preparations and gestures around a gathering, with care',
    'notice how a shared space is arranged and maintained',
  ],
  Event: [
    'photograph what happens at the edges of the main activity',
    'look for preparation, waiting, care, observation, or departure',
  ],
  Landscape: [
    'find where a human decision meets the wider setting',
    'let the setting explain an action rather than stand alone',
  ],
  'Community centre': [
    'look for how a shared room is set up and taken down',
    'watch for the people who make the space work for others',
  ],
  'Health facility': [
    'observe the quiet routines of care and waiting, with discretion',
    'look for the objects and gestures that carry reassurance',
  ],
  'Unknown or mixed': [
    'let the place reveal its own rhythm before deciding what it is',
    'look for the activity that repeats most often here',
  ],
};
