import test from "node:test";
import assert from "node:assert/strict";
import { PAGE_TURNS, choosePageTurn, synthesizePageTurn } from "../lib/page-turn.ts";

const SAMPLE_RATE = 44100;
const rms = (samples, from, to) => {
  const slice = samples.slice(Math.round(from * SAMPLE_RATE), Math.round(to * SAMPLE_RATE));
  return Math.sqrt(slice.reduce((sum, value) => sum + value * value, 0) / slice.length);
};

test("every variation is deterministic, finite, quiet and under a second", () => {
  for (const variant of PAGE_TURNS) {
    const sound = synthesizePageTurn(SAMPLE_RATE, variant);
    assert.deepEqual(sound, synthesizePageTurn(SAMPLE_RATE, variant));
    assert.ok(sound.length > 0.7 * SAMPLE_RATE && sound.length < SAMPLE_RATE);
    assert.ok(sound.every(Number.isFinite));
    const peak = sound.reduce((max, value) => Math.max(max, Math.abs(value)), 0);
    assert.ok(peak > 0.1 && peak <= 0.15, `peak ${peak}`);
  }
});

test("each variation swells, lands softly and fades without clicks", () => {
  for (const variant of PAGE_TURNS) {
    const sound = synthesizePageTurn(SAMPLE_RATE, variant);
    const { at } = variant.landing;
    const swish = rms(sound, 0.2, 0.35);
    const landing = rms(sound, at, at + 0.06);
    const tail = rms(sound, variant.duration - 0.1, variant.duration - 0.02);
    assert.ok(swish > 4 * tail, "the swell is louder than the tail");
    assert.ok(landing > 0.004, `the page lands audibly (${landing})`);
    assert.ok(landing > 3 * tail, "and then it is quiet");
    assert.ok(landing < swish, "but softer than the swell");
    assert.ok(Math.abs(sound[0]) < 0.005 && Math.abs(sound.at(-1)) < 0.005, "no edge clicks");
  }
});

test("each variation is soft like a breath, not hissy like a tear", () => {
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

test("the variations are different sounds with different lengths", () => {
  const sounds = PAGE_TURNS.map((variant) => synthesizePageTurn(SAMPLE_RATE, variant));
  assert.ok(PAGE_TURNS.length >= 3);
  assert.equal(new Set(sounds.map((sound) => sound.length)).size, sounds.length);
});

test("it works at other sample rates", () => {
  for (const rate of [22050, 48000])
    for (const variant of PAGE_TURNS)
      assert.ok(
        Math.abs(synthesizePageTurn(rate, variant).length / rate - variant.duration) < 0.01,
      );
});

test("a choice never repeats the previous variation and stays within gentle bounds", () => {
  let state = 12345;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const seen = new Set();
  let previous = -1;
  for (let i = 0; i < 200; i++) {
    const choice = choosePageTurn(random, previous);
    assert.notEqual(choice.variant, previous);
    assert.ok(choice.variant >= 0 && choice.variant < PAGE_TURNS.length);
    assert.ok(choice.rate >= 0.96 && choice.rate <= 1.04);
    assert.ok(choice.gain >= 0.85 && choice.gain <= 1.15);
    seen.add(choice.variant);
    previous = choice.variant;
  }
  assert.equal(seen.size, PAGE_TURNS.length, "every variation gets used");
});
