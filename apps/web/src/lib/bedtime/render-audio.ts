import type { ScriptBeat } from "./models";

/** Transform a canonical beat into xAI TTS text with speech tags. Engine-specific; swap here if TTS changes. */
export function beatToSpeech(beat: ScriptBeat): string | null {
  if (beat.kind === "pause") {
    const ms = beat.pauseAfterMs ?? 600;
    return `<pause=${Math.max(0.2, ms / 1000)}s>`;
  }
  if (beat.kind === "sfx") {
    const desc = beat.sfx ?? beat.text ?? "";
    if (!desc) return null;
    return `[sfx] ${desc}`;
  }
  if (beat.kind === "ambience" || beat.kind === "scene" || beat.kind === "choice") return null;

  let text = (beat.text ?? "").trim();
  if (!text) return null;

  const delivery = (beat.delivery ?? beat.emotion ?? "").toLowerCase();
  if (delivery.includes("whisper")) text = `[whisper] ${text}`;
  else if (delivery.includes("laugh")) text = `[laugh] ${text}`;
  else if (delivery.includes("slow") || beat.kind === "wind_down") text = `<slow>${text}</slow>`;
  else if (delivery.includes("shout") || delivery.includes("excited")) text = `<emphasis>${text}</emphasis>`;

  if (beat.pauseAfterMs && beat.pauseAfterMs >= 400) {
    text += ` <pause=${(beat.pauseAfterMs / 1000).toFixed(1)}s>`;
  }
  return text;
}

export function defaultVoiceFor(speaker: string | undefined, voices: Record<string, string>): string {
  if (speaker && voices[speaker]) return voices[speaker];
  if (speaker && voices[speaker.toLowerCase()]) return voices[speaker.toLowerCase()];
  return voices.NARRATOR ?? voices.Narrator ?? "eve";
}
