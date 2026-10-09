export const METER_RATE = 48000;

export const rms = (samples, from, to, sampleRate) => {
  const slice = samples.slice(Math.round(from * sampleRate), Math.round(to * sampleRate));
  return Math.sqrt(slice.reduce((sum, value) => sum + value * value, 0) / slice.length);
};

export const peakOf = (samples) =>
  samples.reduce((max, value) => Math.max(max, Math.abs(value)), 0);

export function lcg(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function biquad([b0, b1, b2], [a1, a2]) {
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  return (x) => {
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    [x2, x1, y2, y1] = [x1, x, y1, y];
    return y;
  };
}

export function butterworthHighpass(hz) {
  const w = (2 * Math.PI * hz) / METER_RATE;
  const alpha = Math.sin(w) / Math.SQRT2;
  const a0 = 1 + alpha;
  const b = (1 + Math.cos(w)) / 2 / a0;
  return biquad([b, -2 * b, b], [(-2 * Math.cos(w)) / a0, (1 - alpha) / a0]);
}

/** ITU-R BS.1770 momentary loudness (400 ms windows every 100 ms) at 48 kHz, in LUFS.
 * The laptop variant first removes what small speakers cannot play (below about 180 Hz). */
export function momentaryLoudness(samples, { laptop = false } = {}) {
  const stages = [
    biquad(
      [1.53512485958697, -2.69169618940638, 1.19839281085285],
      [-1.69065929318241, 0.73248077421585],
    ),
    biquad([1, -2, 1], [-1.99004745483398, 0.99007225036621]),
    ...(laptop ? [butterworthHighpass(180), butterworthHighpass(180)] : []),
  ];
  const window = 0.4 * METER_RATE;
  const hop = 0.1 * METER_RATE;
  const loudness = [];
  let sum = 0;
  const squares = new Float64Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    squares[i] = stages.reduce((value, stage) => stage(value), samples[i]) ** 2;
    sum += squares[i] - (i >= window ? squares[i - window] : 0);
    if (i >= window - 1 && (i + 1 - window) % hop === 0)
      loudness.push(-0.691 + 10 * Math.log10(Math.max(sum, 1e-20) / window));
  }
  return loudness.sort((a, b) => a - b);
}

export const percentile = (sorted, p) => sorted[Math.floor(p * (sorted.length - 1))];
