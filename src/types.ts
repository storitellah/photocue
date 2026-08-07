/**
 * PhotoCue shared types.
 *
 * These describe the shapes that flow between the prompt engine, the storage
 * layer, and the interface. Keeping them in one place makes the modular
 * boundaries explicit: the engine never imports the UI and vice versa.
 */

/** All prompt modes offered by the spinner. Order is presentation order. */
export type Mode =
  | 'General Prompt'
  | 'Location Prompt'
  | 'Story Starter'
  | 'Opening Frame'
  | 'Character'
  | 'Context'
  | 'Relationship'
  | 'Detail'
  | 'Action'
  | 'Tension'
  | 'Change'
  | 'Sound Into Image'
  | 'Before and After'
  | 'Portrait'
  | 'Sequence'
  | 'Closing Frame'
  | 'Reflection'
  | 'Constraint Challenge';

/** Optional place types the user can attach to a location. */
export type PlaceType =
  | 'Neighbourhood'
  | 'Market'
  | 'Home'
  | 'School'
  | 'Workplace'
  | 'Transport hub'
  | 'Street'
  | 'Rural area'
  | 'Waterfront'
  | 'Public institution'
  | 'Religious space'
  | 'Event'
  | 'Landscape'
  | 'Community centre'
  | 'Health facility'
  | 'Unknown or mixed';

/** Difficulty labels are colour-independent status words. */
export type Difficulty = 'Gentle' | 'Focused' | 'Challenging';

/** Progress status for a saved prompt within a story. */
export type PromptStatus =
  | 'Not started'
  | 'Observed'
  | 'Photographed'
  | 'Needs another attempt'
  | 'Complete';

/**
 * The component vector records which vocabulary entry was chosen for each
 * meaningful dimension. It powers both the exact fingerprint (identity) and
 * the "at least three components changed" freshness rule.
 */
export interface ComponentVector {
  template: string;
  [dimension: string]: string;
}

/** A generated prompt. Text fields are plain strings (never HTML). */
export interface Prompt {
  id: string;
  /** Stable identity string used to detect exact repeats. */
  fingerprint: string;
  /** The dimension→value map used for the "3 components changed" rule. */
  components: ComponentVector;
  mode: Mode;
  title: string;
  assignment: string;
  why: string;
  variation: string;
  reflection: string;
  role: string;
  difficulty: Difficulty;
  time: string;
  ethics?: string;
  location?: string;
  placeType?: PlaceType;
  storyStage?: string;
  createdAt: string;
}

/** A prompt saved into a story, with field-work state attached. */
export interface SavedPrompt extends Prompt {
  status: PromptStatus;
  notes: string;
  noteUpdatedAt?: string;
  noteTags?: string[];
  /** Optional locally stored thumbnail as a data URL. Never uploaded. */
  thumbnail?: string;
}

/** A developing photo story. */
export interface Story {
  id: string;
  title: string;
  location: string;
  placeType?: PlaceType;
  question: string;
  theme: string;
  contextTags: string[];
  prompts: SavedPrompt[];
  /** Ordered list of stage names the story is working through. */
  stages: string[];
  /** Index of the next suggested stage within `stages`. */
  stage: number;
  reflection: string;
  createdAt: string;
  updatedAt: string;
}

/** Small preferences kept in localStorage. */
export interface Preferences {
  location: string;
  placeType: PlaceType | '';
  contextTags: string[];
  mode: Mode;
  ethicsReminders: boolean;
  highContrast: boolean;
  textSize: 'default' | 'large' | 'x-large';
  reducedMotion: 'system' | 'on' | 'off';
  locationHistory: boolean;
  analytics: boolean;
  language: string;
}

/** The versioned backup envelope. */
export interface Backup {
  application: 'PhotoCue';
  applicationVersion: string;
  backupFormatVersion: number;
  exportDate: string;
  stories: Story[];
  promptHistory: Prompt[];
  customTags: string[];
  settings: Partial<Preferences>;
  /** Only present in device-local backups, stripped from shared exports. */
  installationSeed?: string;
}
