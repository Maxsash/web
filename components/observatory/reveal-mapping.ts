import { clamp01 } from "./clamp.ts";

const STAGED_STRUCTURE = 0.55;
const REVEAL_START = 0.14;
const REVEAL_SPAN = 0.75;

export function revealFor(progress: number, mode: { reducedMotion: boolean; staged: boolean }) {
  if (mode.reducedMotion && !mode.staged) return progress > 0.45 ? 1 : 0;
  if (mode.staged && progress < STAGED_STRUCTURE)
    return clamp01(
      (progress / STAGED_STRUCTURE) * ((STAGED_STRUCTURE - REVEAL_START) / REVEAL_SPAN),
    );
  return clamp01((progress - REVEAL_START) / REVEAL_SPAN);
}

export const chapterFor = (progress: number) =>
  progress < 0.33 ? "sea" : progress < 0.8 ? "structure" : "atlas";
