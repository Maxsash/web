export type V3 = [number, number, number];
export const normal = (v: V3): V3 => {
  const n = Math.hypot(...v) || 1;
  return v.map((x) => x / n) as V3;
};
export const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
