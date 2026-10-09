/** Write the site's sounds to tools/.out/ as WAV files, to hear them in any player:
 * page-turn-1…4.wav, waves.wav (the loop twice, so the seam can be heard), dial.wav
 * (the compass bezel turning faster and slower, alone and over the waves), and every feedback
 * action at its level in lib/feedback/vocabulary.ts, alone (action-<name>.wav) and over the waves
 * (actions-over-waves.wav, one every second in the table's order).
 * node tools/render-sounds.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { FEEDBACK } from "../lib/feedback/vocabulary.ts";
import { CUES, synthesizeCue } from "../lib/sound/cues.ts";
import { DETENTS, chooseDetent, clickTimes, synthesizeDetent } from "../lib/sound/dial.ts";
import { PAGE_TURNS, synthesizePageTurn } from "../lib/sound/page-turn.ts";
import { synthesizeSurf } from "../lib/sound/surf.ts";
import { seededRandom } from "../lib/sea/random.ts";

const SAMPLE_RATE = 44100;

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((sample, i) =>
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), i * 2),
  );
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

function write(name, samples) {
  writeFileSync(`tools/.out/${name}.wav`, wav(samples));
  console.log(`Wrote tools/.out/${name}.wav`);
}

function mixAt(out, clip, at, { gain = 1, rate = 1 } = {}) {
  const start = Math.round(at * SAMPLE_RATE);
  for (let i = 0; i * rate < clip.length - 1 && start + i < out.length; i++) {
    const position = i * rate;
    const index = Math.floor(position);
    const blend = position - index;
    out[start + i] += gain * (clip[index] * (1 - blend) + clip[index + 1] * blend);
  }
}

function dialTurn(seconds) {
  const clicks = DETENTS.map((detent) => synthesizeDetent(SAMPLE_RATE, detent));
  const out = new Float32Array(Math.round(seconds * SAMPLE_RATE));
  const random = seededRandom(1);
  let previous = -1;
  let last = 0;
  for (let frame = 0; frame * (1 / 60) < seconds - 0.2; frame++) {
    const now = frame / 60;
    const speed = Math.sin((Math.PI * now) / seconds) ** 2;
    const turned = Math.round(speed * 3 * random());
    for (const at of clickTimes(now, last, turned)) {
      const { variant, rate, gain } = chooseDetent(random, previous);
      previous = variant;
      last = at;
      mixAt(out, clicks[variant], at, { gain, rate });
    }
  }
  return out;
}

mkdirSync("tools/.out", { recursive: true });
PAGE_TURNS.forEach((variant, index) =>
  write(`page-turn-${index + 1}`, synthesizePageTurn(SAMPLE_RATE, variant)),
);
const loop = synthesizeSurf(SAMPLE_RATE);
const waves = new Float32Array(loop.length * 2);
waves.set(loop);
waves.set(loop, loop.length);
write("waves", waves);
const turn = dialTurn(4);
write("dial", turn);
write(
  "dial-over-waves",
  turn.map((sample, i) => sample + loop[i]),
);

const actions = Object.entries(FEEDBACK).filter(([, response]) => response.sound);
const tour = new Float32Array(Math.max(loop.length, (actions.length + 3) * SAMPLE_RATE));
actions.forEach(([action, response], index) => {
  const clip = synthesizeCue(SAMPLE_RATE, CUES[response.sound]);
  const alone = new Float32Array(Math.ceil(clip.length / (response.rate ?? 1)) + 1);
  mixAt(alone, clip, 0, response);
  write(`action-${action}`, alone);
  mixAt(tour, clip, index + 1, response);
});
write(
  "actions-over-waves",
  tour.map((sample, i) => sample + loop[i % loop.length]),
);
