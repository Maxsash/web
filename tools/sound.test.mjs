import test from "node:test";
import assert from "node:assert/strict";
import {
  DETENTS,
  DIAL,
  chooseDetent,
  clickTimes,
  ratchet,
  synthesizeDetent,
} from "../lib/sound/dial.ts";
import {
  PAGE_TURNS,
  choosePageTurn,
  synthesizePageTurn,
  turnsPage,
} from "../lib/sound/page-turn.ts";
import { BED, SURF, surfSeconds, synthesizeSurf } from "../lib/sound/surf.ts";
import {
  METER_RATE,
  butterworthHighpass,
  lcg,
  momentaryLoudness,
  peakOf,
  percentile,
  rms,
} from "./lib/loudness.mjs";

const SAMPLE_RATE = 44100;

function trill(clicksPerSecond, seconds) {
  const clicks = DETENTS.map((detent) => synthesizeDetent(METER_RATE, detent));
  const out = new Float32Array(Math.round(seconds * METER_RATE));
  const random = lcg(7);
  let previous = -1;
  for (let at = 0.1; at < seconds - DIAL.duration; at += 1 / clicksPerSecond) {
    const { variant, gain } = chooseDetent(random, previous);
    previous = variant;
    out.set(
      clicks[variant].map((sample) => sample * gain),
      Math.round(at * METER_RATE),
    );
  }
  return out;
}

const surf = synthesizeSurf(METER_RATE);
const surfOnLaptop = momentaryLoudness(surf, { laptop: true });
const loudestPageTurn = (variant) =>
  momentaryLoudness(synthesizePageTurn(METER_RATE, variant), { laptop: true }).at(-1);

test("every page turn is deterministic, finite, quiet and under a second", () => {
  for (const variant of PAGE_TURNS) {
    const sound = synthesizePageTurn(SAMPLE_RATE, variant);
    assert.deepEqual(sound, synthesizePageTurn(SAMPLE_RATE, variant));
    assert.ok(sound.length > 0.7 * SAMPLE_RATE && sound.length < SAMPLE_RATE);
    assert.ok(sound.every(Number.isFinite));
    const peak = peakOf(sound);
    assert.ok(peak > 0.1 && peak <= 0.15, `peak ${peak}`);
  }
});

test("each page turn swells, lands softly and fades without clicks", () => {
  for (const variant of PAGE_TURNS) {
    const sound = synthesizePageTurn(SAMPLE_RATE, variant);
    const { at } = variant.landing;
    const swish = rms(sound, 0.2, 0.35, SAMPLE_RATE);
    const landing = rms(sound, at, at + 0.06, SAMPLE_RATE);
    const tail = rms(sound, variant.duration - 0.1, variant.duration - 0.02, SAMPLE_RATE);
    assert.ok(swish > 4 * tail, "the swell is louder than the tail");
    assert.ok(landing > 0.004, `the page lands audibly (${landing})`);
    assert.ok(landing > 3 * tail, "and then it is quiet");
    assert.ok(landing < swish, "but softer than the swell");
    assert.ok(Math.abs(sound[0]) < 0.005 && Math.abs(sound.at(-1)) < 0.005, "no edge clicks");
  }
});

test("each page turn is soft like a breath, not hissy like a tear", () => {
  for (const variant of PAGE_TURNS) {
    const sound = synthesizePageTurn(SAMPLE_RATE, variant);
    let energy = 0;
    let change = 0;
    for (let i = 1; i < sound.length; i++) {
      energy += sound[i] ** 2;
      change += (sound[i] - sound[i - 1]) ** 2;
    }
    const hissiness = Math.sqrt(change / energy);
    assert.ok(hissiness < 0.3, `hissiness ${hissiness.toFixed(2)} (white noise is about 1.4)`);
  }
});

test("the page turns are different sounds with different lengths", () => {
  const sounds = PAGE_TURNS.map((variant) => synthesizePageTurn(SAMPLE_RATE, variant));
  assert.ok(PAGE_TURNS.length >= 3);
  assert.equal(new Set(sounds.map((sound) => sound.length)).size, sounds.length);
});

test("the page turn works at other sample rates", () => {
  for (const rate of [22050, 48000])
    for (const variant of PAGE_TURNS)
      assert.ok(
        Math.abs(synthesizePageTurn(rate, variant).length / rate - variant.duration) < 0.01,
      );
});

test("a page turns on the way into the notebook and between its pages, never in place", () => {
  assert.ok(turnsPage("/", "/blog"));
  assert.ok(turnsPage("/blog", "/blog/three-waves-one-sea"));
  assert.ok(turnsPage("/blog/three-waves-one-sea", "/blog"));
  assert.ok(!turnsPage("/blog", "/blog"));
  assert.ok(!turnsPage("/blog", "/"));
  assert.ok(!turnsPage("/", "/plate"));
});

test("a choice never repeats the previous take and stays within gentle bounds", () => {
  for (const [choose, takes, rate, gain] of [
    [choosePageTurn, PAGE_TURNS.length, 0.04, 0.15],
    [chooseDetent, DETENTS.length, 0.02, 0.15],
  ]) {
    const random = lcg(12345);
    const seen = new Set();
    let previous = -1;
    for (let i = 0; i < 200; i++) {
      const choice = choose(random, previous);
      assert.notEqual(choice.variant, previous);
      assert.ok(choice.variant >= 0 && choice.variant < takes);
      assert.ok(Math.abs(choice.rate - 1) <= rate && Math.abs(choice.gain - 1) <= gain);
      seen.add(choice.variant);
      previous = choice.variant;
    }
    assert.equal(seen.size, takes, "every take gets used");
  }
});

