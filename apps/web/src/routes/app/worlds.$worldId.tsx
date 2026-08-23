import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createStory, getWorld } from "@/lib/bedtime/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { characterBlurb, rollCharacter } from "@/lib/bedtime/dice";
import type { CharacterDef } from "@/lib/bedtime/models";

export const Route = createFileRoute("/app/worlds/$worldId")({ component: WorldHub });

function WorldHub() {
  const { worldId } = Route.useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Awaited<ReturnType<typeof getWorld>> | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWorld({ data: worldId })
      .then(setData)
      .catch(() => setData(null));
  }, [worldId]);

  if (data === undefined) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-night-2" />
        <div className="mt-6 h-40 animate-pulse rounded-3xl bg-night-2" />
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-3xl">World not found</h1>
        <p className="mt-2 text-muted">It may belong to another account, or it was never created.</p>
      </main>
    );
  }

  const { world, characters, state, episodes } = data;
  const latest = episodes[0];

  async function continueTonight() {
    setBusy(true);
    setError(null);
    try {
      const found = characters.find((c) => c.role === "companion" || c.role === "sidekick");
      const companionDef: CharacterDef = found
        ? {
            name: found.name,
            role: found.role as CharacterDef["role"],
            appearance: found.appearance,
            personality: found.personality,
            strengths: found.strengths,
            flaws: found.flaws,
            speechStyle: found.speech_style,
            catchphrase: found.catchphrase,
            fears: found.fears,
            voiceId: found.voice_id,
          }
        : rollCharacter("companion");
      const result = await createStory({
        data: {
          childName: world.child_name,
          childAge: world.child_age,
          childId: world.child_id,
          interests: world.premise,
          premise: world.premise,
          setting: world.setting,
          mode: world.mode,
          plannedChapters: world.planned_chapters ?? 8,
          durationMin: world.duration_min,
          moodFunny: world.mood_funny,
          moodAdventure: world.mood_adventure,
          moodMystery: world.mood_mystery,
          parentObjectives: world.parent_objectives,
          parentAvoids: world.parent_avoids,
          companion: companionDef,
          worldId: world.id,
        },
      });
      await navigate({ to: "/app/listen/$episodeId", params: { episodeId: result.episodeId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 pb-24">
      <p className="text-xs uppercase tracking-[0.2em] text-subtle">
        {world.child_name} · {world.mode === "infinite" ? "Series" : world.mode === "series" ? "Finite series" : "Story"}
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium">{world.title}</h1>
      <p className="mt-3 text-lg text-muted">
        {world.last_hook || world.last_summary || "A world waiting for its next night."}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="lg" onClick={continueTonight} disabled={busy}>
          {busy ? "The director is working" : "Tonight"}
        </Button>
        {latest ? (
          <Button asChild variant="outline" size="lg">
            <Link to="/app/listen/$episodeId" params={{ episodeId: latest.id }}>
              Last episode
            </Link>
          </Button>
        ) : null}
      </div>
      {error ? <p className="mt-3 text-sm text-ember">{error}</p> : null}

      <section className="mt-12">
        <h2 className="text-sm font-medium text-muted">People in this world</h2>
        <ul className="mt-4 grid gap-3">
          {characters.map((c) => (
            <li key={c.id}>
              <Card className="p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-subtle">{c.role}</p>
                <h3 className="mt-1 font-display text-2xl">{c.name}</h3>
                <p className="mt-2 text-sm text-muted">
                  {characterBlurb({
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
                  })}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {state ? (
        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          <Lore title="Canon" items={state.canonFacts} />
          <Lore title="Mysteries" items={state.unresolvedMysteries} />
          <Lore title="Places" items={state.locations} />
          <Lore title="Possessions" items={state.possessions} />
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="text-sm font-medium text-muted">Episodes</h2>
        <ul className="mt-4 space-y-2">
          {episodes.map((e) => (
            <li key={e.id}>
              <Link
                to="/app/listen/$episodeId"
                params={{ episodeId: e.id }}
                className="flex items-center justify-between rounded-2xl px-4 py-3 shadow-[var(--shadow-border)]"
              >
                <span>
                  <span className="text-subtle">Episode {e.episode_number} · </span>
                  {e.title}
                </span>
                <span className="text-sm text-subtle">{e.duration_min} min</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Lore({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <h3 className="text-sm font-medium text-muted">{title}</h3>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm">
          {items.slice(0, 6).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-subtle">Nothing canon yet.</p>
      )}
    </Card>
  );
}
