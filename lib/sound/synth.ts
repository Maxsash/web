export function stateVariableFilter() {
  const state = { low: 0, band: 0, high: 0 };
  let tuned = NaN;
  let frequency = 0;
  return (input: number, hz: number, sampleRate: number, quality: number) => {
    if (hz !== tuned) {
      tuned = hz;
      frequency = 2 * Math.sin((Math.PI * hz) / sampleRate);
    }
    state.low += frequency * state.band;
    state.high = input - state.low - state.band / quality;
    state.band += frequency * state.high;
    return state;
  };
}

export const smooth = (t: number) => Math.sin((Math.PI / 2) * Math.min(1, Math.max(0, t))) ** 2;

export function scaleToPeak(
  samples: Float32Array<ArrayBuffer>,
  peak: number,
  fadeSeconds: number,
  sampleRate: number,
) {
  const fade = Math.max(1, Math.round(fadeSeconds * sampleRate));
  for (let i = 0; i < samples.length; i++)
    samples[i] *= Math.min(1, i / fade, (samples.length - 1 - i) / fade);
  const loudest = samples.reduce((max, sample) => Math.max(max, Math.abs(sample)), 0);
  const scale = loudest ? peak / loudest : 0;
  for (let i = 0; i < samples.length; i++) samples[i] *= scale;
  return samples;
}

export function chooseTake(
  random: () => number,
  takes: number,
  previous: number,
  spread: { rate: number; gain: number },
) {
  const others = Array.from({ length: takes }, (_, index) => index).filter(
    (index) => index !== previous,
  );
  return {
    variant: others[Math.floor(random() * others.length)],
    rate: 1 + spread.rate * (random() * 2 - 1),
    gain: 1 + spread.gain * (random() * 2 - 1),
  };
}