test("the surf is one deterministic loop with no audible seam", () => {
  const again = synthesizeSurf(METER_RATE);
  assert.ok(surf.every((sample, i) => sample === again[i]));
  assert.equal(surf.length, Math.round(surfSeconds() * METER_RATE));
  assert.ok(surf.every(Number.isFinite));
  let change = 0;
  for (let i = 1; i < surf.length; i++) change += (surf[i] - surf[i - 1]) ** 2;
  const step = Math.sqrt(change / surf.length);
  assert.ok(Math.abs(surf[0] - surf.at(-1)) < 3 * step, "the end runs on into the start");
  const playback = synthesizeSurf(SURF.sampleRate);
  assert.equal(playback.length, Math.round(surfSeconds() * SURF.sampleRate));
});

test("the surf can be heard on a laptop's speakers, and never drops to silence", () => {
  const median = percentile(surfOnLaptop, 0.5);
  assert.ok(median > -36 && median < -32, `median ${median.toFixed(1)} LUFS`);
  assert.ok(surfOnLaptop[0] > -40, `quietest ${surfOnLaptop[0].toFixed(1)} LUFS`);
  assert.ok(peakOf(surf) < 0.25, "with room to spare");
});

test("the surf rises and falls like waves, but gently", () => {
  const swing = surfOnLaptop.at(-1) - percentile(surfOnLaptop, 0.5);
  assert.ok(swing > 3 && swing < 8, `crests ${swing.toFixed(1)} dB over the median`);
  const lulls = percentile(surfOnLaptop, 0.5) - percentile(surfOnLaptop, 0.1);
  assert.ok(lulls > 1.5, `lulls ${lulls.toFixed(1)} dB under the median`);
});

test("the surf is a wash, not a hiss", () => {
  const onLaptop = momentaryLoudness(surf, { laptop: true });
  const full = momentaryLoudness(surf);
  assert.ok(
    Math.abs(percentile(full, 0.5) - percentile(onLaptop, 0.5)) < 3,
    "most of it is in the range small speakers play",
  );
  let energy = 0;
  let change = 0;
  for (let i = 1; i < surf.length; i++) {
    energy += surf[i] ** 2;
    change += (surf[i] - surf[i - 1]) ** 2;
  }
  const hissiness = Math.sqrt(change / energy);
  assert.ok(hissiness < 0.2, `hissiness ${hissiness.toFixed(2)} (white noise is about 1.4)`);
});

test("a page turn stands clear of the waves it ducks", () => {
  const ducked = percentile(surfOnLaptop, 0.5) + 20 * Math.log10(BED.duck.level);
  for (const variant of PAGE_TURNS)
    assert.ok(loudestPageTurn(variant) - ducked > 10, `seed ${variant.seed}`);
});

test("every detent is a sharp tick, not a bubbly ring", () => {
  const energy = (samples) => samples.reduce((sum, sample) => sum + sample * sample, 0);
  for (const detent of DETENTS) {
    const click = synthesizeDetent(METER_RATE, detent);
    assert.deepEqual(click, synthesizeDetent(METER_RATE, detent));
    assert.equal(click.length, Math.round(DIAL.duration * METER_RATE));
    const peak = peakOf(click);
    assert.ok(Math.abs(peak - DIAL.peak) < 1e-6, `peak ${peak}`);
    const total = energy(click);
    const ringing = 1 - energy(click.subarray(0, 0.003 * METER_RATE)) / total;
    assert.ok(ringing < 0.02, `${(100 * ringing).toFixed(1)}% still rings after 3 ms`);
    const [first, second] = [butterworthHighpass(2000), butterworthHighpass(2000)];
    const bright = energy(click.map((sample) => second(first(sample)))) / total;
    assert.ok(
      bright > 0.75,
      `only ${(100 * bright).toFixed(0)}% above 2 kHz, so it sounds muffled`,
    );
    assert.ok(Math.abs(click.at(-1)) < 0.001, "it ends in silence");
  }
});

test("a full turn of the dial is a trill under the page turn, and a slow one still ticks", () => {
  const fast = momentaryLoudness(trill(1 / DIAL.trill, 1.5), { laptop: true }).at(-1);
  const quietestPageTurn = Math.min(...PAGE_TURNS.map(loudestPageTurn));
  assert.ok(fast < quietestPageTurn - 1, `trill ${fast.toFixed(1)} LUFS`);
  const slow = momentaryLoudness(trill(4, 1.5), { laptop: true }).at(-1);
  assert.ok(slow > -48, `ticks ${slow.toFixed(1)} LUFS`);
});

test("the ratchet clicks once per detent either way and turns silently on a jump", () => {
  assert.deepEqual(ratchet(null, 3.2), { detent: 3, clicks: 0 });
  assert.deepEqual(ratchet(3, 5.6), { detent: 6, clicks: 3 });
  assert.deepEqual(ratchet(6, 2.4), { detent: 2, clicks: 4 });
  assert.deepEqual(ratchet(2, 2.3), { detent: 2, clicks: 0 });
  assert.equal(ratchet(-20, 20).clicks, 0, "a link or a restored scroll moves without sound");
});

test("clicks never come faster than a trill or pile up ahead", () => {
  const times = clickTimes(10, 9.99, 20);
  assert.ok(times.length > 0);
  assert.ok(times[0] >= 9.99 + DIAL.trill - 1e-9 && times[0] >= 10);
  for (let i = 1; i < times.length; i++) assert.ok(times[i] - times[i - 1] >= DIAL.trill - 1e-9);
  assert.ok(times.at(-1) <= 10 + DIAL.lead);
  assert.deepEqual(clickTimes(10, 0, 2), [10, 10 + DIAL.trill]);
  assert.deepEqual(clickTimes(10, 9.99, 0), []);
});
