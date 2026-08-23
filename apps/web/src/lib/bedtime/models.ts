export type StoryMode = "single" | "series" | "infinite";

export type CharacterRole = "hero" | "companion" | "villain" | "sidekick" | "guide";

export type BeatKind =
  | "scene"
  | "ambience"
  | "narration"
  | "dialogue"
  | "sfx"
  | "pause"
  | "choice"
  | "wind_down";

export type ScriptBeat = {
  id: string;
  kind: BeatKind;
  speaker?: string;
  text?: string;
  emotion?: string;
  delivery?: string;
  pauseAfterMs?: number;
  location?: string;
  timeOfDay?: string;
  sfx?: string;
  ambience?: string;
  /** Only play this beat if this choice id was selected (undefined = always). */
  branch?: string;
  options?: { id: string; label: string }[];
};

export type StoryScript = {
  title: string;
  version: 1;
  beats: ScriptBeat[];
  voices: Record<string, string>;
};

export type EpisodePlan = {
  type: "adventure" | "mystery" | "comedy" | "quest" | "gentle";
  opening: string;
  problem: string;
  escalation: string;
  choice: string;
  climax: string;
  resolution: string;
  windDown: string;
  universeChange: string;
  hook?: string;
  primitives: string[];
  targetWords: number;
  dialogueTarget: string;
};

export type CharacterDef = {
  id?: string;
  name: string;
  role: CharacterRole;
  appearance: string;
  personality: string;
  strengths: string;
  flaws: string;
  speechStyle: string;
  catchphrase: string;
  fears: string;
  voiceId: string;
};

export type ChildProfile = {
  id: string;
  name: string;
  age: number;
  interests: string;
  humorStyle: string;
  defaultDurationMin: number;
  dislikes: string;
  vocabularyLevel: string;
};

export type World = {
  id: string;
  childId: string;
  title: string;
  mode: StoryMode;
  plannedChapters: number | null;
  durationMin: number;
  moodFunny: number;
  moodAdventure: number;
  moodMystery: number;
  premise: string;
  setting: string;
  parentObjectives: string;
  parentAvoids: string;
  nextEpisode: number;
  lastSummary: string;
  lastHook: string;
};

export type WorldState = {
  worldId: string;
  locations: string[];
  possessions: string[];
  relationships: string[];
  unresolvedMysteries: string[];
  runningJokes: string[];
  promises: string[];
  activeArcs: { id: string; title: string; startedEpisode: number; expectedLength: string; status: string }[];
  canonFacts: string[];
  episodeTypeHistory: string[];
};

export type CreateStoryInput = {
  childName: string;
  childAge: number;
  childId?: string;
  interests: string;
  premise: string;
  setting: string;
  mode: StoryMode;
  plannedChapters: number;
  durationMin: number;
  moodFunny: number;
  moodAdventure: number;
  moodMystery: number;
  parentObjectives: string;
  parentAvoids: string;
  companion: CharacterDef;
  villain?: CharacterDef;
  worldId?: string;
};

export const DURATION_OPTIONS = [3, 5, 10, 15, 20] as const;

export const PARENT_OBJECTIVES = [
  { id: "friendship", label: "Friendship" },
  { id: "losing", label: "Losing gracefully" },
  { id: "sharing", label: "Sharing" },
  { id: "courage", label: "Courage" },
  { id: "patience", label: "Patience" },
  { id: "curiosity", label: "Curiosity" },
  { id: "kindness", label: "Kindness" },
  { id: "honesty", label: "Honesty" },
  { id: "bedtime", label: "Calm bedtime" },
  { id: "numbers", label: "Playful numbers" },
] as const;
