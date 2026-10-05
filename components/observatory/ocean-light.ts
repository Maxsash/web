/** Shared screen anchor for the sky disc and the world-space illumination ray. */
export const SEA_LIGHT_SCREEN = [.76, .74] as const;
export const SEA_HALF_FOV = Math.PI / 7;
type Vector = [number, number, number];
const normalize = (v: Vector): Vector => { const length = Math.hypot(...v) || 1; return v.map(x => x / length) as Vector; };
const cross = (a: Vector, b: Vector): Vector => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];

export function seaLightDirection(eye: Vector, target: Vector, aspect: number): Vector {
  const forward = normalize(target.map((value, i) => value - eye[i]) as Vector);
  const right = normalize(cross(forward, [0, 1, 0])), up = cross(right, forward);
  const x = (SEA_LIGHT_SCREEN[0] * 2 - 1) * Math.tan(SEA_HALF_FOV) * aspect;
  const y = (SEA_LIGHT_SCREEN[1] * 2 - 1) * Math.tan(SEA_HALF_FOV);
  return normalize(forward.map((value, i) => value + right[i] * x + up[i] * y) as Vector);
}
