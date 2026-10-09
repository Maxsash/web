import { seededRandom } from "../sea/random.ts";
import { smooth, stateVariableFilter } from "./synth.ts";

type Breaker = { period: number; height: number };

export const SURF = {
  sampleRate: 22050,
  seed: 0x5ea5,
  breakers: [
    { period: 11.2, height: 1 },
    { period: 9.6, height: 0.72 },
    { period: 12.4, height: 0.88 },
  ] satisfies Breaker[],
  approach: 0.34,
  lift: 0.65,
  crash: 0.8,
  wash: 0.3,
  floor: 0.5,
  darkHz: 300,
  brightHz: 1600,
  rumbleHz: 90,
  brightness: 0.6,
  level: 0.026,
};

export const BED = {
  arrive: 0.6,
  leave: 0.25,
  duck: { level: 0.35, attack: 0.05, hold: 0.7, release: 0.4 },
};

export const surfSeconds = () => SURF.breakers.reduce((sum, { period }) => sum + period, 0);

function breakerAt(u: number, { period, height }: Breaker) {
  const crest = SURF.approach * period;
  if (u < 0) return 0;
  if (u < crest) return height * SURF.lift * smooth(u / crest) ** 1.5;
  const after = u - crest;
  const crashed = SURF.lift + (1 - SURF.lift) * smooth(after / SURF.crash);
  return height * crashed * Math.exp(-Math.max(0, after - SURF.crash) / (SURF.wash * period));
}

function swellAt(t: number) {
  const loop = surfSeconds();
  let start = 0;
  let swell = 0;
  for (const breaker of SURF.breakers) {
    swell = Math.max(swell, breakerAt(t - start, breaker), breakerAt(t + loop - start, breaker));
    start += breaker.period;
  }
  return Math.min(1, swell);
}

export function synthesizeSurf(sampleRate: number): Float32Array<ArrayBuffer> {
  const loop = Math.round(surfSeconds() * sampleRate);
  const seam = Math.round(0.5 * sampleRate);
  const random = seededRandom(SURF.seed);
  const wash = stateVariableFilter();
  const rumble = stateVariableFilter();
  const rendered = new Float32Array(loop + seam);
  const block = 64;
  let hz = 0;
  let loudness = 0;
  for (let i = 0; i < rendered.length; i++) {
    if (i % block === 0) {
      const swell = swellAt((i / sampleRate) % surfSeconds());
      hz = SURF.darkHz + (SURF.brightHz - SURF.darkHz) * swell ** 1.5;
      loudness = (SURF.floor + (1 - SURF.floor) * swell) * (SURF.darkHz / hz) ** SURF.brightness;
    }
    const water = wash(random() * 2 - 1, hz, sampleRate, 0.7).low;
    rendered[i] = rumble(water, SURF.rumbleHz, sampleRate, 0.7).high * loudness;
  }
  const samples = rendered.slice(0, loop);
  for (let i = 0; i < seam; i++) {
    const angle = (Math.PI / 2) * (i / seam);
    samples[i] = rendered[i] * Math.sin(angle) + rendered[loop + i] * Math.cos(angle);
  }
  let power = 0;
  for (const sample of samples) power += sample * sample;
  const scale = SURF.level / Math.sqrt(power / loop);
  for (let i = 0; i < loop; i++) samples[i] *= scale;
  return samples;
}
