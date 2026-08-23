import type { CharacterRole } from "./models";

export type Primitive = {
  id: string;
  kind:
    | "setting"
    | "premise"
    | "name"
    | "villain"
    | "sidekick"
    | "artifact"
    | "opening"
    | "style"
    | "twist"
    | "joke"
    | "plot"
    | "riddle"
    | "wind_down"
    | "archetype";
  text: string;
  tags: string[];
  ageMin: number;
  ageMax: number;
};

export const NAMES = [
  "Bongo", "Pip", "Nettle", "Lumen", "Miso", "Taro", "Wren", "Cinder",
  "Pebble", "Moss", "Juno", "Fig", "Oat", "Maple", "Nix", "Bramble",
  "Sable", "Ivy", "Quill", "Dusk", "Harbor", "Nim", "Kettle", "Rue",
  "Ashby", "Lark", "Thistle", "Moth", "Cove", "Pepper",
];

export const SETTINGS: Primitive[] = [
  { id: "s1", kind: "setting", text: "a pirate island with a bakery instead of a tavern", tags: ["sea", "funny"], ageMin: 4, ageMax: 10 },
  { id: "s2", kind: "setting", text: "a Minecraft-like block world with Roman aqueducts running through it", tags: ["minecraft", "rome"], ageMin: 6, ageMax: 12 },
  { id: "s3", kind: "setting", text: "an enchanted forest that rearranges itself after midnight", tags: ["forest", "magic"], ageMin: 4, ageMax: 10 },
  { id: "s4", kind: "setting", text: "a space station library that orbits a sleeping planet", tags: ["space", "quiet"], ageMin: 5, ageMax: 12 },
  { id: "s5", kind: "setting", text: "a floating village of lantern boats", tags: ["water", "gentle"], ageMin: 4, ageMax: 10 },
  { id: "s6", kind: "setting", text: "an underground city of polite moles and lost socks", tags: ["funny", "city"], ageMin: 4, ageMax: 9 },
  { id: "s7", kind: "setting", text: "ancient Rome, but the Colosseum is a puzzle arena", tags: ["rome", "adventure"], ageMin: 6, ageMax: 12 },
  { id: "s8", kind: "setting", text: "a clockwork mountain that ticks once a year", tags: ["mystery", "machine"], ageMin: 6, ageMax: 12 },
  { id: "s9", kind: "setting", text: "a quiet lighthouse on a sea of clouds", tags: ["gentle", "sky"], ageMin: 4, ageMax: 10 },
  { id: "s10", kind: "setting", text: "a candy desert where dunes are toasted marshmallow", tags: ["funny", "food"], ageMin: 4, ageMax: 8 },
  { id: "s11", kind: "setting", text: "a hidden door beneath a castle kitchen", tags: ["castle", "mystery"], ageMin: 5, ageMax: 11 },
  { id: "s12", kind: "setting", text: "a coral city that only appears at low tide", tags: ["sea", "mystery"], ageMin: 5, ageMax: 11 },
];

