import { pick } from "@/lib/utils";
import type { CharacterDef, CharacterRole } from "./models";
import {
  ARCHETYPE,
  ARTIFACTS,
  JOKES,
  NAMES,
  OPENINGS,
  PREMISES,
  SETTINGS,
  SIDEKICKS,
  STYLES,
  TWISTS,
  VILLAINS,
  VOICES,
  ageFilter,
  type Primitive,
} from "./primitives";

export type DiceField =
  | "premise"
  | "setting"
  | "style"
  | "twist"
  | "joke"
  | "artifact"
  | "opening"
  | "villain"
  | "sidekick"
  | "name";

const FIELD_POOL: Record<Exclude<DiceField, "name">, Primitive[]> = {
  premise: PREMISES,
  setting: SETTINGS,
  style: STYLES,
  twist: TWISTS,
  joke: JOKES,
  artifact: ARTIFACTS,
  opening: OPENINGS,
  villain: VILLAINS,
  sidekick: SIDEKICKS,
};

export function rollField(field: DiceField, age = 7, exclude?: string): string {
  if (field === "name") {
    const names = NAMES.filter((n) => n !== exclude);
    return pick(names.length ? names : NAMES);
  }
  const pool = ageFilter(FIELD_POOL[field], age).filter((p) => p.text !== exclude);
  return pick(pool.length ? pool : FIELD_POOL[field]).text;
}

export type CharacterLocks = Partial<Record<keyof CharacterDef, boolean>>;

export function rollCharacter(
  role: CharacterRole = "companion",
  locked: Partial<CharacterDef> = {},
): CharacterDef {
  const name = locked.name ?? pick(NAMES);
  return {
    name,
    role: locked.role ?? role,
    appearance: locked.appearance ?? pick(ARCHETYPE.appearance),
    personality: locked.personality ?? pick(ARCHETYPE.personality),
    strengths: locked.strengths ?? pick(ARCHETYPE.strengths),
    flaws: locked.flaws ?? pick(ARCHETYPE.flaws),
    speechStyle: locked.speechStyle ?? pick(ARCHETYPE.speech),
    catchphrase: locked.catchphrase ?? pick(ARCHETYPE.catchphrases),
    fears: locked.fears ?? pick(ARCHETYPE.fears),
    voiceId: locked.voiceId ?? pick([...VOICES]),
  };
}

export function characterBlurb(c: CharacterDef): string {
  return `${c.name} — ${c.appearance}. ${c.personality}. Strength: ${c.strengths}. Flaw: ${c.flaws}. Speaks: ${c.speechStyle}. Catchphrase: “${c.catchphrase}”. Afraid of ${c.fears}.`;
}

export function worldTitle(childName: string, setting: string, premise: string): string {
  const settingBit = setting.split(",")[0]?.replace(/^an? /i, "") ?? "Adventures";
  const short = settingBit.replace(/\s+with.*$/i, "").trim();
  const possessive = childName.endsWith("s") ? `${childName}'` : `${childName}'s`;
  if (/minecraft/i.test(setting) && /rome|roman/i.test(setting + premise)) {
    return `${possessive} Roman Minecraft Adventures`;
  }
  return `${possessive} ${capitalize(short)}`;
}

function capitalize(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
