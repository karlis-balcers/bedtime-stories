import { newId, pick } from "./utils";
import type { CharacterDef, CreateStoryInput, EpisodePlan, ScriptBeat, StoryScript, WorldState } from "./models";
import { targetWordsForDuration, windDownMinutes } from "./duration";
import { characterBlurb } from "./dice";
import { OPENINGS, PLOTS, RIDDLES, TWISTS, WIND_DOWNS, ageFilter } from "./primitives";

export function buildPlan(input: CreateStoryInput, state?: WorldState | null, episodeNumber = 1): EpisodePlan {
  const targetWords = targetWordsForDuration(input.durationMin);
  const type =
    input.moodMystery >= 4 ? "mystery" : input.moodFunny >= 4 ? "comedy" : input.moodAdventure >= 4 ? "quest" : "gentle";

  const plot = pick(ageFilter(PLOTS, input.childAge));
  const twist = pick(ageFilter(TWISTS, input.childAge));
  const opening = pick(ageFilter(OPENINGS, input.childAge));
  const riddle = pick(ageFilter(RIDDLES, input.childAge));
  const wind = pick(WIND_DOWNS);

  const hook = state?.unresolvedMysteries[0];
  const problem = hook
    ? `Continue the thread: ${hook}`
    : input.premise || "A small problem appears at bedtime and grows just large enough.";

  return {
    type,
    opening: opening.text,
    problem,
    escalation: plot.text,
    choice: "three paths, one clearly labelled as a bad idea, one smelling of food, one that is the true adventure",
    climax: twist.text,
    resolution: "the problem is solved in a way the child could retell tomorrow",
    windDown: wind.text,
    universeChange: "one small fact about the world is now permanently true",
    hook: episodeNumber > 0 ? "leave one gentle unanswered thread" : undefined,
    primitives: [opening.id, plot.id, twist.id, riddle.id, wind.id],
    targetWords,
    dialogueTarget: "35-45%",
  };
}

export function directorPrompt(
  input: CreateStoryInput,
  plan: EpisodePlan,
  characters: CharacterDef[],
  state?: WorldState | null,
  episodeNumber = 1,
): string {
  const windMins = windDownMinutes(input.durationMin);
  const hero = input.childName;
  const canon = state
    ? JSON.stringify(
        {
          locations: state.locations,
          possessions: state.possessions,
          mysteries: state.unresolvedMysteries,
          jokes: state.runningJokes,
          facts: state.canonFacts,
          arcs: state.activeArcs,
        },
        null,
        2,
      )
    : "(new world)";

  return `You are the Story Director for Moonlit, an audio-first bedtime story product.
Write ONE episode as structured JSON. The story has a rich internal performance representation; text and audio are later renderings of it.

Return ONLY valid JSON matching this shape:
{
  "title": string,
  "parentSummary": string,
  "universeChange": string,
  "hook": string,
  "canonFacts": string[],
  "newLocations": string[],
  "newPossessions": string[],
  "voices": { "NARRATOR": "eve", "<NAME>": "leo|rex|ara|sal|eve" },
  "beats": [
    {
      "kind": "scene"|"ambience"|"narration"|"dialogue"|"sfx"|"pause"|"choice"|"wind_down",
      "speaker": string,
      "text": string,
      "emotion": string,
      "delivery": string,
      "pauseAfterMs": number,
      "location": string,
      "timeOfDay": string,
      "sfx": string,
      "ambience": string,
      "branch": string,
      "options": [{ "id": string, "label": string }]
    }
  ]
}

HARD RULES
- Target about ${plan.targetWords} spoken words across narration+dialogue (not stage directions).
- Child hero is ${hero}, age ${input.childAge}. Vocabulary: age-typical, concrete, no gore, no romance, no horror.
- Interests: ${input.interests || "playful adventure"}
- Setting: ${input.setting}
- Premise: ${input.premise}
- Mood funny=${input.moodFunny}/5 adventure=${input.moodAdventure}/5 mystery=${input.moodMystery}/5
- Parent objectives (weave in, never lecture): ${input.parentObjectives || "kindness, calm bedtime"}
- Avoid: ${input.parentAvoids || "jump scares, mean teasing"}
- Mode: ${input.mode}${input.mode === "series" ? ` (chapter ${episodeNumber} of ${input.plannedChapters})` : input.mode === "infinite" ? ` (episode ${episodeNumber} of an ongoing series — self-contained ending, continuity persists)` : " (one self-contained story)"}
- Dialogue should be roughly ${plan.dialogueTarget} of spoken words.
- Include EXACTLY one interactive choice beat in the first two-thirds, with 3 short options (ids a, b, c). After the choice, provide branched beats using "branch": "a"|"b"|"c" for 2–4 beats each, then merge back to unbranched climax.
- Final ${windMins} minutes of content must be kind "wind_down" or calm narration: longer sentences, fewer jokes, no new choices, sleepy cadence.
- Never put [PAUSE], [SFX], ElevenLabs markup, or internal ids in spoken text. Those belong in fields (pauseAfterMs, sfx, delivery).
- Spoken text should work as a book when quotes are added around dialogue.
- Characters (authoritative):
${characters.map((c) => "- " + characterBlurb(c)).join("\n")}
- Persistent world (canon only — do not invent contradictions; disposable details stay disposable):
${canon}

EPISODE PLAN (follow this arc)
${JSON.stringify(plan, null, 2)}

Start with a scene beat, then ambience, then the opening. End with wind_down and a quiet close.`;
}