export const PREMISES: Primitive[] = [
  { id: "p1", kind: "premise", text: "A tiny dragon accidentally becomes mayor of a village.", tags: ["funny", "dragon"], ageMin: 4, ageMax: 10 },
  { id: "p2", kind: "premise", text: "The last star in the sky goes missing, and someone has to walk it home.", tags: ["gentle", "quest"], ageMin: 4, ageMax: 10 },
  { id: "p3", kind: "premise", text: "A talking chicken steals a golden key and refuses to explain why.", tags: ["funny", "mystery"], ageMin: 5, ageMax: 11 },
  { id: "p4", kind: "premise", text: "The library books start rewriting themselves overnight.", tags: ["mystery", "books"], ageMin: 6, ageMax: 12 },
  { id: "p5", kind: "premise", text: "A shy troll opens a soup shop that accidentally grants wishes.", tags: ["funny", "kindness"], ageMin: 4, ageMax: 10 },
  { id: "p6", kind: "premise", text: "Someone has to return a borrowed moon before sunrise.", tags: ["gentle", "time"], ageMin: 4, ageMax: 9 },
  { id: "p7", kind: "premise", text: "A map is found inside a loaf of bread.", tags: ["adventure", "funny"], ageMin: 5, ageMax: 11 },
  { id: "p8", kind: "premise", text: "The village well starts telling riddles instead of giving water.", tags: ["riddle", "mystery"], ageMin: 6, ageMax: 12 },
  { id: "p9", kind: "premise", text: "A skeleton musician needs a new trumpet before the night parade.", tags: ["minecraft", "funny"], ageMin: 6, ageMax: 11 },
  { id: "p10", kind: "premise", text: "Two rival explorers must share one pair of boots.", tags: ["friendship", "funny"], ageMin: 5, ageMax: 10 },
];

export const STYLES: Primitive[] = [
  { id: "st1", kind: "style", text: "funny and slightly absurd", tags: ["funny"], ageMin: 4, ageMax: 12 },
  { id: "st2", kind: "style", text: "quiet, mysterious, and cozy", tags: ["mystery", "gentle"], ageMin: 4, ageMax: 12 },
  { id: "st3", kind: "style", text: "adventurous with a soft landing", tags: ["adventure"], ageMin: 5, ageMax: 12 },
  { id: "st4", kind: "style", text: "calm bedtime, long sentences, warm voices", tags: ["gentle", "bedtime"], ageMin: 3, ageMax: 8 },
  { id: "st5", kind: "style", text: "educational without lecturing", tags: ["learn"], ageMin: 6, ageMax: 12 },
  { id: "st6", kind: "style", text: "silly running gags and wordplay", tags: ["funny"], ageMin: 4, ageMax: 9 },
];

export const TWISTS: Primitive[] = [
  { id: "t1", kind: "twist", text: "The villain was trying to return something they borrowed.", tags: ["kindness"], ageMin: 5, ageMax: 12 },
  { id: "t2", kind: "twist", text: "The treasure was a song nobody remembered how to finish.", tags: ["gentle"], ageMin: 4, ageMax: 10 },
  { id: "t3", kind: "twist", text: "The monster is afraid of the hero.", tags: ["funny"], ageMin: 4, ageMax: 9 },
  { id: "t4", kind: "twist", text: "The map was drawn from the wrong end.", tags: ["funny"], ageMin: 6, ageMax: 12 },
  { id: "t5", kind: "twist", text: "The missing object was in the hero's pocket the whole time — but it had changed.", tags: ["mystery"], ageMin: 5, ageMax: 11 },
];

export const ARTIFACTS: Primitive[] = [
  { id: "a1", kind: "artifact", text: "a compass that points to whatever you forgot", tags: ["mystery"], ageMin: 5, ageMax: 12 },
  { id: "a2", kind: "artifact", text: "a wooden spoon that stirs true stories into soup", tags: ["funny", "food"], ageMin: 4, ageMax: 9 },
  { id: "a3", kind: "artifact", text: "a golden key that only opens doors you are ready for", tags: ["quest"], ageMin: 5, ageMax: 11 },
  { id: "a4", kind: "artifact", text: "a lantern that glows when someone tells the truth", tags: ["honesty"], ageMin: 5, ageMax: 11 },
  { id: "a5", kind: "artifact", text: "a pocket-sized moon that snores", tags: ["gentle", "funny"], ageMin: 4, ageMax: 8 },
  { id: "a6", kind: "artifact", text: "a pair of boots that always take one extra step", tags: ["adventure"], ageMin: 5, ageMax: 10 },
];

