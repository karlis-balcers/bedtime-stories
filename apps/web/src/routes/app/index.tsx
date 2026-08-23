import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { listWorlds } from "@/lib/bedtime/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/app/")({ component: WorldsHome });

type WorldCard = Awaited<ReturnType<typeof listWorlds>>[number];

function WorldsHome() {
  const [worlds, setWorlds] = useState<WorldCard[] | null>(null);

  useEffect(() => {
    listWorlds()
      .then(setWorlds)
      .catch(() => setWorlds([]));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-subtle">Library</p>
          <h1 className="mt-2 font-display text-4xl font-medium">Worlds</h1>
        </div>
        <Button asChild>
          <Link to="/app/new">
            <Plus className="size-4" />
            New story
          </Link>
        </Button>
      </div>

      {worlds === null ? (
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="h-44 animate-pulse rounded-3xl bg-night-2" />
          <div className="h-44 animate-pulse rounded-3xl bg-night-2" />
        </div>
      ) : worlds.length === 0 ? (
        <Card className="mt-12 max-w-lg p-8">
          <h2 className="font-display text-2xl">No worlds yet</h2>
          <p className="mt-2 text-muted">
            Create a child profile and a first episode. The universe will accumulate characters, jokes, and unfinished threads.
          </p>
          <Button asChild className="mt-6">
            <Link to="/app/new">Create tonight’s story</Link>
          </Button>
        </Card>
      ) : (
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {worlds.map((w) => (
            <li key={w.id}>
              <Link to="/app/worlds/$worldId" params={{ worldId: w.id }} className="block">
                <Card className="h-full p-6 transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-lift)]">
                  <p className="text-xs uppercase tracking-[0.18em] text-subtle">
                    {w.child_name} · {w.mode === "infinite" ? "Series" : w.mode === "series" ? `Series · ${w.planned_chapters} chapters` : "One story"}
                  </p>
                  <h2 className="mt-2 font-display text-2xl leading-snug">{w.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm text-muted">
                    {w.last_hook || w.last_summary || w.premise || w.setting}
                  </p>
                  <div className="mt-5 flex items-center justify-between text-sm text-subtle">
                    <span>
                      Episode {Math.max(0, w.next_episode - 1) || w.episode_count}
                    </span>
                    <span>{w.duration_min} min</span>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