type Generated = {
  title: string;
  parentSummary: string;
  universeChange: string;
  hook: string;
  canonFacts: string[];
  newLocations: string[];
  newPossessions: string[];
  voices: Record<string, string>;
  beats: ScriptBeat[];
};

export function normalizeGenerated(raw: unknown, fallbackTitle: string): Generated {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const beatsIn = Array.isArray(obj.beats) ? obj.beats : [];
  const beats: ScriptBeat[] = beatsIn.map((b, i) => {
    const beat = (b && typeof b === "object" ? b : {}) as Record<string, unknown>;
    const kind = String(beat.kind ?? "narration") as ScriptBeat["kind"];
    return {
      id: typeof beat.id === "string" ? beat.id : newId("b"),
      kind: [
        "scene",
        "ambience",
        "narration",
        "dialogue",
        "sfx",
        "pause",
        "choice",
        "wind_down",
      ].includes(kind)
        ? kind
        : "narration",
      speaker: beat.speaker ? String(beat.speaker) : undefined,
      text: beat.text ? String(beat.text) : undefined,
      emotion: beat.emotion ? String(beat.emotion) : undefined,
      delivery: beat.delivery ? String(beat.delivery) : undefined,
      pauseAfterMs: typeof beat.pauseAfterMs === "number" ? beat.pauseAfterMs : undefined,
      location: beat.location ? String(beat.location) : undefined,
      timeOfDay: beat.timeOfDay ? String(beat.timeOfDay) : undefined,
      sfx: beat.sfx ? String(beat.sfx) : undefined,
      ambience: beat.ambience ? String(beat.ambience) : undefined,
      branch: beat.branch ? String(beat.branch) : undefined,
      options: Array.isArray(beat.options)
        ? beat.options
            .map((o) => {
              const opt = (o && typeof o === "object" ? o : {}) as Record<string, unknown>;
              return { id: String(opt.id ?? ""), label: String(opt.label ?? "") };
            })
            .filter((o) => o.id && o.label)
        : undefined,
    };
  });

  if (!beats.length) {
    throw new Error("empty-script");
  }

  // Ensure every beat has an id
  beats.forEach((b, i) => {
    if (!b.id) b.id = `b${i}`;
  });

  const voicesRaw = (obj.voices && typeof obj.voices === "object" ? obj.voices : {}) as Record<string, unknown>;
  const voices: Record<string, string> = { NARRATOR: "eve" };
  for (const [k, v] of Object.entries(voicesRaw)) voices[k] = String(v);

  return {
    title: String(obj.title || fallbackTitle),
    parentSummary: String(obj.parentSummary || ""),
    universeChange: String(obj.universeChange || ""),
    hook: String(obj.hook || ""),
    canonFacts: Array.isArray(obj.canonFacts) ? obj.canonFacts.map(String) : [],
    newLocations: Array.isArray(obj.newLocations) ? obj.newLocations.map(String) : [],
    newPossessions: Array.isArray(obj.newPossessions) ? obj.newPossessions.map(String) : [],
    voices,
    beats,
  };
}

export function toScript(gen: Generated): StoryScript {
  return { title: gen.title, version: 1, beats: gen.beats, voices: gen.voices };
}

