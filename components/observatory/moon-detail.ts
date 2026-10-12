export type MoonPhase = { illumination: number; cycle: number };

export type MoonMap = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

export type MoonSurfaceRequest = { map: Blob; phase: MoonPhase; size: number };

export function moonMapPoint(x: number, y: number) {
  const distance = x * x + y * y;
  if (distance >= 1) return null;
  const z = Math.sqrt(1 - distance);
  return {
    normal: [x, y, z] as const,
    u: 0.5 + Math.atan2(x, z) / Math.PI,
    v: 0.5 - Math.asin(y) / Math.PI,
  };
}

export function moonSurfaceLight(phase: MoonPhase, normal: readonly [number, number, number]) {
  const fraction = Math.max(0, Math.min(1, phase.illumination));
  const lightZ = 2 * fraction - 1;
  const lightX = (phase.cycle < 0.5 ? 1 : -1) * Math.sqrt(Math.max(0, 1 - lightZ * lightZ));
  const incidence = Math.max(0, normal[0] * lightX + normal[2] * lightZ);
  const earthshine = (0.022 + 0.08 * (1 - fraction) ** 2) * normal[2] ** 0.4;
  return Math.pow(incidence, 0.35) * 0.95 + earthshine;
}

function mapColour(map: MoonMap, u: number, v: number, channel: number) {
  const x = u * (map.width - 1);
  const y = v * (map.height - 1);
  const left = Math.floor(x);
  const top = Math.floor(y);
  const right = Math.min(left + 1, map.width - 1);
  const bottom = Math.min(top + 1, map.height - 1);
  const dx = x - left;
  const dy = y - top;
  const topColour =
    map.data[(top * map.width + left) * 4 + channel] * (1 - dx) +
    map.data[(top * map.width + right) * 4 + channel] * dx;
  const bottomColour =
    map.data[(bottom * map.width + left) * 4 + channel] * (1 - dx) +
    map.data[(bottom * map.width + right) * 4 + channel] * dx;
  return topColour * (1 - dy) + bottomColour * dy;
}

export function renderMoonSurface(map: MoonMap, phase: MoonPhase, size = 512) {
  const pixels = new Uint8ClampedArray(size * size * 4);
  const radius = size / 2 - 1;
  for (let row = 0; row < size; row++) {
    const y = (size / 2 - row - 0.5) / radius;
    for (let column = 0; column < size; column++) {
      const x = (column + 0.5 - size / 2) / radius;
      const point = moonMapPoint(x, y);
      if (!point) continue;
      const offset = (row * size + column) * 4;
      const light = moonSurfaceLight(phase, point.normal);
      for (let channel = 0; channel < 3; channel++) {
        pixels[offset + channel] = mapColour(map, point.u, point.v, channel) * light;
      }
      pixels[offset + 3] = Math.min(1, (1 - Math.hypot(x, y)) * radius) * 255;
    }
  }
  return pixels;
}
