import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { DiceButton } from "@/components/dice-button";
import { createStory, listChildren } from "@/lib/bedtime/server";
import { rollCharacter, rollField, type CharacterLocks } from "@/lib/bedtime/dice";
import type { CharacterDef, ChildProfile, StoryMode } from "@/lib/bedtime/models";
import { DURATION_OPTIONS, PARENT_OBJECTIVES } from "@/lib/bedtime/models";
import { formatDuration } from "@/lib/bedtime/duration";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/new")({ component: NewStory });

const STAGES = ["Gathering primitives", "Director planning the arc", "Writing the performance", "Rendering the book"];

function NewStory() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [childId, setChildId] = useState<string>("");
  const [childName, setChildName] = useState("Ivars");
  const [childAge, setChildAge] = useState(7);
  const [interests, setInterests] = useState("");
  const [premise, setPremise] = useState("");
  const [setting, setSetting] = useState("");
  const [mode, setMode] = useState<StoryMode>("infinite");
  const [plannedChapters, setPlannedChapters] = useState(8);
  const [durationMin, setDurationMin] = useState(10);
  const [moodFunny, setMoodFunny] = useState(3);
  const [moodAdventure, setMoodAdventure] = useState(4);
  const [moodMystery, setMoodMystery] = useState(2);
  const [objectives, setObjectives] = useState<string[]>(["friendship", "bedtime"]);
  const [avoids, setAvoids] = useState("");
  const [companion, setCompanion] = useState<CharacterDef>(() => rollCharacter("companion"));
  const [locks, setLocks] = useState<CharacterLocks>({});
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listChildren()
      .then((list) => {
        setChildren(list);
        if (list[0]) {
          setChildId(list[0].id);
          setChildName(list[0].name);
          setChildAge(list[0].age);
          setInterests(list[0].interests);
          setDurationMin(list[0].defaultDurationMin);
        }
      })
      .catch(() => {});
  }, []);

  function rerollCompanion(field?: keyof CharacterDef) {
    if (field) {
      if (locks[field]) return;
      const next = rollCharacter("companion");
      setCompanion({ ...companion, [field]: next[field] as never });
      return;
    }
    setCompanion(rollCharacter("companion", takeLocked(companion, locks)));
  }

  async function onCreate() {
    setBusy(true);
    setError(null);
    setStage(0);
    const timer = window.setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 2400);
    try {
      const result = await createStory({
        data: {
          childName,
          childAge,
          childId: childId || undefined,
          interests,
          premise,
          setting,
          mode,
          plannedChapters,
          durationMin,
          moodFunny,
          moodAdventure,
          moodMystery,
          parentObjectives: objectives.join(", "),
          parentAvoids: avoids,
          companion,
        },
      });
      window.clearInterval(timer);
      await navigate({ to: "/app/listen/$episodeId", params: { episodeId: result.episodeId } });
    } catch (err) {
      window.clearInterval(timer);
      setError(err instanceof Error ? err.message : "Could not create the story");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 pb-24">
      <p className="text-xs uppercase tracking-[0.2em] text-subtle">Tonight</p>
      <h1 className="mt-2 font-display text-4xl font-medium">Create a story</h1>
      <p className="mt-2 text-muted">Almost all of the agent work stays invisible. You set who, what, how long.</p>

      <div className="mt-10 space-y-8">
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted">Who is it for?</h2>
          {children.length ? (
            <div className="flex flex-wrap gap-2">
              {children.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setChildId(c.id);
                    setChildName(c.name);
                    setChildAge(c.age);
                    setInterests(c.interests);
                  }}
                  className={cn(
                    "h-11 rounded-full px-4 text-sm shadow-[var(--shadow-border)]",
                    childId === c.id ? "bg-moon text-moon-fg" : "bg-night-3 text-ink",
                  )}
                >
                  {c.name}, {c.age}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setChildId("");
                  setChildName("");
                }}
                className="h-11 rounded-full px-4 text-sm text-muted shadow-[var(--shadow-border)]"
              >
                New child
              </button>
            </div>
          ) : null}
          <div className="grid grid-cols-[1fr_90px] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="child">Name</Label>
              <Input id="child" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Ivars" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min={3}
                max={12}
                value={childAge}
                onChange={(e) => setChildAge(Number(e.target.value) || 7)}
              />
            </div>
          </div>
        </section>

        <Field
          label="What should it be about?"
          hint="Premise"
          value={premise}
          onChange={setPremise}
          onDice={() => setPremise(rollField("premise", childAge, premise))}
          placeholder="A tiny dragon accidentally becomes mayor…"
        />
        <Field
          label="Setting"
          value={setting}
          onChange={setSetting}
          onDice={() => setSetting(rollField("setting", childAge, setting))}
          placeholder="Pirate island, ancient Rome, Minecraft-like world"
        />
        <Field
          label="Interests"
          value={interests}
          onChange={setInterests}
          onDice={() => setInterests(rollField("setting", childAge))}
          placeholder="Minecraft, Romans, dragons"
        />

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted">Story type</h2>
          <div className="grid gap-2">
            {(
              [
                ["single", "One story"],
                ["series", "Series with chapters"],
                ["infinite", "A living series"],
              ] as const
            ).map(([id, label]) => (
              <label
                key={id}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3 shadow-[var(--shadow-border)]",
                  mode === id ? "bg-night-3" : "bg-transparent",
                )}
              >
                <span>{label}</span>
                <input
                  type="radio"
                  name="mode"
                  className="accent-moon"
                  checked={mode === id}
                  onChange={() => setMode(id)}
                />
              </label>
            ))}
          </div>
          {mode === "series" ? (
            <div className="flex items-center gap-3 pt-1">
              <Label htmlFor="chapters">Chapters</Label>
              <Input
                id="chapters"
                type="number"
                min={2}
                max={12}
                className="w-24"
                value={plannedChapters}
                onChange={(e) => setPlannedChapters(Number(e.target.value) || 8)}
              />
            </div>
          ) : null}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted">Length</h2>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDurationMin(m)}
                className={cn(
                  "h-11 rounded-full px-4 text-sm tabular-nums shadow-[var(--shadow-border)]",
                  durationMin === m ? "bg-moon text-moon-fg" : "bg-night-3",
                )}
              >
                {formatDuration(m)}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted">Mood</h2>
          <Mood label="Funny" value={moodFunny} onChange={setMoodFunny} />
          <Mood label="Adventure" value={moodAdventure} onChange={setMoodAdventure} />
          <Mood label="Mystery" value={moodMystery} onChange={setMoodMystery} />
        </section>

        <Card className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl">Companion</h2>
              <p className="text-sm text-muted">Lock anything you like, then reroll the rest.</p>
            </div>
            <DiceButton label="companion" onRoll={() => rerollCompanion()} />
          </div>
          <CharLine
            label="Name"
            value={companion.name}
            locked={!!locks.name}
            onLock={() => setLocks({ ...locks, name: !locks.name })}
            onRoll={() => rerollCompanion("name")}
            onChange={(v) => setCompanion({ ...companion, name: v })}
          />
          <CharLine
            label="Look"
            value={companion.appearance}
            locked={!!locks.appearance}
            onLock={() => setLocks({ ...locks, appearance: !locks.appearance })}
            onRoll={() => rerollCompanion("appearance")}
            onChange={(v) => setCompanion({ ...companion, appearance: v })}
          />
          <CharLine
            label="Personality"
            value={companion.personality}
            locked={!!locks.personality}
            onLock={() => setLocks({ ...locks, personality: !locks.personality })}
            onRoll={() => rerollCompanion("personality")}
            onChange={(v) => setCompanion({ ...companion, personality: v })}
          />
          <CharLine
            label="Fear"
            value={companion.fears}
            locked={!!locks.fears}
            onLock={() => setLocks({ ...locks, fears: !locks.fears })}
            onRoll={() => rerollCompanion("fears")}
            onChange={(v) => setCompanion({ ...companion, fears: v })}
          />
        </Card>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted">Parent objectives</h2>
          <div className="flex flex-wrap gap-2">
            {PARENT_OBJECTIVES.map((o) => {
              const on = objectives.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() =>
                    setObjectives(on ? objectives.filter((x) => x !== o.id) : [...objectives, o.id])
                  }
                  className={cn(
                    "h-10 rounded-full px-3.5 text-sm shadow-[var(--shadow-border)]",
                    on ? "bg-moon text-moon-fg" : "bg-night-3",
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avoid">Things to avoid</Label>
            <Textarea id="avoid" value={avoids} onChange={(e) => setAvoids(e.target.value)} placeholder="Jump scares, losing a pet…" />
          </div>
        </section>

        {error ? <p className="text-sm text-ember">{error}</p> : null}

        <Button size="lg" className="w-full" disabled={busy || !childName.trim()} onClick={onCreate}>
          {busy ? STAGES[stage] : "Create story"}
        </Button>
      </div>

      {busy ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-night/80 px-6 backdrop-blur-sm">
          <div className="max-w-sm text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-moon">Director</p>
            <p className="mt-3 font-display text-3xl">{STAGES[stage]}</p>
            <p className="mt-3 text-sm text-muted">A plan, then a performance. This usually takes a short moment.</p>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  onDice,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  onDice: () => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{hint ?? label}</Label>
        <DiceButton label={label} onRoll={onDice} />
      </div>
      <div className="relative">
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-h-20 pr-4" />
      </div>
    </div>
  );
}

function Mood({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="tabular-nums text-muted">{value}/5</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${label} ${n}`}
            onClick={() => onChange(n)}
            className={cn("h-10 flex-1 rounded-lg", n <= value ? "bg-moon" : "bg-night-3")}
          />
        ))}
      </div>
    </div>
  );
}

function CharLine({
  label,
  value,
  locked,
  onLock,
  onRoll,
  onChange,
}: {
  label: string;
  value: string;
  locked: boolean;
  onLock: () => void;
  onRoll: () => void;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.16em] text-subtle">{label}</span>
        <DiceButton label={label} locked={locked} onLock={onLock} onRoll={onRoll} />
      </div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function takeLocked(c: CharacterDef, locks: CharacterLocks): Partial<CharacterDef> {
  const out: Partial<CharacterDef> = { role: "companion" };
  (Object.keys(locks) as (keyof CharacterDef)[]).forEach((k) => {
    if (locks[k]) (out as Record<string, unknown>)[k] = c[k];
  });
  return out;
}
