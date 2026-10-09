import test from "node:test";
import assert from "node:assert/strict";
import { activationFor } from "../lib/feedback/classify.ts";
import { idleLevel } from "../lib/feedback/idle.ts";
import { FEEDBACK, allowed, isAction } from "../lib/feedback/vocabulary.ts";
import { CUES, synthesizeCue } from "../lib/sound/cues.ts";
import { DETENTS, synthesizeDetent } from "../lib/sound/dial.ts";
import { PAGE_TURNS, synthesizePageTurn } from "../lib/sound/page-turn.ts";
import { METER_RATE, momentaryLoudness, peakOf } from "./lib/loudness.mjs";

const sounds = Object.fromEntries(
  Object.entries(CUES).map(([name, cue]) => [name, synthesizeCue(METER_RATE, cue)]),
);

function loudestOnLaptop(samples, gain = 1) {
  const padded = new Float32Array(Math.max(samples.length, METER_RATE / 2));
  samples.forEach((sample, i) => (padded[i] = sample * gain));
  return momentaryLoudness(padded, { laptop: true }).at(-1);
}

const level = (action) =>
  loudestOnLaptop(sounds[FEEDBACK[action].sound], FEEDBACK[action].gain ?? 1);

test("every cue is deterministic, finite, short and starts and ends in silence", () => {
  for (const [name, cue] of Object.entries(CUES)) {
    const sound = sounds[name];
    assert.deepEqual(sound, synthesizeCue(METER_RATE, cue), name);
    assert.equal(sound.length, Math.round(cue.seconds * METER_RATE), name);
    assert.ok(cue.seconds < 3, `${name} lasts ${cue.seconds} s, too long to play unasked`);
    assert.ok(sound.every(Number.isFinite), name);
    assert.ok(Math.abs(peakOf(sound) - cue.peak) < 1e-6, `${name} peak`);
    assert.ok(Math.abs(sound[0]) < 1e-3 && Math.abs(sound.at(-1)) < 1e-3, `${name} edges`);
  }
});

test("cues keep their length at other sample rates", () => {
  for (const rate of [22050, 44100])
    for (const cue of Object.values(CUES))
      assert.equal(synthesizeCue(rate, cue).length, Math.round(cue.seconds * rate));
});

test("every action names a cue that exists, a short buzz and a sentence", () => {
  for (const [action, response] of Object.entries(FEEDBACK)) {
    if (response.sound) assert.ok(Object.hasOwn(CUES, response.sound), action);
    const buzz = [response.haptic ?? 0].flat().reduce((sum, ms) => sum + ms, 0);
    assert.ok(buzz <= 200, `${action} vibrates for ${buzz} ms`);
    if (response.say) assert.match(response.say, /^[A-Z].*\.$/, action);
    assert.ok((response.spacing ?? 0) < 2, action);
  }
  assert.ok(isAction("dice") && isAction("hover"));
  for (const name of ["none", "toString", "", null, undefined]) assert.ok(!isAction(name));
});

test("a burst inside an action's spacing is dropped, never queued", () => {
  assert.ok(allowed(FEEDBACK.hover, 1, undefined));
  assert.ok(!allowed(FEEDBACK.hover, 1.02, 1));
  assert.ok(allowed(FEEDBACK.hover, 1 + FEEDBACK.hover.spacing, 1));
  assert.ok(allowed(FEEDBACK.glide, 1.001, 1), "an action without spacing always answers");
});

test("every cue is heard on a laptop and stays under a page turn", () => {
  const pageTurn = Math.min(
    ...PAGE_TURNS.map((variant) => loudestOnLaptop(synthesizePageTurn(METER_RATE, variant))),
  );
  for (const [action, response] of Object.entries(FEEDBACK)) {
    if (!response.sound) continue;
    const loudness = level(action);
    assert.ok(loudness > -56, `${action} at ${loudness.toFixed(1)} LUFS is lost`);
    assert.ok(loudness < pageTurn, `${action} at ${loudness.toFixed(1)} LUFS is louder`);
  }
});

test("small actions get small sounds: focus under hover, under the dial, under a press", () => {
  const dial = loudestOnLaptop(synthesizeDetent(METER_RATE, DETENTS[0]));
  assert.ok(level("focus") < level("hover"));
  assert.ok(level("hover") < dial);
  assert.ok(level("draw") < dial, "the hero's ink trills under the compass");
  assert.ok(dial < level("press"));
  assert.ok(level("press") < level("dice"), "a roll says more than a press");
});

test("idle deepens at 10, 30 and 60 seconds", () => {
  assert.deepEqual([0, 9.9, 10, 29, 30, 59, 60, 600].map(idleLevel), [0, 0, 1, 1, 2, 2, 3, 3]);
});

test("each activation is read from the element, not from where it sits", () => {
  const here = { origin: "https://www.maxsash.com", pathname: "/", search: "?seed=1" };
  const link = (href, more = {}) => activationFor({ tag: "a", href, location: here, ...more });
  assert.equal(activationFor({ tag: "button" }), "press");
  assert.equal(activationFor({ tag: "summary" }), null, "the toggle answers instead");
  assert.equal(activationFor({ tag: "button", declared: "dice" }), "dice");
  assert.equal(activationFor({ tag: "button", declared: "none" }), null);
  assert.equal(link("#work"), "glide");
  assert.equal(link("mailto:yash@maxsash.com"), "mail");
  assert.equal(link("/api/sea-edition/print?seed=1", { download: true }), "save");
  assert.equal(link("https://github.com/maxsash"), "leave");
  assert.equal(link("/plate?seed=1", { newTab: true }), "leave");
  assert.equal(link("/?seed=1"), "glide", "the page already open scrolls to the top");
  assert.equal(link("/blog"), null, "a new page is its own answer");
  assert.equal(link(null), null);
});
