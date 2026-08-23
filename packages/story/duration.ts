/** Spoken words per minute for children's narration. Calibrated later from real audio. */
export const NARRATION_WPM = 130;

export function targetWordsForDuration(minutes: number): number {
  return Math.round(minutes * NARRATION_WPM);
}

export function formatDuration(minutes: number): string {
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Last portion of an episode reserved for wind-down. */
export function windDownMinutes(total: number): number {
  if (total <= 5) return 1;
  if (total <= 10) return 3;
  return Math.min(5, Math.round(total * 0.25));
}
