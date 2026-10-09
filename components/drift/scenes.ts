import { SEA_PRESETS } from "../../lib/sea/presets.ts";
import { DEFAULT_SEA_SEED_V2, seedFromSettings } from "../../lib/sea/seed.ts";
import type { V3 } from "../observatory/vec3.ts";

export type Pose = [x: number, z: number, yaw: number];

export type Whirlpool = {
  centre: [x: number, z: number];
  depth: number;
  radius: number;
  twist: number;
};

export type DriftScene = {
  seed: string;
  night: number;
  swell: number;
  pace: number;
  eye: V3;
  target: V3;
  drifter: "plank" | "raft" | "page";
  pose: Pose;
  reveal?: number;
  tint?: { colour: V3; amount: number };
  whirlpool?: Whirlpool;
  storm?: boolean;
};

const [glass, tradeWind] = SEA_PRESETS.map((preset) => seedFromSettings(preset.settings));
const rogueSquall = seedFromSettings({ swell: 245, heading: 50, character: 225, variation: 7 });

export const DRIFT_SCENES = {
  horizon: {
    seed: glass,
    night: 0,
    swell: 1,
    pace: 0.8,
    eye: [0, 3.2, 20],
    target: [0, 3, -7],
    drifter: "plank",
    pose: [2.6, 9.5, 0.7],
  },
  notebook: {
    seed: tradeWind,
    night: 0,
    swell: 1,
    pace: 1,
    eye: [0, 11, 24],
    target: [0, 4, -7],
    drifter: "page",
    pose: [2.2, 2.8, -0.4],
  },
  plate: {
    seed: DEFAULT_SEA_SEED_V2,
    night: 0,
    swell: 1,
    pace: 0.9,
    eye: [0, 4.4, 22],
    target: [0, 3.8, -7],
    drifter: "raft",
    pose: [3, 7, 0.6],
    reveal: 0.52,
  },
  squall: {
    seed: rogueSquall,
    night: 1,
    swell: 1.25,
    pace: 1.4,
    eye: [0, 3, 20],
    target: [0, 3.4, -7],
    drifter: "raft",
    pose: [3, 7, 0.4],
    tint: { colour: [1, 0.62, 0.22], amount: 0.3 },
  },
  storm: {
    seed: tradeWind,
    night: 0.75,
    swell: 1.1,
    pace: 1.3,
    eye: [0, 9, 22],
    target: [0, 7.4, -7],
    drifter: "plank",
    pose: [0, 0, 0],
    whirlpool: { centre: [0.5, -6], depth: 4, radius: 5.5, twist: 2.4 },
    storm: true,
  },
} satisfies Record<string, DriftScene>;

export type DriftSceneName = keyof typeof DRIFT_SCENES;

const ORBIT_RADIUS = 2.7;
const NARROWEST_SPREAD = 0.45;

export function drifterPose(scene: DriftScene, time: number, aspect: number): Pose {
  if (scene.whirlpool) {
    const angle = -time * 0.5,
      radius = ORBIT_RADIUS + 0.3 * Math.sin(time * 0.31),
      [cx, cz] = scene.whirlpool.centre;
    return [cx + radius * Math.cos(angle), cz + radius * Math.sin(angle), angle - Math.PI / 2];
  }
  const [x, z, yaw] = scene.pose;
  const spread = Math.min(1, Math.max(NARROWEST_SPREAD, aspect / 1.6));
  return [x * spread, z, yaw + 0.12 * Math.sin(time * 0.22)];
}

const LIGHTNING_PERIOD = 7.3;
const LIGHTNING_AT = 6.7;

export function lightningAt(time: number) {
  const phase = time % LIGHTNING_PERIOD;
  return phase < LIGHTNING_AT ? 0 : 0.55 * Math.exp(-(phase - LIGHTNING_AT) * 9);
}
