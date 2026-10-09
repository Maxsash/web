import { clamp01 } from "./clamp.ts";

const REVEAL_START = 0.14;
const REVEAL_SPAN = 0.75;

export function revealFor(progress: number, mode: { reducedMotion: boolean; staged: boolean }) {
  if (mode.staged) return clamp01(progress);
  if (mode.reducedMotion) return progress > 0.45 ? 1 : 0;
  return clamp01((progress - REVEAL_START) / REVEAL_SPAN);
}

export const chapterFor = (progress: number) =>
  progress < 0.33 ? "sea" : progress < 0.8 ? "structure" : "atlas";
