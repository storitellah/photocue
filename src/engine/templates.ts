/**
 * Modular sentence templates.
 *
 * A template is a sentence skeleton with `{slot}` placeholders. The engine
 * fills each slot with a freshly chosen vocabulary entry, so a single template
 * yields thousands of readings. Every template declares the `slots` it uses so
 * the freshness rule can compare prompts by their meaningful components.
 *
 * Slots resolve to: subject, activity, approach, purpose, detail, distance,
 * perspective, lighting, relationship, atmosphere, movement, timeframe,
 * contrast, constraint. Two structural slots are handled by the engine:
 *   {lead}  → an optional "At <location>," / "In <location>," opener
 *   {place} → an optional place-type orientation phrase
 */

import type { Mode } from '../types';

export interface Template {
  id: string;
  assignment: string;
  why: string;
  variation: string;
  slots: string[];
}

/** Templates suitable for almost any mode; the broad combinatorial base. */
const GENERAL: Template[] = [
  {
    id: 'g-overlook',
    assignment:
      '{lead}find {subject}. Photograph {distance}, then {approach}. Include {detail}, and look for the contrast between {contrast}.',
    why: 'This can {purpose} without assuming what the place or its people are like.',
    variation:
      'Try one wide image, one medium frame, and one close observation, {lighting}.',
    slots: ['subject', 'distance', 'approach', 'detail', 'contrast', 'purpose', 'lighting'],
  },
  {
    id: 'g-pause',
    assignment:
      '{lead}look for {subject}. {perspectiveCap}, photograph someone {activity}, and stay long enough to notice {movement}.',
    why: 'A patient frame here can {purpose}.',
    variation: 'Make one frame {lighting}, and one that includes {detail}.',
    slots: ['subject', 'perspective', 'activity', 'movement', 'purpose', 'lighting', 'detail'],
  },
  {
    id: 'g-relationship',
    assignment:
      '{lead}find the relationship {relationship}. {approachCap}, and let {detail} explain the connection rather than a caption.',
    why: 'Showing a relationship directly can {purpose}.',
    variation: 'Photograph the same connection {timeframe}.',
    slots: ['relationship', 'approach', 'detail', 'purpose', 'timeframe'],
  },
  {
    id: 'g-threshold',
    assignment:
      '{lead}photograph {subject} {timeframe}. Frame the space first, then wait for a person {activity} to enter it.',
    why: 'This separates the setting from the moment and can {purpose}.',
    variation: 'Pair {distance} with a close detail of {detail}.',
    slots: ['subject', 'timeframe', 'activity', 'purpose', 'distance', 'detail'],
  },
  {
    id: 'g-trace',
    assignment:
      '{lead}photograph evidence of a person without including the person. Build a set from {detail} and what they leave behind, {lighting}.',
    why: 'Letting an object stand in for a person can {purpose}.',
    variation: '{approachCap}, keeping {atmosphere}.',
    slots: ['detail', 'lighting', 'purpose', 'approach', 'atmosphere'],
  },
  {
    id: 'g-edges',
    assignment:
      '{lead}photograph what happens at the edges rather than the centre. Look for {subject}, and photograph {distance} {perspective}.',
    why: 'The edges of a scene often {purpose}.',
    variation: 'Return {timeframe} and compare what changed.',
    slots: ['subject', 'distance', 'perspective', 'purpose', 'timeframe'],
  },
  {
    id: 'g-cine-layers',
    assignment:
      '{lead}find {subject} and {filmGrammar}. Shoot {lightQuality}, and wait for {moment}.',
    why: 'Thinking like a cinematographer — in layers and light — can {purpose}.',
    variation: 'Then {storySpine}, and make the single frame that carries it.',
    slots: ['subject', 'filmGrammar', 'lightQuality', 'moment', 'purpose', 'storySpine'],
  },
  {
    id: 'g-cine-lens',
    assignment:
      '{lead}choose one lens and commit: {lens}. Photograph {subject}, holding for {moment}.',
    why: 'A deliberate focal length is a point of view, and it can {purpose}.',
    variation: 'Keep the same lens but change your position until {detail} leads the frame.',
    slots: ['lens', 'subject', 'moment', 'purpose', 'detail'],
  },
  {
    id: 'g-cine-spine',
    assignment:
      '{lead}{storySpine}. Build it from {subject}, {filmGrammar}, {lightQuality}.',
    why: 'Naming an image’s job in the story before you shoot can {purpose}.',
    variation: 'Make one alternate frame that would cut against it, {perspective}.',
    slots: ['storySpine', 'subject', 'filmGrammar', 'lightQuality', 'purpose', 'perspective'],
  },
];

