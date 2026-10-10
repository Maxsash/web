import test from "node:test";
import assert from "node:assert/strict";
import { SITTING_LIFT, STANDING_LIFT, gullFacets, lookTowards } from "../components/gull/body.ts";
import {
  arrivalAt,
  arrivalLength,
  departureAt,
  departureLength,
  habitsFor,
  movingAt,
  nextHabitAt,
  peckTimes,
  perchedAt,
  planArrival,
  planDeparture,
  withGaze,
  withMoods,
} from "../components/gull/flight.ts";
import { GLIDING, SITTING, flying } from "../components/gull/pose.ts";

const SCALE = 50;
const HEADROOM = 21;
const ENTRY = [-1400, 135];
const EXIT = [-550, 255];
const perch = (habits = habitsFor(7)) => ({ scale: SCALE, heading: 1, habits });
const facetsOf = (frame) => gullFacets(frame.pose, frame);
const points = (frame) => facetsOf(frame).flatMap((facet) => facet.points);

function bounds(frame) {
  const all = points(frame);
  const xs = all.map(([x]) => x),
    ys = all.map(([, y]) => y);
  return {
    left: Math.min(...xs),
    right: Math.max(...xs),
    top: Math.min(...ys),
    bottom: Math.max(...ys),
  };
}

function samples(length, frameAt, step = 1 / 60) {
  const frames = [];
  for (let t = 0; t < length; t += step) frames.push(frameAt(t));
  frames.push(frameAt(length));
  return frames;
}

test("the sitting gull rests on the button and fits the 21 px above the hero's", () => {
  const box = bounds(perchedAt(perch([]), 0));
  assert.ok(Math.abs(box.bottom) < 1.5, `belly ${box.bottom} px from the edge`);
  assert.ok(box.top > -HEADROOM + 2, `${-box.top} px tall`);
  assert.ok(box.right - box.left < 62, `${box.right - box.left} px long`);
});

test("the arrival starts at the entry, never jumps, and ends sitting still on the perch", () => {
  const plan = planArrival(ENTRY, SCALE);
  const start = arrivalAt(plan, 0);
  assert.ok(Math.hypot(start.x - ENTRY[0], start.y - ENTRY[1]) < 2, "starts where it was asked to");
  const frames = samples(arrivalLength(plan), (t) => arrivalAt(plan, t));
  for (let i = 1; i < frames.length; i++) {
    const step = Math.hypot(frames[i].x - frames[i - 1].x, frames[i].y - frames[i - 1].y);
    assert.ok(step < 12, `a ${step.toFixed(1)} px jump at frame ${i}`);
  }
  const end = frames.at(-1);
  assert.ok(
    Math.abs(end.x) < 1e-6 && Math.abs(end.y + SITTING_LIFT * SCALE) < 1e-6,
    "on the perch",
  );
  assert.equal(end.pose.legs, 0);
  assert.equal(end.pose.right.fold, 1);
  const touchdown = arrivalAt(plan, plan.flight),
    justBefore = arrivalAt(plan, plan.flight - 0.05);
  assert.ok(
    Math.hypot(touchdown.x - justBefore.x, touchdown.y - justBefore.y) < 1.5,
    "brakes to rest",
  );
  assert.ok(Math.abs(touchdown.y + STANDING_LIFT * SCALE) < 1e-6, "lands on its feet");
  assert.ok(touchdown.pose.legs > 0.99, "legs down to land");
});

test("it flaps at a gull's pace, in bursts with glides between", () => {
  const plan = planArrival(ENTRY, SCALE);
  const lifts = samples(plan.flight - 1, (t) => arrivalAt(plan, t).pose.right.lift, 1 / 120);
  let tops = 0;
  for (let i = 1; i + 1 < lifts.length; i++)
    if (lifts[i] > lifts[i - 1] && lifts[i] >= lifts[i + 1] && lifts[i] > 0.6) tops++;
  const rate = tops / (plan.flight - 1);
  assert.ok(rate > 1.2 && rate < 3.5, `${rate.toFixed(2)} strong wingbeats a second on average`);
  assert.ok(
    lifts.some((lift) => Math.abs(lift - GLIDING.lift) < 0.02),
    "glides between bursts",
  );
});

test("every frame of a visit is finite and drawable", () => {
  const plan = planArrival(ENTRY, SCALE);
  const habits = perch();
  const frames = [
    ...samples(arrivalLength(plan), (t) => arrivalAt(plan, t), 0.05),
    ...samples(90, (t) => perchedAt(habits, t), 0.05),
    ...samples(departureLength(planDeparture(perchedAt(habits, 0), EXIT)), (t) =>
      departureAt(planDeparture(perchedAt(habits, 0), EXIT), t),
    ),
  ];
  for (const frame of frames) {
    assert.ok(frame.opacity >= 0 && frame.opacity <= 1);
    assert.ok(points(frame).every(([x, y]) => Number.isFinite(x) && Number.isFinite(y)));
  }
});

