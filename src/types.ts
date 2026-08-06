export type Mode='General Prompt'|'Location Prompt'|'Story Starter'|'Opening Frame'|'Character'|'Context'|'Relationship'|'Detail'|'Action'|'Tension'|'Change'|'Sound Into Image'|'Before and After'|'Portrait'|'Sequence'|'Closing Frame'|'Reflection'|'Constraint Challenge';
export type Prompt={id:string;fingerprint:string;mode:Mode;title:string;assignment:string;why:string;variation:string;reflection:string;role:string;difficulty:string;time:string;ethics?:string;components:string[];createdAt:string};
export type SavedPrompt=Prompt&{status:'Not started'|'Observed'|'Photographed'|'Needs another attempt'|'Complete';notes:string};
export type Story={id:string;title:string;location:string;question:string;theme:string;prompts:SavedPrompt[];stage:number};