export const OPENINGS: Primitive[] = [
  { id: "o1", kind: "opening", text: "The night was so quiet you could hear the stars thinking.", tags: ["gentle"], ageMin: 4, ageMax: 12 },
  { id: "o2", kind: "opening", text: "Someone knocked on the wrong door, which turned out to be the right one.", tags: ["funny"], ageMin: 4, ageMax: 10 },
  { id: "o3", kind: "opening", text: "The map arrived folded inside a sandwich.", tags: ["funny", "adventure"], ageMin: 5, ageMax: 11 },
  { id: "o4", kind: "opening", text: "A lantern blinked twice, which in this village meant 'adventure, but politely'.", tags: ["adventure"], ageMin: 5, ageMax: 11 },
  { id: "o5", kind: "opening", text: "The last page of yesterday's story was still warm.", tags: ["series"], ageMin: 4, ageMax: 12 },
];

export const VILLAINS: Primitive[] = [
  { id: "v1", kind: "villain", text: "Count Crumb, a dramatic magpie who collects shiny rules", tags: ["funny"], ageMin: 4, ageMax: 9 },
  { id: "v2", kind: "villain", text: "The Quiet Thief, who steals only unfinished sentences", tags: ["mystery"], ageMin: 6, ageMax: 12 },
  { id: "v3", kind: "villain", text: "Empress Static, a radio ghost who hates bedtime", tags: ["adventure"], ageMin: 6, ageMax: 11 },
  { id: "v4", kind: "villain", text: "Sir Snooze, a knight who accidentally puts entire towns to sleep at noon", tags: ["funny"], ageMin: 5, ageMax: 10 },
  { id: "v5", kind: "villain", text: "The Hollow Crown, a hat that wants to be king", tags: ["mystery"], ageMin: 6, ageMax: 12 },
];

export const SIDEKICKS: Primitive[] = [
  { id: "k1", kind: "sidekick", text: "Max the talking chicken, loyal, loud, and terrible at secrets", tags: ["funny"], ageMin: 4, ageMax: 10 },
  { id: "k2", kind: "sidekick", text: "Nim the pocket fox, who narrates everything in whispers", tags: ["gentle"], ageMin: 4, ageMax: 9 },
  { id: "k3", kind: "sidekick", text: "Brick, a polite golem who apologizes to furniture", tags: ["minecraft", "funny"], ageMin: 6, ageMax: 11 },
  { id: "k4", kind: "sidekick", text: "Lumen, a moth who reads maps by sitting on them", tags: ["gentle"], ageMin: 4, ageMax: 10 },
  { id: "k5", kind: "sidekick", text: "Harbor, a tiny whale who swims through fog", tags: ["sea"], ageMin: 4, ageMax: 10 },
];

export const JOKES: Primitive[] = [
  { id: "j1", kind: "joke", text: "running gag: someone keeps offering soup at the worst possible moment", tags: ["funny", "food"], ageMin: 4, ageMax: 10 },
  { id: "j2", kind: "joke", text: "running gag: a sign that always says the opposite of what it should", tags: ["funny"], ageMin: 5, ageMax: 11 },
  { id: "j3", kind: "joke", text: "callback: the chicken insists the key is 'absolutely not golden'", tags: ["funny"], ageMin: 5, ageMax: 11 },
  { id: "j4", kind: "joke", text: "wordplay around 'night light' vs 'knight light'", tags: ["funny"], ageMin: 6, ageMax: 12 },
];

export const PLOTS: Primitive[] = [
  { id: "pl1", kind: "plot", text: "lost object mystery (3–5 minutes of searching, one red herring)", tags: ["mystery"], ageMin: 5, ageMax: 12 },
  { id: "pl2", kind: "plot", text: "three tunnels / three doors, one clearly labelled ABSOLUTELY NOT", tags: ["adventure", "choice"], ageMin: 5, ageMax: 11 },
  { id: "pl3", kind: "plot", text: "a contest that nobody can win alone", tags: ["friendship"], ageMin: 5, ageMax: 10 },
  { id: "pl4", kind: "plot", text: "a promise that must be kept after it becomes inconvenient", tags: ["honesty"], ageMin: 6, ageMax: 12 },
  { id: "pl5", kind: "plot", text: "a small kindness that accidentally starts a parade", tags: ["kindness", "funny"], ageMin: 4, ageMax: 9 },
];

