import { seededRandom } from "../sea/random.ts";
import { chooseTake, scaleToPeak, stateVariableFilter } from "./synth.ts";

type Mode = { hz: number; decay: number };
type Detent = { seed: number; modes: Mode[]; catchAfter: number; catchLevel: number };

export const DIAL = {
  degreesPerDetent: 1,
  trill: 1 / 32,
  lead: 0.1,
  jump: 12,
  duration: 0.015,
  peak: 0.2,
  snapDecay: 0.0002,
  snapHz: 1800,
  ring: 0.6,
};

const STEEL: Detent = {
  seed: 0xd1a1,
  modes: [
    { hz: 3600, decay: 0.0005 },
    { hz: 5900, decay: 0.00035 },
    { hz: 8300, decay: 0.00025 },
  ],
  catchAfter: 0.0018,
  catchLevel: 0.45,
};

export const DETENTS: Detent[] = [
  STEEL,
  {
    seed: 0x7e3b,
    modes: [
      { hz: 3350, decay: 0.00055 },
      { hz: 6200, decay: 0.0004 },
      { hz: 7900, decay: 0.00025 },
    ],
    catchAfter: 0.0015,
    catchLevel: 0.5,
  },
  {
    seed: 0x45c9,
    modes: [
      { hz: 3900, decay: 0.00045 },
      { hz: 5600, decay: 0.0003 },
      { hz: 8800, decay: 0.0002 },
    ],
    catchAfter: 0.0022,
    catchLevel: 0.38,
  },
];

export const chooseDetent = (random: () => number, previous = -1) =>
  chooseTake(random, DETENTS.length, previous, { rate: 0.02, gain: 0.15 });

export function synthesizeDetent(
  sampleRate: number,
  { seed, modes, catchAfter, catchLevel }: Detent = DETENTS[0],
): Float32Array<ArrayBuffer> {
  const random = seededRandom(seed);
  const phases = modes.map(() => random() * 2 * Math.PI);
  const crisp = stateVariableFilter();
  const samples = new Float32Array(Math.round(DIAL.duration * sampleRate));
  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    const struck = (decay: number) =>
      Math.exp(-t / decay) +
      (t >= catchAfter ? catchLevel * Math.exp(-(t - catchAfter) / decay) : 0);
    const noise = (random() * 2 - 1) * struck(DIAL.snapDecay);
    const snap = crisp(noise, DIAL.snapHz, sampleRate, 0.7).high;
    const ring = modes.reduce(
      (sum, { hz, decay }, mode) =>
        sum + Math.sin(2 * Math.PI * hz * t + phases[mode]) * struck(decay),
      0,
    );
    samples[i] = snap + DIAL.ring * ring;
  }
  return scaleToPeak(samples, DIAL.peak, 0.00005, sampleRate);
}

export function ratchet(previous: number | null, degrees: number) {
  const detent = Math.round(degrees / DIAL.degreesPerDetent);
  const turned = previous === null ? 0 : Math.abs(detent - previous);
  return { detent, clicks: turned > DIAL.jump ? 0 : turned };
}

export function clickTimes(now: number, last: number, clicks: number) {
  const times: number[] = [];
  for (
    let at = Math.max(now, last + DIAL.trill);
    times.length < clicks && at <= now + DIAL.lead;
    at += DIAL.trill
  )
    times.push(at);
  return times;
}
