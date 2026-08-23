import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { newId } from "@/lib/utils";
import type {
  CharacterDef,
  ChildProfile,
  CreateStoryInput,
  StoryMode,
  StoryScript,
  WorldState,
} from "./models";
import { buildPlan, composeFallback, directorPrompt, normalizeGenerated, toScript } from "./compose";
import { renderBook, countScriptWords } from "./render-book";
import { beatToSpeech, defaultVoiceFor } from "./render-audio";
import { grokJson, synthesizeSpeech } from "./xai";
import { worldTitle } from "./dice";

function asJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

type WorldRow = {
  id: string;
  child_id: string;
  title: string;
  mode: StoryMode;
  planned_chapters: number | null;
  duration_min: number;
  mood_funny: number;
  mood_adventure: number;
  mood_mystery: number;
  premise: string;
  setting: string;
  parent_objectives: string;
  parent_avoids: string;
  next_episode: number;
  last_summary: string;
  last_hook: string;
  child_name: string;
  child_age: number;
  episode_count: number;
};

type EpisodeRow = {
  id: string;
  world_id: string;
  episode_number: number;
  title: string;
  status: string;
  duration_min: number;
  script: unknown;
  book_text: string;
  parent_summary: string;
  director_plan: unknown;
  word_count: number;
  chosen_options: unknown;
  created_at: string;
};

type CharacterRow = {
  id: string;
  world_id: string;
  name: string;
  role: string;
  appearance: string;
  personality: string;
  strengths: string;
  flaws: string;
  speech_style: string;
  catchphrase: string;
  fears: string;
  voice_id: string;
};

export const listChildren = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<ChildProfile & { id: string }>`
      select id, name, age, interests, humor_style as "humorStyle",
             default_duration_min as "defaultDurationMin", dislikes,
             vocabulary_level as "vocabularyLevel"
      from children where user_id = ${context.userId} order by created_at asc
    `;
  });

export const listWorlds = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<WorldRow>`
      select w.id, w.child_id, w.title, w.mode, w.planned_chapters, w.duration_min,
             w.mood_funny, w.mood_adventure, w.mood_mystery, w.premise, w.setting,
             w.parent_objectives, w.parent_avoids, w.next_episode, w.last_summary, w.last_hook,
             c.name as child_name, c.age as child_age,
             (select count(*)::int from episodes e where e.world_id = w.id) as episode_count
      from worlds w
      join children c on c.id = w.child_id
      where w.user_id = ${context.userId}
      order by w.created_at desc
    `;
  });

export const getWorld = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const worlds = await sql<WorldRow>`
      select w.id, w.child_id, w.title, w.mode, w.planned_chapters, w.duration_min,
             w.mood_funny, w.mood_adventure, w.mood_mystery, w.premise, w.setting,
             w.parent_objectives, w.parent_avoids, w.next_episode, w.last_summary, w.last_hook,
             c.name as child_name, c.age as child_age,
             (select count(*)::int from episodes e where e.world_id = w.id) as episode_count
      from worlds w
      join children c on c.id = w.child_id
      where w.id = ${id} and w.user_id = ${context.userId}
    `;
    const world = worlds[0];
    if (!world) return null;
    const characters = await sql<CharacterRow>`
      select id, world_id, name, role, appearance, personality, strengths, flaws,
             speech_style, catchphrase, fears, voice_id
      from characters where world_id = ${id} and user_id = ${context.userId} order by created_at
    `;
    const stateRows = await sql<{
      locations: unknown;
      possessions: unknown;
      relationships: unknown;
      unresolved_mysteries: unknown;
      running_jokes: unknown;
      promises: unknown;
      active_arcs: unknown;
      canon_facts: unknown;
      episode_type_history: unknown;
    }>`select locations, possessions, relationships, unresolved_mysteries, running_jokes, promises, active_arcs, canon_facts, episode_type_history from world_state where world_id = ${id} and user_id = ${context.userId}`;
    const s = stateRows[0];
    const episodes = await sql<Pick<EpisodeRow, "id" | "episode_number" | "title" | "parent_summary" | "created_at" | "duration_min" | "word_count">>`
      select id, episode_number, title, parent_summary, created_at, duration_min, word_count
      from episodes where world_id = ${id} and user_id = ${context.userId}
      order by episode_number desc
    `;
    const state: WorldState | null = s
      ? {
          worldId: id,
          locations: asJson(s.locations, []),
          possessions: asJson(s.possessions, []),
          relationships: asJson(s.relationships, []),
          unresolvedMysteries: asJson(s.unresolved_mysteries, []),
          runningJokes: asJson(s.running_jokes, []),
          promises: asJson(s.promises, []),
          activeArcs: asJson(s.active_arcs, []),
          canonFacts: asJson(s.canon_facts, []),
          episodeTypeHistory: asJson(s.episode_type_history, []),
        }
      : null;
    return { world, characters, state, episodes };
  });

