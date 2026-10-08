import type { ShorePalette } from "./palette.ts";

const SHELLS = [
  [0.07, 0.55, 11, 0.3],
  [0.93, 0.48, 15, -0.4],
  [0.86, 0.8, 8, 0.7],
  [0.16, 0.89, 6, -0.5],
  [0.6, 0.43, 8, 1.2],
];

function drawShell(
  context: CanvasRenderingContext2D,
  palette: ShorePalette,
  x: number,
  y: number,
  size: number,
  angle: number,
) {
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.shadowColor = "rgba(38,25,17,.3)";
  context.shadowBlur = 3;
  context.shadowOffsetY = 2;
  const tint = context.createLinearGradient(-size, -size, size, size);
  tint.addColorStop(0, palette.shell[0]);
  tint.addColorStop(0.55, palette.shell[1]);
  tint.addColorStop(1, palette.shell[2]);
  context.fillStyle = tint;
  context.beginPath();
  context.moveTo(0, size * 0.45);
  context.bezierCurveTo(-size * 1.1, size * 0.3, -size, -size * 0.85, 0, -size);
  context.bezierCurveTo(size, -size * 0.85, size * 1.1, size * 0.3, 0, size * 0.45);
  context.fill();
  context.shadowBlur = 0;
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (1.12 + i * 0.095);
    context.beginPath();
    context.moveTo(0, size * 0.4);
    context.quadraticCurveTo(
      Math.cos(a) * size * 0.6,
      Math.sin(a) * size * 0.5,
      Math.cos(a) * size,
      Math.sin(a) * size,
    );
    context.strokeStyle = i % 2 ? "#fff5d555" : "#73554055";
    context.lineWidth = 0.7;
    context.stroke();
  }
  context.restore();
}

function paintGrain(
  context: CanvasRenderingContext2D,
  palette: ShorePalette,
  width: number,
  height: number,
) {
  const pixels = context.createImageData(width, height);
  const [red, green, blue] = palette.sand;
  let seed = 517;
  for (let i = 0; i < pixels.data.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const noise = (seed / 4294967296 - 0.5) * 24;
    const y = Math.floor(i / 4 / width) / height;
    const shade = 8 * Math.sin(y * 4);
    pixels.data[i] = red + noise + shade;
    pixels.data[i + 1] = green + noise + shade;
    pixels.data[i + 2] = blue + noise + shade;
    pixels.data[i + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);
}

export function paintSand(
  context: CanvasRenderingContext2D,
  palette: ShorePalette,
  width: number,
  height: number,
) {
  paintGrain(context, palette, width, height);
  SHELLS.forEach(([x, y, size, angle]) =>
    drawShell(context, palette, x * width, y * height, size * Math.max(0.65, width / 1100), angle),
  );
  context.strokeStyle = palette.trackLine;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(width * 0.89, height * 0.69);
  context.bezierCurveTo(
    width * 0.91,
    height * 0.72,
    width * 0.87,
    height * 0.75,
    width * 0.91,
    height * 0.78,
  );
  context.stroke();
}
