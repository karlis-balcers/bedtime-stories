import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getEpisode } from "@/lib/bedtime/server";
import { StoryPlayer } from "@/components/story-player";

export const Route = createFileRoute("/app/listen/$episodeId")({ component: ListenPage });

function ListenPage() {
  const { episodeId } = Route.useParams();
  const [episode, setEpisode] = useState<Awaited<ReturnType<typeof getEpisode>>>(null);

  useEffect(() => {
    getEpisode({ data: episodeId }).then(setEpisode);
  }, [episodeId]);

  if (!episode) {
    return (
      <main className="grid min-h-[70vh] place-items-center">
        <p className="text-muted">Opening the night…</p>
      </main>
    );
  }

  return (
    <StoryPlayer
      mode="listen"
      episode={{
        id: episode.id,
        title: episode.title,
        world_id: episode.world_id,
        world_title: episode.world_title,
        child_name: episode.child_name,
        episode_number: episode.episode_number,
        book_text: episode.book_text,
        script: episode.script,
        chosen_options: episode.chosen_options,
        parent_summary: episode.parent_summary,
      }}
    />
  );
}