export const getEpisode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const rows = await sql<EpisodeRow & { world_title: string; child_name: string }>`
      select e.id, e.world_id, e.episode_number, e.title, e.status, e.duration_min,
             e.script, e.book_text, e.parent_summary, e.director_plan, e.word_count,
             e.chosen_options, e.created_at, w.title as world_title, c.name as child_name
      from episodes e
      join worlds w on w.id = e.world_id
      join children c on c.id = w.child_id
      where e.id = ${id} and e.user_id = ${context.userId}
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      world_id: row.world_id,
      world_title: row.world_title,
      child_name: row.child_name,
      episode_number: row.episode_number,
      title: row.title,
      status: row.status,
      duration_min: row.duration_min,
      script: asJson<StoryScript>(row.script, { title: row.title, version: 1 as const, beats: [], voices: {} }),
      book_text: row.book_text,
      parent_summary: row.parent_summary,
      word_count: row.word_count,
      chosen_options: asJson<Record<string, string>>(row.chosen_options, {}),
      created_at: String(row.created_at),
    };
  });

export const createStory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: CreateStoryInput) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const userId = context.userId;

    let childId = data.childId;
    if (!childId) {
      childId = newId("ch");
      await sql`
        insert into children (id, user_id, name, age, interests, default_duration_min, dislikes)
        values (${childId}, ${userId}, ${data.childName.trim()}, ${data.childAge}, ${data.interests}, ${data.durationMin}, ${data.parentAvoids})
      `;
    } else {
      await sql`
        update children set name = ${data.childName.trim()}, age = ${data.childAge}, interests = ${data.interests}, default_duration_min = ${data.durationMin}
        where id = ${childId} and user_id = ${userId}
      `;
    }

    let worldId = data.worldId;
    let episodeNumber = 1;
    let existingState: WorldState | null = null;

    if (worldId) {
      const worlds = await sql<{ next_episode: number; title: string }>`
        select next_episode, title from worlds where id = ${worldId} and user_id = ${userId}
      `;
      const w = worlds[0];
      if (!w) throw new Error("World not found");
      episodeNumber = w.next_episode;
      const stateRows = await sql<{
        locations: unknown;
        possessions: unknown;
        unresolved_mysteries: unknown;
        running_jokes: unknown;
        canon_facts: unknown;
        active_arcs: unknown;
        relationships: unknown;
        promises: unknown;
        episode_type_history: unknown;
      }>`select locations, possessions, unresolved_mysteries, running_jokes, canon_facts, active_arcs, relationships, promises, episode_type_history from world_state where world_id = ${worldId}`;
      const s = stateRows[0];
      if (s) {
        existingState = {
          worldId,
          locations: asJson(s.locations, []),
          possessions: asJson(s.possessions, []),
          unresolvedMysteries: asJson(s.unresolved_mysteries, []),
          runningJokes: asJson(s.running_jokes, []),
          canonFacts: asJson(s.canon_facts, []),
          activeArcs: asJson(s.active_arcs, []),
          relationships: asJson(s.relationships, []),
          promises: asJson(s.promises, []),
          episodeTypeHistory: asJson(s.episode_type_history, []),
        };
      }
    } else {
      worldId = newId("w");
      const title = worldTitle(data.childName.trim(), data.setting, data.premise);
      await sql`
        insert into worlds (
          id, user_id, child_id, title, mode, planned_chapters, duration_min,
          mood_funny, mood_adventure, mood_mystery, premise, setting,
          parent_objectives, parent_avoids, next_episode
        ) values (
          ${worldId}, ${userId}, ${childId}, ${title}, ${data.mode},
          ${data.mode === "series" ? data.plannedChapters : null},
          ${data.durationMin}, ${data.moodFunny}, ${data.moodAdventure}, ${data.moodMystery},
          ${data.premise}, ${data.setting}, ${data.parentObjectives}, ${data.parentAvoids}, 1
        )
      `;
      await sql`
        insert into world_state (world_id, user_id) values (${worldId}, ${userId})
      `;

      const chars: CharacterDef[] = [
        {
          name: data.childName.trim(),
          role: "hero",
          appearance: `a child named ${data.childName.trim()}, age ${data.childAge}`,
          personality: "curious and kind",
          strengths: "notices when friends need help",
          flaws: "sometimes rushes",
          speechStyle: "plain and brave",
          catchphrase: "",
          fears: "",
          voiceId: "ara",
        },
        data.companion,
      ];
      if (data.villain) chars.push(data.villain);
      for (const c of chars) {
        const cid = newId("char");
        await sql`
          insert into characters (
            id, user_id, world_id, name, role, appearance, personality, strengths, flaws,
            speech_style, catchphrase, fears, voice_id
          ) values (
            ${cid}, ${userId}, ${worldId}, ${c.name}, ${c.role}, ${c.appearance}, ${c.personality},
            ${c.strengths}, ${c.flaws}, ${c.speechStyle}, ${c.catchphrase}, ${c.fears}, ${c.voiceId}
          )
        `;
      }
    }

    const charRows = await sql<CharacterRow>`
      select id, world_id, name, role, appearance, personality, strengths, flaws,
             speech_style, catchphrase, fears, voice_id
      from characters where world_id = ${worldId} and user_id = ${userId}
    `;
    const characters: CharacterDef[] = charRows.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role as CharacterDef["role"],
      appearance: c.appearance,
      personality: c.personality,
      strengths: c.strengths,
      flaws: c.flaws,
      speechStyle: c.speech_style,
      catchphrase: c.catchphrase,
      fears: c.fears,
      voiceId: c.voice_id,
    }));

    const plan = buildPlan(data, existingState, episodeNumber);
    const prompt = directorPrompt(data, plan, characters, existingState, episodeNumber);
    const ai = await grokJson(prompt, Math.min(5000, 1800 + data.durationMin * 180));

    let gen;
    let usedFallback = false;
    try {
      if (ai.ok) {
        gen = normalizeGenerated(ai.value, worldTitle(data.childName, data.setting, data.premise));
      } else {
        usedFallback = true;
        gen = composeFallback(data, plan, characters, episodeNumber);
      }
    } catch {
      usedFallback = true;
      gen = composeFallback(data, plan, characters, episodeNumber);
    }

    const script = toScript(gen);
    const book = renderBook(script);
    const words = countScriptWords(script);
    const episodeId = newId("ep");

    await sql.query(
      `insert into episodes (
        id, user_id, world_id, episode_number, title, status, duration_min,
        script, book_text, parent_summary, director_plan, word_count
      ) values ($1,$2,$3,$4,$5,'ready',$6,$7::jsonb,$8,$9,$10::jsonb,$11)`,
      [
        episodeId,
        userId,
        worldId,
        episodeNumber,
        gen.title,
        data.durationMin,
        JSON.stringify(script),
        book,
        gen.parentSummary,
        JSON.stringify(plan),
        words,
      ],
    );

    const nextEpisode = episodeNumber + 1;
    const facts = JSON.stringify(
      Array.from(new Set([...(existingState?.canonFacts ?? []), ...gen.canonFacts])).slice(0, 40),
    );
    const locations = JSON.stringify(
      Array.from(new Set([...(existingState?.locations ?? []), ...gen.newLocations])).slice(0, 30),
    );
    const possessions = JSON.stringify(
      Array.from(new Set([...(existingState?.possessions ?? []), ...gen.newPossessions])).slice(0, 30),
    );
    const mysteries = JSON.stringify(
      gen.hook ? [gen.hook, ...(existingState?.unresolvedMysteries ?? [])].slice(0, 12) : (existingState?.unresolvedMysteries ?? []),
    );
    const history = JSON.stringify(
      [...(existingState?.episodeTypeHistory ?? []), plan.type].slice(-20),
    );

    await sql.query(
      `update world_state
       set locations = $1::jsonb, possessions = $2::jsonb, unresolved_mysteries = $3::jsonb,
           canon_facts = $4::jsonb, episode_type_history = $5::jsonb, updated_at = now()
       where world_id = $6 and user_id = $7`,
      [locations, possessions, mysteries, facts, history, worldId, userId],
    );

    await sql`
      update worlds
      set next_episode = ${nextEpisode}, last_summary = ${gen.parentSummary}, last_hook = ${gen.hook}
      where id = ${worldId} and user_id = ${userId}
    `;

    return { worldId, episodeId, usedFallback, title: gen.title };
  });

export const saveChoice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { episodeId: string; choiceId: string; optionId: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ chosen_options: unknown }>`
      select chosen_options from episodes where id = ${data.episodeId} and user_id = ${context.userId}
    `;
    const current = asJson<Record<string, string>>(rows[0]?.chosen_options, {});
    current[data.choiceId] = data.optionId;
    await sql.query(
      `update episodes set chosen_options = $1::jsonb where id = $2 and user_id = $3`,
      [JSON.stringify(current), data.episodeId, context.userId],
    );
    return current;
  });

export const speakBeat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { episodeId: string; beatId: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ script: unknown; chosen_options: unknown }>`
      select script, chosen_options from episodes where id = ${data.episodeId} and user_id = ${context.userId}
    `;
    const row = rows[0];
    if (!row) return { ok: false as const, error: "Not found" };
    const script = asJson<StoryScript>(row.script, { title: "", version: 1, beats: [], voices: {} });
    const beat = script.beats.find((b) => b.id === data.beatId);
    if (!beat) return { ok: false as const, error: "Beat not found" };
    const speech = beatToSpeech(beat);
    if (!speech) return { ok: false as const, error: "Nothing to speak" };
    const voice = defaultVoiceFor(beat.speaker, script.voices);
    return synthesizeSpeech(speech, voice);
  });

export const listParentRecap = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{
      id: string;
      title: string;
      world_title: string;
      child_name: string;
      parent_summary: string;
      created_at: string;
      episode_number: number;
    }>`
      select e.id, e.title, w.title as world_title, c.name as child_name,
             e.parent_summary, e.created_at, e.episode_number
      from episodes e
      join worlds w on w.id = e.world_id
      join children c on c.id = w.child_id
      where e.user_id = ${context.userId}
      order by e.created_at desc
      limit 20
    `;
  });
