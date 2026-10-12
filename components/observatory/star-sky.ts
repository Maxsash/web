import { moonEquatorialAt } from "./moon-phase.ts";

const RAD = Math.PI / 180;
const DAY_MS = 86_400_000;
const INDIA_EVENING_UTC_MS = 15.5 * 3_600_000;
const TIKAMGARH_LATITUDE = 24.75 * RAD;
const TIKAMGARH_LONGITUDE = 78.83;

export type Star = {
  rightAscension: number;
  declination: number;
  magnitude: number;
  colorIndex: number;
};

type Vector = [number, number, number];

const dot = (a: Vector, b: Vector) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vector, b: Vector): Vector => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const normalize = (v: Vector): Vector => {
  const length = Math.hypot(...v);
  return [v[0] / length, v[1] / length, v[2] / length];
};
const direction = (ra: number, dec: number): Vector => [
  Math.cos(dec) * Math.cos(ra),
  Math.cos(dec) * Math.sin(ra),
  Math.sin(dec),
];

export function decodeStarCatalogue(buffer: ArrayBuffer): Star[] {
  const data = new DataView(buffer);
  if (data.byteLength < 6 || String.fromCharCode(...new Uint8Array(buffer, 0, 4)) !== "HYG4") {
    throw new Error("Unsupported star catalogue");
  }
  const count = data.getUint16(4, true);
  if (data.byteLength !== 6 + count * 6) throw new Error("Incomplete star catalogue");
  return Array.from({ length: count }, (_, index) => {
    const offset = 6 + index * 6;
    return {
      rightAscension: (data.getUint16(offset, true) / 65535) * 360,
      declination: (data.getUint16(offset + 2, true) / 65535) * 180 - 90,
      magnitude: (data.getUint8(offset + 4) / 255) * 8 - 2,
      colorIndex: (data.getUint8(offset + 5) / 255) * 2.8 - 0.4,
    };
  });
}

export function starFrameAt(day: number, stars: readonly Star[]) {
  const timestamp = day * DAY_MS + INDIA_EVENING_UTC_MS;
  const julianDay = timestamp / DAY_MS + 2_440_587.5;
  const century = (julianDay - 2_451_545) / 36_525;
  const siderealDegrees =
    280.46061837 +
    360.98564736629 * (julianDay - 2_451_545) +
    0.000387933 * century ** 2 -
    century ** 3 / 38_710_000 +
    TIKAMGARH_LONGITUDE;
  const sidereal = siderealDegrees * RAD;
  const zenith: Vector = [
    Math.cos(TIKAMGARH_LATITUDE) * Math.cos(sidereal),
    Math.cos(TIKAMGARH_LATITUDE) * Math.sin(sidereal),
    Math.sin(TIKAMGARH_LATITUDE),
  ];
  const moon = moonEquatorialAt(timestamp);
  const forward = direction(moon.rightAscension * RAD, moon.declination * RAD);
  const pole: Vector = [0, 0, 1];
  const towardsUp = Math.abs(dot(forward, zenith)) > 0.99 ? pole : zenith;
  const up = normalize([
    towardsUp[0] - forward[0] * dot(towardsUp, forward),
    towardsUp[1] - forward[1] * dot(towardsUp, forward),
    towardsUp[2] - forward[2] * dot(towardsUp, forward),
  ]);
  const right = cross(up, forward);
  const visible = new Float32Array(stars.length * 4);
  let count = 0;
  for (const star of stars) {
    const vector = direction(star.rightAscension * RAD, star.declination * RAD);
    const depth = dot(vector, forward);
    if (depth < 0.25) continue;
    const x = dot(vector, right) / depth;
    const y = dot(vector, up) / depth;
    if (Math.abs(x) > 3 || Math.abs(y) > 2) continue;
    visible.set([x, y, star.magnitude, star.colorIndex], count * 4);
    count++;
  }
  return visible.subarray(0, count * 4);
}
