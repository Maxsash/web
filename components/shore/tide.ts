import type { ShorePalette } from "./palette.ts";

export type ShoreView = { width: number; height: number; time: number };

export const shorelineAt = ({ width, height, time }: ShoreView, x: number) =>
  height *
  (0.085 +
    0.01 * Math.sin((x / width) * 7 + time * 0.35) +
    0.006 * Math.sin((x / width) * 17 - time * 0.21) +
    0.014 * Math.sin(time * 0.55));

function traceCoast(context: CanvasRenderingContext2D, view: ShoreView, offset: number) {
  const { width } = view;
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(width, 0);
  context.lineTo(width, shorelineAt(view, width) + offset);
  for (let x = width; x >= 0; x -= 8) context.lineTo(x, shorelineAt(view, x) + offset);
  context.lineTo(0, shorelineAt(view, 0) + offset);
  context.closePath();
}

export function drawWetSand(
  context: CanvasRenderingContext2D,
  view: ShoreView,
  palette: ShorePalette,
) {
  traceCoast(context, view, view.height * 0.035);
  context.fillStyle = palette.wetSand;
  context.fill();
}

export function drawSurf(
  context: CanvasRenderingContext2D,
  view: ShoreView,
  palette: ShorePalette,
) {
  const { width, height, time } = view;
  const water = context.createLinearGradient(0, 0, 0, height * 0.14);
  water.addColorStop(0, palette.water[0]);
  water.addColorStop(0.55, palette.water[1]);
  water.addColorStop(1, palette.water[2]);
  traceCoast(context, view, 0);
  context.fillStyle = water;
  context.fill();
  for (let j = 0; j < 3; j++) {
    context.beginPath();
    for (let x = 0; x <= width + 8; x += 8) {
      const y =
        shorelineAt(view, x) - j * height * 0.012 - 3 * Math.sin(x * 0.035 + time * 0.7 + j);
      if (x === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.strokeStyle = j === 0 ? palette.foam : palette.faintFoam;
    context.lineWidth = j === 0 ? 3 : 1;
    context.stroke();
  }
  context.strokeStyle = palette.bubbles;
  context.lineWidth = 0.7;
  for (let x = 0; x < width; x += 11) {
    const y = shorelineAt(view, x) + 3 * Math.sin(x * 0.05 + time);
    context.beginPath();
    context.ellipse(x, y, 3.5, 1.4, 0, 0, Math.PI * 2);
    context.stroke();
  }
}