/** Mode-specific templates layered on top of the general base. */
const SPECIFIC: Partial<Record<Mode, Template[]>> = {
  'Opening Frame': [
    {
      id: 'open-invite',
      assignment:
        '{lead}make an image that could open a story: {subject}, photographed {distance} {perspective}. Let it invite the viewer without explaining everything.',
      why: 'An opening frame should raise a question rather than answer it.',
      variation: 'Make a second opening built only from {detail}.',
      slots: ['subject', 'distance', 'perspective', 'detail'],
    },
  ],
  Character: [
    {
      id: 'char-environmental',
      assignment:
        '{lead}find a person whose work shapes this place. Make an environmental portrait {perspective} without asking them to look at the camera; let {detail} explain their role.',
      why: 'A person can carry a whole story when the setting speaks with them.',
      variation: 'Add {distance} of the same person {activity}.',
      slots: ['perspective', 'detail', 'distance', 'activity'],
    },
  ],
  Context: [
    {
      id: 'ctx-setting',
      assignment:
        '{lead}show where the story happens and how the setting shapes it. Photograph {subject} {distance}, holding {contrast} in the same frame.',
      why: 'Context tells the viewer what forces are at work before any character appears.',
      variation: 'Photograph the same setting {timeframe}.',
      slots: ['subject', 'distance', 'contrast', 'timeframe'],
    },
  ],
  Detail: [
    {
      id: 'det-close',
      assignment:
        '{lead}make a close study of {detail}. Photograph it {lighting}, and find one more detail that {purpose}.',
      why: 'Details reveal labour, personality, memory, and change that wide frames miss.',
      variation: 'Keep every frame at the same distance.',
      slots: ['detail', 'lighting', 'purpose'],
    },
  ],
  Action: [
    {
      id: 'act-routine',
      assignment:
        '{lead}identify a routine most visitors would overlook. Photograph its beginning, one repeated action of someone {activity}, and the moment it ends.',
      why: 'A routine gives a story its rhythm and its sense of real time.',
      variation: 'Work {perspective}, {lighting}.',
      slots: ['activity', 'perspective', 'lighting'],
    },
  ],
  Tension: [
    {
      id: 'ten-contrast',
      assignment:
        '{lead}find the tension between {contrast}. Photograph it {perspective} without resolving it, and let {detail} hold the two sides together.',
      why: 'Tension is what makes a viewer keep looking.',
      variation: 'Make one calm frame and one that feels less settled.',
      slots: ['contrast', 'perspective', 'detail'],
    },
  ],
  Change: [
    {
      id: 'chg-evidence',
      assignment:
        '{lead}photograph evidence of change: something being repaired, replaced, built, or let go. Compare it {timeframe}, and include {detail}.',
      why: 'Change is often visible in small, undramatic signs before it is announced.',
      variation: 'Photograph the same subject {perspective}.',
      slots: ['timeframe', 'detail', 'perspective'],
    },
  ],
  'Sound Into Image': [
    {
      id: 'snd-loudest',
      assignment:
        '{lead}listen for the most repeated sound, then make an image that helps a viewer imagine hearing it. Photograph its source and {detail} it affects.',
      why: 'Translating sound into a still image sharpens how you observe a place.',
      variation: 'Add a frame of someone {activity} in response to the sound.',
      slots: ['detail', 'activity'],
    },
  ],
  'Before and After': [
    {
      id: 'ba-evidence',
      assignment:
        '{lead}look for visual evidence of what happened before this moment and what may happen next. Photograph {subject} {timeframe}, then return and photograph what remains.',
      why: 'A before-and-after pair makes time itself part of the story.',
      variation: 'Hold {contrast} across the two frames.',
      slots: ['subject', 'timeframe', 'contrast'],
    },
  ],
  Portrait: [
    {
      id: 'por-collab',
      assignment:
        '{lead}make a portrait built with, not of, your subject. Photograph them {perspective} among the objects of their day, and let {detail} do the describing.',
      why: 'A collaborative portrait respects the subject and tells more than a face alone.',
      variation: 'Follow it with a detail portrait — hands, tools, or {detail}.',
      slots: ['perspective', 'detail'],
    },
  ],
  Sequence: [
    {
      id: 'seq-three',
      assignment:
        '{lead}build a short sequence of three frames around {subject}: a wide frame that sets the scene, a medium frame of someone {activity}, and a close frame of {detail}.',
      why: 'A sequence carries a viewer through a moment the way a single image cannot.',
      variation: 'Extend it to five frames by adding {movement} and a quiet closing detail.',
      slots: ['subject', 'activity', 'detail', 'movement'],
    },
  ],
  'Closing Frame': [
    {
      id: 'close-end',
      assignment:
        '{lead}make an image that could close a story without repeating its opening. Look for {subject} {timeframe}, and let {atmosphere} settle the frame.',
      why: 'A closing frame should leave the viewer with a feeling, not a summary.',
      variation: 'Try a closing built only from {detail}.',
      slots: ['subject', 'timeframe', 'atmosphere', 'detail'],
    },
  ],
  Reflection: [
    {
      id: 'ref-why',
      assignment:
        '{lead}before you photograph, decide why this image matters. Make one considered frame of {subject}, then note what stays outside it.',
      why: 'Reflection turns a habit of shooting into a practice of seeing.',
      variation: 'Photograph the same subject again after answering the reflection question.',
      slots: ['subject'],
    },
  ],
  'Constraint Challenge': [
    {
      id: 'con-limit',
      assignment:
        '{lead}set yourself one limit for this set: {constraint}. Within it, photograph {subject} and find {detail} you would otherwise pass by.',
      why: 'A constraint removes easy choices and forces closer observation.',
      variation: 'Keep the same constraint but change your position entirely.',
      slots: ['constraint', 'subject', 'detail'],
    },
  ],
  'Story Starter': [
    {
      id: 'start-premise',
      assignment:
        '{lead}look for a possible story: {subject}, or a recurring activity someone returns to. Photograph {distance} that suggests why it might matter.',
      why: 'A strong story usually begins with one specific, observable thing.',
      variation: 'Write one sentence naming the question this could answer.',
      slots: ['subject', 'distance'],
    },
  ],
  Relationship: [
    {
      id: 'rel-connect',
      assignment:
        '{lead}photograph the relationship {relationship}. {approachCap}, and hold both sides of the connection in one frame where you can.',
      why: 'Relationships are the connective tissue of a documentary story.',
      variation: 'Add a detail frame of {detail} that the two share.',
      slots: ['relationship', 'approach', 'detail'],
    },
  ],
};

/** Return the template pool for a mode: specific templates first, then general. */
export function templatesFor(mode: Mode): Template[] {
  return [...(SPECIFIC[mode] ?? []), ...GENERAL];
}
