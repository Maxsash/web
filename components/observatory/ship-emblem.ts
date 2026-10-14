import type { ShipBuilder, ShipPoint } from "./ship-builder.ts";
import { finish } from "./ship-surfaces.ts";

type EmblemPoint = (u: number, v: number, lift: number) => ShipPoint;

const amber = finish([1, 0.61, 0.12], "plain");
const rim = finish([0.76, 0.3, 0.035], "plain");
const red = finish([0.78, 0.09, 0.045], "plain");

export function buildSailEmblem(mesh: ShipBuilder, point: EmblemPoint) {
  const segments = 32;
  const circle = (index: number, radius: number) => {
    const angle = (index / segments) * Math.PI * 2;
    return point(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.012);
  };
  const center = point(0, 0, 0.012);
  for (let i = 0; i < segments; i++) {
    const a = circle(i, 0.92),
      b = circle(i + 1, 0.92),
      c = circle(i + 1, 1),
      d = circle(i, 1);
    mesh.cloth(center, a, b, amber);
    mesh.cloth(a, d, c, rim);
    mesh.cloth(a, c, b, rim);
  }
  for (const u of [-0.32, 0.32])
    for (const v of [-0.32, 0.32]) {
      const starCenter = point(u, v, 0.022);
      const tip = (index: number) => {
        const angle = Math.PI / 2 + (index * Math.PI) / 5;
        const radius = index % 2 ? 0.09 : 0.205;
        return point(u + Math.cos(angle) * radius, v + Math.sin(angle) * radius, 0.022);
      };
      for (let i = 0; i < 10; i++) mesh.cloth(starCenter, tip(i), tip(i + 1), red);
    }
}
