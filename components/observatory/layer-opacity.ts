import { clamp01 } from "./clamp.ts";
import { SKY_PAPER_FADE } from "./ocean-light.ts";

const [PAPER_START, PAPER_END] = SKY_PAPER_FADE.map(Number);

export function layerOpacities(progress: number) {
  const intro = 1 - clamp01((progress - 0.06) / 0.24);
  const end = clamp01((progress - 0.75) / 0.2);
  const veil = clamp01((progress - 0.17) / 0.3);
  return [intro, end, veil];
}

export function moonVisibility(night: number, reveal: number) {
  const paper = clamp01((reveal - PAPER_START) / (PAPER_END - PAPER_START));
  return night * (1 - paper * paper * (3 - 2 * paper));
}
