import { mix } from "../observatory/vec3.ts";
import type { Facet, Tone } from "./body.ts";

type Colour = [number, number, number];
type Plumage = Record<Tone, Colour>;
export type Look = { night: boolean; ink: number; opacity: number };

const DAY: Plumage = {
  white: [0.96, 0.95, 0.9],
  back: [0.62, 0.68, 0.7],
  under: [0.88, 0.9, 0.89],
  tip: [0.13, 0.16, 0.17],
  bill: [0.93, 0.74, 0.3],
  leg: [0.89, 0.63, 0.56],
  eye: [0.08, 0.1, 0.1],
};
const MOONLIT: Colour = [0.78, 0.84, 0.92];
const PAPER = { day: [0.91, 0.9, 0.85] as Colour, night: [0.07, 0.13, 0.15] as Colour };
const LINE = { day: [0.094, 0.208, 0.22] as Colour, night: [0.85, 0.89, 0.86] as Colour };
const SOLID_IN_INK = new Set<Tone>(["tip", "eye"]);

const css = ([r, g, b]: Colour, alpha = 1) =>
  `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)} / ${alpha})`;
const blend = (a: Colour, b: Colour, t: number): Colour => [
  mix(a[0], b[0], t),
  mix(a[1], b[1], t),
  mix(a[2], b[2], t),
];

function plumage(facet: Facet, night: boolean): Colour {
  const lit = DAY[facet.tone].map((c) => (facet.tone === "eye" ? c : Math.min(1, c * facet.light)));
  return (night ? lit.map((c, i) => c * MOONLIT[i]) : lit) as Colour;
}

function engraved(facet: Facet, night: boolean): Colour {
  const paper = night ? PAPER.night : PAPER.day,
    line = night ? LINE.night : LINE.day;
  return SOLID_IN_INK.has(facet.tone) ? line : blend(line, paper, 0.88 + 0.12 * facet.light);
}

export function paintGull(
  context: CanvasRenderingContext2D,
  facets: Facet[],
  { night, ink, opacity }: Look,
) {
  context.globalAlpha = opacity;
  context.lineJoin = "round";
  const line = night ? LINE.night : LINE.day;
  for (const facet of facets) {
    const fill = blend(plumage(facet, night), engraved(facet, night), ink);
    context.beginPath();
    facet.points.forEach(([x, y], i) => (i ? context.lineTo(x, y) : context.moveTo(x, y)));
    context.closePath();
    context.fillStyle = css(fill);
    context.fill();
    context.strokeStyle = css(blend(fill, line, ink));
    context.lineWidth = mix(0.6, 0.9, ink);
    context.stroke();
  }
  context.globalAlpha = 1;
}
