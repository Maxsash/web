import { mix } from "../observatory/vec3.ts";

export type Wing = {
  lift: number;
  sweep: number;
  twist: number;
  reach: number;
  wristLift: number;
  wristSweep: number;
  fold: number;
};

export type Pose = {
  left: Wing;
  right: Wing;
  tail: number;
  fan: number;
  legs: number;
  stride: number;
  neck: number;
  headYaw: number;
  headPitch: number;
  eye: number;
  fluff: number;
};

const TAU = Math.PI * 2;

export const GLIDING: Wing = {
  lift: 0.14,
  sweep: 0.16,
  twist: 0.06,
  reach: 1,
  wristLift: -0.32,
  wristSweep: 0.3,
  fold: 0,
};

export const FOLDED: Wing = {
  lift: 0.3,
  sweep: 1.1,
  twist: 0.7,
  reach: 0.45,
  wristLift: 0.1,
  wristSweep: 0.9,
  fold: 1,
};

export const RAISED: Wing = {
  lift: 1.3,
  sweep: 0.42,
  twist: 0.25,
  reach: 0.82,
  wristLift: 0.3,
  wristSweep: 0.8,
  fold: 0,
};

export function flapping(phase: number, strength = 1): Wing {
  const angle = phase * TAU,
    upstroke = Math.max(0, -Math.sin(angle)) * strength;
  return {
    lift: 0.2 + 0.82 * strength * Math.cos(angle),
    sweep: 0.12 + 0.3 * upstroke,
    twist: 0.08 + 0.14 * strength * Math.sin(angle),
    reach: 1 - 0.2 * upstroke,
    wristLift: -0.14 + 0.46 * strength * Math.sin(angle),
    wristSweep: 0.22 + 0.55 * upstroke,
    fold: 0,
  };
}

export function braking(phase: number): Wing {
  const angle = phase * TAU,
    upstroke = Math.max(0, -Math.sin(angle));
  return {
    lift: 0.5 + 0.72 * Math.cos(angle),
    sweep: -0.32 + 0.3 * upstroke,
    twist: 0.62,
    reach: 0.96 - 0.12 * upstroke,
    wristLift: 0.08 + 0.4 * Math.sin(angle),
    wristSweep: 0.04 + 0.4 * upstroke,
    fold: 0,
  };
}

const AT_REST = {
  tail: 0,
  fan: 0,
  legs: 0,
  stride: 0,
  neck: 0.2,
  headYaw: 0,
  headPitch: 0,
  eye: 1,
  fluff: 0,
};

export const flying = (wing: Wing): Pose => ({
  ...AT_REST,
  left: wing,
  right: wing,
  neck: 0.45,
  fan: 0.15,
});

export const SITTING: Pose = { ...AT_REST, left: FOLDED, right: FOLDED, fluff: 0.35 };

export const STANDING: Pose = {
  ...AT_REST,
  left: FOLDED,
  right: FOLDED,
  legs: 1,
  neck: 0.55,
  tail: -0.06,
};

export const mixWing = (a: Wing, b: Wing, t: number): Wing => ({
  lift: mix(a.lift, b.lift, t),
  sweep: mix(a.sweep, b.sweep, t),
  twist: mix(a.twist, b.twist, t),
  reach: mix(a.reach, b.reach, t),
  wristLift: mix(a.wristLift, b.wristLift, t),
  wristSweep: mix(a.wristSweep, b.wristSweep, t),
  fold: mix(a.fold, b.fold, t),
});

export function mixPose(a: Pose, b: Pose, t: number): Pose {
  if (t <= 0) return a;
  if (t >= 1) return b;
  return {
    left: mixWing(a.left, b.left, t),
    right: mixWing(a.right, b.right, t),
    tail: mix(a.tail, b.tail, t),
    fan: mix(a.fan, b.fan, t),
    legs: mix(a.legs, b.legs, t),
    stride: mix(a.stride, b.stride, t),
    neck: mix(a.neck, b.neck, t),
    headYaw: mix(a.headYaw, b.headYaw, t),
    headPitch: mix(a.headPitch, b.headPitch, t),
    eye: mix(a.eye, b.eye, t),
    fluff: mix(a.fluff, b.fluff, t),
  };
}

export const withWings = (pose: Pose, wing: Wing): Pose => ({ ...pose, left: wing, right: wing });
