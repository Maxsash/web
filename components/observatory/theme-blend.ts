import { smootherstep } from "./easing.ts";

export type ThemeBlend = { from: number; target: number; started: number };
export const THEME_BLEND_MS = 1000;

export function themeBlendAt(blend: ThemeBlend, now: number) {
  const progress = Math.max(0, Math.min(1, (now - blend.started) / THEME_BLEND_MS));
  return {
    value: blend.from + (blend.target - blend.from) * smootherstep(progress),
    finished: progress === 1,
  };
}
