import test from "node:test";
import assert from "node:assert/strict";
import {
  FrameGovernor,
  holdsFrame,
  qualityLabel,
  renderRatio,
  scheduleNextDraw,
} from "../components/observatory/frame-governor.ts";
import { layerOpacities } from "../components/observatory/layer-opacity.ts";
import { chapterFor, revealFor } from "../components/observatory/reveal-mapping.ts";
import { planMove, progressAt, stepStage } from "../components/observatory/stage-director.ts";
import {
  beginGesture,
  swipeDirection,
  trackGesture,
} from "../components/observatory/touch-stages.ts";

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, `${actual}`);

test("stage moves: the opening eases out over 1.8 s, every other move is smootherstep over 0.6 s", () => {
  const opening = planMove(0, 1, 0, 1000);
  assert.deepEqual(opening, { from: 0, target: 0.55, startedAt: 1000, duration: 1800 });
  close(progressAt(opening, 1900, false).progress, 0.55 * 0.75);
  assert.equal(progressAt(opening, 2800, false).finished, true);

  const later = planMove(1, 2, 0.55, 0);
  assert.equal(later.duration, 600);
  close(progressAt(later, 300, false).progress, 0.55 + 0.45 * 0.5);
  assert.deepEqual(progressAt(later, 5, true), { progress: 1, finished: true });
  assert.equal(planMove(1, 0, 0.55, 0).duration, 600);
});

test("stepping clamps to the first and last stage", () => {
  assert.equal(stepStage(0, -1), 0);
  assert.equal(stepStage(0, 1), 1);
  assert.equal(stepStage(2, 1), 2);
});

test("staged phones reveal the sea over the first 0.55 of progress", () => {
  const staged = { reducedMotion: false, staged: true };
  close(revealFor(0.55, staged), (0.55 - 0.14) / 0.75);
  close(revealFor(0.275, staged), (0.275 / 0.55) * ((0.55 - 0.14) / 0.75));
  close(revealFor(1, staged), 1);
  assert.equal(revealFor(0.14, { reducedMotion: false, staged: false }), 0);
  assert.equal(revealFor(0.46, { reducedMotion: true, staged: false }), 1);
  assert.equal(revealFor(0.45, { reducedMotion: true, staged: false }), 0);
});

test("chapters and layer opacities follow progress", () => {
  assert.deepEqual(["sea", "structure", "atlas"], [0, 0.5, 0.9].map(chapterFor));
  assert.deepEqual(layerOpacities(0), [1, 0, 0, 0]);
  assert.deepEqual(layerOpacities(1), [0, 0, 1, 1]);
  assert.ok(layerOpacities(0.45)[1] > 0.99);
});

test("swipes need 35 px of mostly vertical travel and room to move", () => {
  const swipe = (dx, dy, index = 1) => {
    const gesture = beginGesture(100, 100);
    gesture.consumed = trackGesture(gesture, 100 + dx, 100 + dy, { index, count: 3 });
    return swipeDirection(gesture);
  };
  assert.equal(swipe(0, -40), 1);
  assert.equal(swipe(0, 40), -1);
  assert.equal(swipe(0, -34), 0);
  assert.equal(swipe(33, -40), 0);
  assert.equal(swipe(0, 40, 0), 0);
  assert.equal(swipe(0, -40, 2), 0);
});

test("the governor drops quality once, after a slow window of at least 12 frames", () => {
  const governor = new FrameGovernor();
  let degraded = 0;
  for (let frame = 1; frame <= 200; frame++) degraded += governor.observe(frame * 40, 0.04) ? 1 : 0;
  assert.equal(degraded, 1);
  assert.equal(governor.low, true);

  const healthy = new FrameGovernor();
  for (let frame = 1; frame <= 200; frame++) healthy.observe(frame * 16, 0.016);
  assert.equal(healthy.low, false);
});

test("draw pacing holds frames, resets when idle, and caps pixels", () => {
  assert.equal(holdsFrame(100, 98), true);
  assert.equal(holdsFrame(100, 99), false);
  assert.equal(scheduleNextDraw(100, 50, { active: false, scrollChanged: false, low: false }), 0);
  close(scheduleNextDraw(0, 50, { active: true, scrollChanged: false, low: true }), 50 + 1000 / 30);
  close(
    scheduleNextDraw(100, 105, { active: true, scrollChanged: false, low: false }),
    100 + 1000 / 60,
  );
  close(
    renderRatio({ devicePixelRatio: 3, compact: true, width: 390, height: 844, low: true }),
    Math.min(1, Math.sqrt(360000 / (390 * 844))) * 0.7,
  );
  assert.equal(
    renderRatio({ devicePixelRatio: 3, compact: false, width: 800, height: 600, low: false }),
    1.25,
  );
  assert.equal(qualityLabel({ reducedMotion: false, low: false, compact: true }), "compact");
  assert.equal(qualityLabel({ reducedMotion: true, low: true, compact: true }), "still");
});
