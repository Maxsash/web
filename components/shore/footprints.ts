import type { ShorePalette } from "./palette.ts";

type Step = { x: number; y: number; angle: number; born: number; side: number };

const LIFETIME_SECONDS = 24;
const MAX_STEPS = 48;
const STRIDE_PX = 14;

export class FootTrail {
  steps: Step[] = [];
  private previous: { x: number; y: number } | null = null;
  private side = 1;

  clear() {
    this.steps = [];
  }

  lift() {
    this.previous = null;
  }

  track(x: number, y: number, time: number) {
    if (!this.previous) {
      this.previous = { x, y };
      return false;
    }
    const dx = x - this.previous.x,
      dy = y - this.previous.y;
    if (Math.hypot(dx, dy) <= STRIDE_PX) return false;
    this.side *= -1;
    this.steps.push({
      x,
      y,
      angle: Math.atan2(dy, dx) + Math.PI / 2,
      born: time,
      side: this.side,
    });
    this.steps = this.steps.slice(-MAX_STEPS);
    this.previous = { x, y };
    return true;
  }

  fade(time: number, shorelineAt: (x: number) => number) {
    this.steps = this.steps.filter(
      (step) => time - step.born < LIFETIME_SECONDS && step.y > shorelineAt(step.x) + 8,
    );
  }

  draw(context: CanvasRenderingContext2D, time: number, palette: ShorePalette) {
    for (const step of this.steps) {
      context.save();
      context.translate(step.x, step.y);
      context.rotate(step.angle);
      context.globalAlpha = Math.max(0, 1 - (time - step.born) / LIFETIME_SECONDS) * 0.33;
      context.fillStyle = palette.footprint;
      context.beginPath();
      context.ellipse(step.side * 4, 0, 3, 8, 0, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = palette.footprintHighlight;
      context.lineWidth = 1;
      context.beginPath();
      context.ellipse(step.side * 4 + 1, 1, 3, 8, 0, 0, Math.PI);
      context.stroke();
      context.restore();
    }
  }
}
