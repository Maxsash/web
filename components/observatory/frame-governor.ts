const SAMPLE_WINDOW_MS = 1600;
const MIN_SAMPLES = 12;
const SLOW_SHARE = 0.3;
const COMPACT_PIXEL_CAP = 360000;
const FULL_PIXEL_CAP = 1500000;
export const LOW_QUALITY_RATIO = 0.7;

export class FrameGovernor {
  low = false;
  private windowStart = 0;
  private sampled = 0;
  private slow = 0;

  observe(now: number, intervalSeconds: number) {
    let degraded = false;
    if (now - this.windowStart > SAMPLE_WINDOW_MS) {
      if (this.sampled >= MIN_SAMPLES && this.slow / this.sampled > SLOW_SHARE && !this.low) {
        this.low = true;
        degraded = true;
      }
      this.windowStart = now;
      this.sampled = 0;
      this.slow = 0;
    }
    this.sampled++;
    if (intervalSeconds > (this.low ? 0.058 : 0.029)) this.slow++;
    return degraded;
  }
}

export const drawIntervalMs = (low: boolean) => 1000 / (low ? 30 : 60);

export const holdsFrame = (nextDraw: number, now: number) => nextDraw > now + 1;

export function scheduleNextDraw(
  nextDraw: number,
  now: number,
  mode: { active: boolean; scrollChanged: boolean; low: boolean },
) {
  const interval = drawIntervalMs(mode.low);
  if (!mode.active) return 0;
  return mode.scrollChanged || !nextDraw || now - nextDraw > interval
    ? now + interval
    : nextDraw + interval;
}

export function renderRatio(view: {
  devicePixelRatio: number;
  compact: boolean;
  width: number;
  height: number;
  low: boolean;
}) {
  const pixelCap = view.compact ? COMPACT_PIXEL_CAP : FULL_PIXEL_CAP;
  return (
    Math.min(
      view.devicePixelRatio || 1,
      view.compact ? 1 : 1.25,
      Math.sqrt(pixelCap / (view.width * view.height)),
    ) * (view.low ? LOW_QUALITY_RATIO : 1)
  );
}

export const qualityLabel = (mode: { reducedMotion: boolean; low: boolean; compact: boolean }) =>
  mode.reducedMotion ? "still" : mode.low ? "low" : mode.compact ? "compact" : "high";
