import type { V3 } from "./vec3.ts";

export const SURFACES = [
  "plain",
  "topsides",
  "brightwork",
  "deck",
  "metal",
  "canvas",
  "rope",
] as const;

export type Surface = (typeof SURFACES)[number];
export type Finish = { color: V3; surface: Surface };

export const finish = (color: V3, surface: Surface): Finish => ({ color, surface });

export const tint = ({ color, surface }: Finish, factor: number): Finish => ({
  color: color.map((v) => v * factor) as V3,
  surface,
});

export const surfaceIndex = (surface: Surface) => SURFACES.indexOf(surface);

export const surfaceGLSL = SURFACES.map(
  (surface, index) => `const int ${surface.toUpperCase()}=${index};`,
).join("\n");
