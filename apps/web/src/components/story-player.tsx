import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronLeft, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveChoice, speakBeat } from "@/lib/bedtime/server";
import { visibleBeats } from "@/lib/bedtime/render-book";
import { beatToSpeech } from "@/lib/bedtime/render-audio";
import type { ScriptBeat, StoryScript } from "@/lib/bedtime/models";
import { DiceButton } from "@/components/dice-button";
import { pick } from "@/lib/utils";

type Episode = {
  id: string;
  title: string;
  world_id: string;
  world_title: string;
  child_name: string;
  episode_number: number;
  book_text: string;
  script: StoryScript;
  chosen_options: Record<string, string>;
  parent_summary: string;
};

export function StoryPlayer({ episode, mode }: { episode: Episode; mode: "listen" | "read" }) {
  const [chosen, setChosen] = useState(episode.chosen_options);
  const beats = useMemo(() => visibleBeats(episode.script.beats, chosen), [episode.script.beats, chosen]);
  const playable = useMemo(
    () => beats.filter((b) => b.kind === "choice" || beatToSpeech(b)),
    [beats],
  );
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [waitingChoice, setWaitingChoice] = useState<ScriptBeat | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cache = useRef(new Map<string, string>());

  const current = playable[index];

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      cache.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (mode !== "listen" || !playing) return;
    const beat = playable[index];
    if (!beat) {
      setPlaying(false);
      return;
    }
    if (beat.kind === "choice") {
      setPlaying(false);
      setWaitingChoice(beat);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const url = await getAudio(episode.id, beat, cache.current);
        if (cancelled || !url) {
          if (!cancelled) setIndex((i) => i + 1);
          return;
        }
        const audio = new Audio(url);
        audioRef.current = audio;
        await audio.play();
        await new Promise<void>((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
        });
        if (!cancelled) setIndex((i) => i + 1);
      } catch {
        if (!cancelled) setIndex((i) => i + 1);
      }
    })();
    return () => {
      cancelled = true;
      audioRef.current?.pause();
    };
  }, [index, playing, mode, episode.id, playable]);

  async function choose(optionId: string) {
    if (!waitingChoice) return;
    const next = { ...chosen, [waitingChoice.id]: optionId };
    setChosen(next);
    setWaitingChoice(null);
    await saveChoice({ data: { episodeId: episode.id, choiceId: waitingChoice.id, optionId } }).catch(() => {});
    setIndex((i) => i + 1);
    if (mode === "listen") setPlaying(true);
  }

  if (mode === "read") {
    return (
      <article className="paper-page min-h-dvh">
        <header className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 text-paper-ink">
          <Link to="/app/worlds/$worldId" params={{ worldId: episode.world_id }} className="grid size-11 place-items-center">
            <ChevronLeft className="size-5" />
          </Link>
          <p className="text-xs uppercase tracking-[0.18em] text-paper-muted">
            {episode.world_title} · {episode.episode_number}
          </p>
          <Link to="/app/listen/$episodeId" params={{ episodeId: episode.id }} className="grid size-11 place-items-center">
            <Play className="size-4" />
          </Link>
        </header>
        <div className="mx-auto max-w-2xl px-6 pb-24 pt-6">
          <h1 className="font-display text-4xl font-medium">{episode.title}</h1>
          <div className="mt-8 space-y-5 font-display text-lg leading-8">
            {episode.book_text.split("\n\n").map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </article>
    );
  }

  const spoken = current && current.kind !== "choice" ? current : playable[Math.max(0, index - 1)];
  const progress = playable.length ? Math.min(1, index / playable.length) : 0;
  const dim = spoken?.kind === "wind_down";

  return (
    <main className="relative flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-3 py-3">
        <Link to="/app/worlds/$worldId" params={{ worldId: episode.world_id }} className="grid size-11 place-items-center rounded-xl">
          <ChevronLeft className="size-5" />
        </Link>
        <p className="text-xs uppercase tracking-[0.18em] text-subtle">
          {episode.world_title}
        </p>
        <Link to="/app/read/$episodeId" params={{ episodeId: episode.id }} className="grid size-11 place-items-center rounded-xl">
          <BookOpen className="size-4" />
        </Link>
      </header>

      <div className={`mx-auto flex w-full max-w-xl flex-1 flex-col px-6 pb-28 pt-6 transition-opacity duration-500 ${dim ? "opacity-80" : ""}`}>
        <p className="text-xs uppercase tracking-[0.2em] text-moon">
          {spoken?.speaker && spoken.kind === "dialogue" ? spoken.speaker : "Narrator"}
        </p>
        <p className="mt-5 font-display text-[clamp(1.6rem,4vw,2.4rem)] leading-snug">
          {waitingChoice
            ? waitingChoice.text
            : spoken?.text || spoken?.sfx || episode.title}
        </p>

        {waitingChoice?.options ? (
          <div className="mt-10 space-y-3">
            {waitingChoice.options.map((opt) => (
              <Button key={opt.id} variant="secondary" className="h-auto min-h-12 w-full justify-start whitespace-normal py-3 text-left" onClick={() => choose(opt.id)}>
                {opt.label}
              </Button>
            ))}
            <div className="flex items-center justify-between pt-2 text-sm text-muted">
              <span>Or let fate decide</span>
              <DiceButton
                label="fate"
                onRoll={() => choose(pick(waitingChoice.options!).id)}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-auto pt-12">
          <div className="h-1 overflow-hidden rounded-full bg-ink/10">
            <span className="block h-full bg-moon transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="mt-6 flex items-center justify-center">
            <Button
              size="icon"
              className="size-16 rounded-full"
              onClick={() => {
                if (waitingChoice) return;
                if (playing) {
                  audioRef.current?.pause();
                  setPlaying(false);
                } else {
                  setPlaying(true);
                }
              }}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="size-6" /> : <Play className="ml-0.5 size-6" />}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

async function getAudio(episodeId: string, beat: ScriptBeat, cache: Map<string, string>): Promise<string | null> {
  const hit = cache.get(beat.id);
  if (hit) return hit;
  const res = await speakBeat({ data: { episodeId, beatId: beat.id } });
  if (!res.ok) return null;
  const bytes = Uint8Array.from(atob(res.base64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: res.mime }));
  cache.set(beat.id, url);
  return url;
}
