import { clamp01 } from "../observatory/clamp.ts";
import { smootherstep } from "../observatory/easing.ts";
import type { Frame } from "./flight.ts";

export type Note = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  tilt: number;
  pair: boolean;
};
type Reach = { scale: number; heading: number; night?: boolean };

const SONG = { first: 0.7, every: 7, until: 36, phrase: 3, spacing: 0.4, life: 1.9 };
const HEAD_LIFT = { pitch: 0.28, seconds: 0.35 };
const REACH = { forward: 0.32, up: 0.3, start: 0.09 };
const RADIUS = 0.052;

const STARTS = Array.from(
  { length: Math.floor((SONG.until - SONG.first) / SONG.every) + 1 },
  (_, k) => SONG.first + k * SONG.every,
).flatMap((start) => Array.from({ length: SONG.phrase }, (_, j) => start + j * SONG.spacing));
const NIGHT_STARTS = STARTS.slice(0, SONG.phrase);
const startsFor = (night: boolean) => (night ? NIGHT_STARTS : STARTS);

const ease = (t: number) => smootherstep(clamp01(t));

function noteAt(index: number, u: number, { scale, heading }: Reach): Note {
  const sway = Math.sin(u * 4 + index * 1.9);
  return {
    x: heading * (REACH.start + REACH.forward * u) * scale + 0.07 * scale * sway,
    y: -(REACH.start + REACH.up * ease(u)) * scale,
    radius: RADIUS * scale * (0.8 + 0.35 * ease(u)),
    alpha: clamp01(ease(u / 0.12) * (1 - ease((u - 0.5) / 0.5))),
    tilt: 0.3 * sway,
    pair: index % 2 === 1,
  };
}

export const notesAt = (t: number, reach: Reach): Note[] =>
  startsFor(reach.night ?? false).flatMap((start, index) => {
    const age = t - start;
    return age >= 0 && age < SONG.life ? [noteAt(index, age / SONG.life, reach)] : [];
  });

export const restingNotes = (reach: Reach): Note[] =>
  [0.2, 0.5].map((u, index) => ({ ...noteAt(index, u, reach), alpha: 1 }));

export const singingAt = (t: number, night = false) =>
  startsFor(night).some((start) => t >= start && t < start + SONG.life);

export const nextNoteAt = (t: number, night = false) =>
  startsFor(night).find((start) => start > t) ?? Infinity;

export function withSong(frame: Frame, t: number, night = false): Frame {
  const start = startsFor(night).findLast((at) => at <= t);
  const age = start === undefined ? Infinity : t - start;
  if (age >= HEAD_LIFT.seconds) return frame;
  const { pose } = frame;
  const lift = HEAD_LIFT.pitch * Math.sin((Math.PI * age) / HEAD_LIFT.seconds);
  return { ...frame, pose: { ...pose, headPitch: pose.headPitch + lift } };
}
