import type { ScriptBeat, StoryScript } from "./models";

function spokenLine(beat: ScriptBeat): string {
  const text = (beat.text ?? "").trim();
  if (!text) return "";
  if (beat.kind === "dialogue") {
    const who = beat.speaker ?? "someone";
    const how = beat.delivery || beat.emotion;
    if (how) return `“${stripQuotes(text)}” ${who.toLowerCase()} ${how === "whispering" ? "whispered" : "said"}.`;
    return `“${stripQuotes(text)}” said ${who}.`;
  }
  return text;
}

function stripQuotes(s: string) {
  return s.replace(/^["“]+|["”]+$/g, "");
}

/** Deterministic book rendering. Performance markup never leaks into reading UI. */
export function renderBook(script: StoryScript, chosen: Record<string, string> = {}): string {
  const paragraphs: string[] = [];
  let current = "";

  const beats = visibleBeats(script.beats, chosen);
  for (const beat of beats) {
    if (beat.kind === "scene") {
      if (current) paragraphs.push(current.trim());
      current = "";
      continue;
    }
    if (beat.kind === "choice") continue;
    if (beat.kind === "sfx") {
      const sfx = beat.sfx ?? beat.text;
      if (sfx) current += (current ? " " : "") + sentenceCase(sfx) + (sfx.endsWith(".") ? "" : ".");
      continue;
    }
    if (beat.kind === "pause" || beat.kind === "ambience") continue;
    const line = spokenLine(beat);
    if (!line) continue;
    current += (current ? " " : "") + line;
    if (beat.kind === "wind_down" || (beat.pauseAfterMs && beat.pauseAfterMs >= 600)) {
      paragraphs.push(current.trim());
      current = "";
    }
  }
  if (current.trim()) paragraphs.push(current.trim());
  return paragraphs.join("\n\n");
}

export function visibleBeats(beats: ScriptBeat[], chosen: Record<string, string>): ScriptBeat[] {
  const selected = new Set(Object.values(chosen));
  return beats.filter((b) => !b.branch || selected.has(b.branch));
}

function sentenceCase(s: string) {
  const t = s.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function countScriptWords(script: StoryScript, chosen: Record<string, string> = {}): number {
  return visibleBeats(script.beats, chosen)
    .map((b) => (b.text ?? "").trim())
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}
