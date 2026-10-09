import { clamp01 } from "./clamp.ts";

export const STAGES = [
  { label: "Sea", progress: 0 },
  { label: "Drawing", progress: 1 },
];

const OPENING_MS = 1800;
const MOVE_MS = 600;

export type StageMove = { from: number; target: number; startedAt: number; duration: number };

export const stepStage = (index: number, direction: number) =>
  Math.max(0, Math.min(STAGES.length - 1, index + direction));

export function planMove(
  fromIndex: number,
  toIndex: number,
  currentProgress: number,
  startedAt: number,
): StageMove {
  return {
    from: currentProgress,
    target: STAGES[toIndex].progress,
    startedAt,
    duration: fromIndex === 0 && toIndex === 1 ? OPENING_MS : MOVE_MS,
  };
}

const easeOut = (t: number) => t * (2 - t);
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

export function progressAt(move: StageMove, now: number, instant: boolean) {
  const t = instant ? 1 : clamp01((now - move.startedAt) / move.duration);
  const eased = move.duration === OPENING_MS ? easeOut(t) : smootherstep(t);
  return { progress: move.from + (move.target - move.from) * eased, finished: t === 1 };
}
