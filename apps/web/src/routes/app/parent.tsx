import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { listParentRecap } from "@/lib/bedtime/server";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/app/parent")({ component: ParentLayer });

function ParentLayer() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listParentRecap>> | null>(null);

  useEffect(() => {
    listParentRecap()
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.2em] text-subtle">Invisible to the child</p>
      <h1 className="mt-2 font-display text-4xl font-medium">Parent</h1>
      <p className="mt-3 max-w-lg text-muted">
        Objectives live on each world’s creation screen. After an episode, you get a short recap — what was practiced, who appeared, what changed.
      </p>

      <section className="mt-10 space-y-3">
        {rows === null ? (
          <div className="h-32 animate-pulse rounded-3xl bg-night-2" />
        ) : rows.length === 0 ? (
          <Card>
            <h2 className="font-display text-2xl">No nights yet</h2>
            <p className="mt-2 text-sm text-muted">
              After the first episode you’ll see summaries here, such as “Tonight Ivars practiced accepting losing and encountered Roman numerals.”
            </p>
          </Card>
        ) : (
          rows.map((r) => (
            <Link key={r.id} to="/app/listen/$episodeId" params={{ episodeId: r.id }} className="block">
              <Card>
                <p className="text-xs uppercase tracking-[0.16em] text-subtle">
                  {r.child_name} · {r.world_title} · Episode {r.episode_number}
                </p>
                <h2 className="mt-2 font-display text-xl">{r.title}</h2>
                <p className="mt-2 text-sm text-muted">{r.parent_summary || "No recap stored."}</p>
              </Card>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