test("habits come from the seed, leave long pauses, peck at most once and then stop", () => {
  assert.deepEqual(habitsFor(7), habitsFor(7));
  assert.notDeepEqual(habitsFor(7), habitsFor(8));
  for (let seed = 1; seed < 200; seed++) {
    const habits = habitsFor(seed);
    for (let i = 1; i < habits.length; i++)
      assert.ok(habits[i].at - habits[i - 1].at >= 4, `seed ${seed}: habits ${i - 1} and ${i}`);
    const pecks = peckTimes({ habits });
    assert.ok(pecks.length <= 2 && pecks.every((at) => at > 8), `seed ${seed} pecks`);
    assert.ok(habits.at(-1).at <= 45, `seed ${seed} still fidgets after 45 s`);
    assert.equal(nextHabitAt({ habits }, 46), Infinity);
  }
  const resting = perch();
  const first = resting.habits[0].at;
  assert.ok(!movingAt(resting, first - 0.5) && movingAt(resting, first + 0.05));
  assert.equal(nextHabitAt(resting, first - 0.5), first);
});

test("turning round passes through facing the viewer and ends facing the other way", () => {
  const habits = [{ at: 1, kind: "turn", value: 0 }];
  const turning = perch(habits);
  assert.equal(Math.cos(perchedAt(turning, 0.9).yaw), 1);
  const middle = perchedAt(turning, 1 + 0.3 + 0.55);
  assert.ok(Math.abs(Math.cos(middle.yaw)) < 0.05 && Math.sin(middle.yaw) < 0, "faces the viewer");
  assert.ok(Math.cos(perchedAt(turning, 3).yaw) < -0.999, "now faces left");
  assert.ok(Math.abs(perchedAt(turning, 3).y + SITTING_LIFT * SCALE) < 1e-6, "sits again");
});

test("the takeoff stands, leaves for the exit and fades out small", () => {
  const plan = planDeparture(perchedAt(perch([]), 0), EXIT);
  const end = departureAt(plan, departureLength(plan));
  assert.equal(end.opacity, 0);
  assert.ok(end.scale < 0.2 * SCALE);
  assert.ok(Math.hypot(end.x - EXIT[0], end.y - EXIT[1]) < 1, "reaches the exit");
  assert.ok(departureAt(plan, 0.15).pose.legs > 0.9, "stands before it jumps");
});

test("hovering stands the gull up, idling sends it to sleep, and the head follows the pointer", () => {
  const sitting = perchedAt(perch([]), 0);
  const alert = withMoods(sitting, { alert: 1, asleep: 0 });
  assert.ok(Math.abs(alert.y + STANDING_LIFT * SCALE) < 1e-6 && alert.pose.legs === 1);
  const asleep = withMoods(sitting, { alert: 0, asleep: 1 });
  assert.equal(asleep.pose.eye, 0);
  assert.ok(Math.abs(asleep.pose.headYaw) > 2, "head tucked back");
  const toward = lookTowards(sitting.pose, sitting, [0, 0, 400]);
  assert.ok(
    Math.abs(toward.headYaw + Math.PI / 2) < 0.15,
    "turns to face a pointer in front of it",
  );
  const ahead = lookTowards(sitting.pose, sitting, [400, 0, 0]);
  assert.ok(Math.abs(ahead.headYaw) < 0.1, "looks straight ahead at a pointer ahead");
  const looking = withGaze(sitting, { yaw: -1, pitch: 0.2, weight: 1 });
  assert.equal(looking.pose.headYaw, -1);
});

test("the folded wingtips cross over the tail, and a head-on glide is symmetric", () => {
  const sitting = perchedAt(perch([]), 0);
  const tips = facetsOf(sitting).filter((facet) => facet.tone === "tip");
  assert.ok(
    tips.length > 0 && tips.every((facet) => facet.points.every(([x]) => x < -0.25 * SCALE)),
  );
  const headOn = bounds({
    x: 0,
    y: 0,
    scale: SCALE,
    yaw: -Math.PI / 2,
    pitch: 0,
    roll: 0,
    elevation: 0,
    pose: flying(GLIDING),
  });
  assert.ok(Math.abs(headOn.left + headOn.right) < 1, `${headOn.left} and ${headOn.right}`);
  assert.equal(SITTING.legs, 0);
});
