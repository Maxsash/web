import { mix, type V3 } from "./vec3.ts";

export function cameraAt(reveal: number, aspect: number, pointer: [number, number]) {
  const orbit = reveal * reveal * (3 - 2 * reveal),
    narrow = aspect < 0.8;
  const eye: V3 = [
    mix(0, 10, orbit) + pointer[0] * 0.75,
    mix(narrow ? 6.8 : 5, 29, orbit) + pointer[1] * 0.35,
    mix(narrow ? 24 : 18, 16, orbit),
  ];
  const target: V3 = [mix(narrow ? 2.5 : 0, 0, orbit), mix(0.6, -0.4, orbit), -7];
  return { eye, target };
}