export const RIDDLES: Primitive[] = [
  { id: "r1", kind: "riddle", text: "I have a face and two hands, but I never clap. What am I? (a clock)", tags: ["logic"], ageMin: 6, ageMax: 9 },
  { id: "r2", kind: "riddle", text: "The more you take, the more you leave behind. What are they? (footsteps)", tags: ["logic"], ageMin: 6, ageMax: 10 },
  { id: "r3", kind: "riddle", text: "What has cities but no houses, rivers but no water? (a map)", tags: ["logic"], ageMin: 6, ageMax: 10 },
];

export const WIND_DOWNS: Primitive[] = [
  { id: "w1", kind: "wind_down", text: "slow the dialogue, lengthen sentences, dim the adventure, breathe with the night", tags: ["bedtime"], ageMin: 3, ageMax: 12 },
  { id: "w2", kind: "wind_down", text: "characters find a safe place, share one quiet thought, and the world tucks itself in", tags: ["bedtime"], ageMin: 3, ageMax: 12 },
];

export type Archetype = {
  appearance: string[];
  personality: string[];
  strengths: string[];
  flaws: string[];
  speech: string[];
  fears: string[];
  catchphrases: string[];
  roles: CharacterRole[];
};

export const ARCHETYPE: Archetype = {
  appearance: [
    "a nervous blue troll in a too-small chef's hat",
    "a small fox with a patched ear and a lantern on a string",
    "a moth-winged child in a coat made of maps",
    "a polite skeleton in a knitted scarf",
    "a round dragon no bigger than a teapot",
    "a mole in round spectacles and a library badge",
    "a chicken in a tiny explorer's vest",
    "a golem assembled from river stones and kindness",
  ],
  personality: [
    "brave in theory, cautious in doorways",
    "cheerful, talkative, and slightly chaotic",
    "quietly loyal, notices everything",
    "dramatic, theatrical, secretly kind",
    "curious to a fault, asks too many questions",
    "gentle, stubborn about soup, hates rushing",
  ],
  strengths: [
    "makes friends with unlikely creatures",
    "remembers maps after seeing them once",
    "tells the truth even when it wobbles",
    "cooks courage into ordinary meals",
    "finds lost things by listening",
    "makes people laugh at the right moment",
  ],
  flaws: [
    "speaks too quickly when nervous",
    "cannot keep a secret for more than one minute",
    "collects shiny objects that are not theirs",
    "falls asleep standing up",
    "argues with signs",
    "is terrified of butterflies",
  ],
  speech: [
    "short sentences, then a blurted confession",
    "whispers as if the walls are eavesdropping",
    "overly formal, like a tiny professor",
    "sings the last word of every sentence",
    "uses food metaphors for everything",
  ],
  fears: [
    "butterflies",
    "squeaky floors",
    "being left out of the joke",
    "empty libraries",
    "the dark, but only on Tuesdays",
    "hats that are too ambitious",
  ],
  catchphrases: [
    "I definitely wasn't scared.",
    "Soup first. Adventure second.",
    "That is a suspicious door.",
    "If it sparkles, we should probably ask.",
    "Maps don't lie. People fold them wrong.",
    "We can be brave after the snack.",
  ],
  roles: ["companion", "sidekick", "hero", "guide"],
};

export const VOICES = ["eve", "leo", "rex", "ara", "sal"] as const;

export function ageFilter<T extends { ageMin: number; ageMax: number }>(list: T[], age: number): T[] {
  const hit = list.filter((p) => age >= p.ageMin && age <= p.ageMax);
  return hit.length ? hit : list;
}