/** Local composer used when the LLM is unavailable. Still a real story from primitives. */
export function composeFallback(
  input: CreateStoryInput,
  plan: EpisodePlan,
  characters: CharacterDef[],
  episodeNumber: number,
): Generated {
  const hero = input.childName;
  const companion = characters.find((c) => c.role === "companion" || c.role === "sidekick") ?? characters[0];
  const villain = characters.find((c) => c.role === "villain");
  const setting = input.setting || "an enchanted forest";
  const companionName = companion?.name ?? "Pip";
  const villainName = villain?.name ?? "Count Crumb";
  const catchphrase = companion?.catchphrase ?? "I definitely wasn't scared.";
  const fear = companion?.fears ?? "butterflies";
  const artifact = "a golden key that only opens doors you are ready for";

  const beats: ScriptBeat[] = [];
  const add = (partial: Omit<ScriptBeat, "id">) => beats.push({ id: newId("b"), ...partial });

  add({ kind: "scene", location: setting, timeOfDay: "night" });
  add({ kind: "ambience", ambience: "quiet night, distant crickets, a far lamp" });
  add({
    kind: "narration",
    speaker: "NARRATOR",
    text: plan.opening,
    emotion: "quiet",
    pauseAfterMs: 600,
  });
  add({
    kind: "narration",
    speaker: "NARRATOR",
    text: `${hero} stood at the edge of ${setting}, with ${companionName} close enough that their sleeves almost touched. Tonight the problem was simple, and then it wasn't: ${input.premise || plan.problem}`,
    pauseAfterMs: 500,
  });
  add({
    kind: "dialogue",
    speaker: companionName,
    text: `Did you hear that?`,
    delivery: "whispering",
    emotion: "nervous",
    pauseAfterMs: 400,
  });
  add({ kind: "sfx", sfx: "a branch snaps somewhere behind them" });
  add({
    kind: "dialogue",
    speaker: companionName,
    text: `Hear what?! ${catchphrase}`,
    emotion: "startled",
    pauseAfterMs: 400,
  });
  add({
    kind: "narration",
    speaker: "NARRATOR",
    text: `They found ${artifact} lying in the grass as if it had been waiting. ${hero} picked it up. It was warmer than a key should be.`,
  });
  if (villain) {
    add({
      kind: "narration",
      speaker: "NARRATOR",
      text: `From the shadows came ${villainName}, who wanted the key for reasons that sounded important and were probably not.`,
    });
    add({
      kind: "dialogue",
      speaker: villainName,
      text: `That key is mine. I was only borrowing the night.`,
      emotion: "dramatic",
    });
  }
  add({
    kind: "narration",
    speaker: "NARRATOR",
    text: `${hero} and ${companionName} walked until the path split into three. One smelled like toasted bread. One sounded like a hundred tiny drums. The third had a sign that read ABSOLUTELY NOT A SECRET DOOR.`,
  });
  add({
    kind: "choice",
    text: "Which path should we take?",
    options: [
      { id: "a", label: "The path that smells like bread" },
      { id: "b", label: "The path with tiny drums" },
      { id: "c", label: "The door labelled ABSOLUTELY NOT" },
    ],
  });
  add({
    kind: "narration",
    branch: "a",
    speaker: "NARRATOR",
    text: `The bread path led to a small kitchen carved into a hill. A kettle was already on. Someone had expected company.`,
  });
  add({
    kind: "dialogue",
    branch: "a",
    speaker: companionName,
    text: `Soup first. Adventure second. That is a rule I just invented.`,
  });
  add({
    kind: "narration",
    branch: "b",
    speaker: "NARRATOR",
    text: `The drums were rain on a tin roof, and under the roof a map was drying. It showed ${setting} — and a mark where ${hero} was already standing.`,
  });
  add({
    kind: "dialogue",
    branch: "b",
    speaker: companionName,
    text: `Maps don't lie. People fold them wrong.`,
  });
  add({
    kind: "narration",
    branch: "c",
    speaker: "NARRATOR",
    text: `The ABSOLUTELY NOT door opened anyway, because doors like that always do when you are brave enough to knock politely.`,
  });
  add({
    kind: "dialogue",
    branch: "c",
    speaker: companionName,
    text: `That is a suspicious door. I like it.`,
  });
  add({
    kind: "narration",
    speaker: "NARRATOR",
    text: `Beyond every path was the same quiet room: a lantern, a lost object, and a choice that was not about winning. ${plan.climax} ${hero} held out the key. ${villainName} hesitated, then sat down, smaller than a villain ought to look.`,
  });
  add({
    kind: "dialogue",
    speaker: hero,
    text: `You can have help. You cannot have the whole night.`,
  });
  add({
    kind: "narration",
    speaker: "NARRATOR",
    text: `${companionName} admitted, very quietly, to being afraid of ${fear}. ${hero} did not laugh. That was the important part.`,
    pauseAfterMs: 800,
  });
  add({
    kind: "wind_down",
    speaker: "NARRATOR",
    text: `The lantern dimmed by itself. ${setting.replace(/^an? /, "The ")} tucked its sounds away. ${companionName} yawned a sentence that never quite finished.`,
    delivery: "slow",
  });
  add({
    kind: "wind_down",
    speaker: "NARRATOR",
    text: `${hero} walked home with one new true thing: the key would wait until morning. Outside, the stars thought their quiet thoughts, and the night, at last, was enough.`,
    delivery: "slow",
    pauseAfterMs: 1200,
  });

  const title =
    input.mode === "single"
      ? `${hero} and the Warm Key`
      : `Episode ${episodeNumber}: The Warm Key`;

  return {
    title,
    parentSummary: `Tonight ${hero} practiced ${input.parentObjectives || "kindness"} in ${setting}. They faced a choice, helped ${villainName} without giving everything away, and wound down toward sleep.`,
    universeChange: `${companionName} admitted a fear of ${fear}, which is now canon.`,
    hook: `The key is still warm. Nobody has asked what it opens at sunrise.`,
    canonFacts: [`${companionName} is afraid of ${fear}.`, `The warm key belongs with ${hero} for now.`],
    newLocations: [setting],
    newPossessions: ["a warm golden key"],
    voices: {
      NARRATOR: "eve",
      [hero]: "ara",
      [companionName]: companion?.voiceId ?? "leo",
      [villainName]: "rex",
    },
    beats,
  };
}
