import { sampleSea } from "../../lib/sea/sample.ts";
import type { SeaEdition } from "../../lib/sea/types.ts";
import { cross, normal, type V3 } from "./vec3.ts";

export type ShipPlacement = { x: number; z: number; scale: number };

export function shipMatrix(
  placement: ShipPlacement,
  height: number,
  yaw: number,
  pitch = 0,
  roll = 0.055,
) {
  const forward: V3 = [Math.sin(yaw), 0, Math.cos(yaw)];
  const across: V3 = [forward[2], 0, -forward[0]];
  const up = normal(across.map((v, i) => (i === 1 ? 1 : 0) - v * roll - forward[i] * pitch) as V3);
  const right = normal(cross(up, forward)),
    along = cross(right, up);
  return new Float32Array([
    ...right.map((v) => v * placement.scale),
    0,
    ...up.map((v) => v * placement.scale),
    0,
    ...along.map((v) => v * placement.scale),
    0,
    placement.x,
    height,
    placement.z,
    1,
  ]);
}

export function shipPoseAt(edition: SeaEdition, time: number, placement: ShipPlacement) {
  const yaw = 1.12 + Math.sin(time * 0.19) * 0.035;
  const forward: V3 = [Math.sin(yaw), 0, Math.cos(yaw)];
  const across: V3 = [forward[2], 0, -forward[0]];
  const x = placement.x + Math.sin(time * 0.23) * 0.12 * placement.scale;
  const z = placement.z + Math.sin(time * 0.17 + 0.6) * 0.1 * placement.scale;
  const heightAt = (along: number, side = 0) => {
    const px = x + (forward[0] * along + across[0] * side) * placement.scale;
    const pz = z + (forward[2] * along + across[2] * side) * placement.scale;
    return (
      sampleSea(edition, px, pz, time).height * 0.5 +
      sampleSea(edition, px, pz, time - 0.22).height * 0.3 +
      sampleSea(edition, px, pz, time - 0.44).height * 0.2
    );
  };
  const bow = heightAt(1.65),
    stern = heightAt(-1.65),
    middle = heightAt(0);
  const port = heightAt(0, -0.58),
    starboard = heightAt(0, 0.58);
  const pitch = Math.tanh((bow - stern) / (3.3 * placement.scale)) * 0.48;
  const roll = Math.tanh((starboard - port) / (1.16 * placement.scale)) * 0.3 + 0.055;
  const height = middle * 0.4 + (bow + stern) * 0.3 + 0.075 * placement.scale;
  const matrix = shipMatrix({ x, z, scale: placement.scale }, height, yaw, pitch, roll);
  return { matrix, x, z, yaw, height, pitch, roll };
}
