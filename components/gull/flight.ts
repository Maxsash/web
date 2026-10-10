import { seededRandom } from "../../lib/sea/random.ts";
import { clamp01 } from "../observatory/clamp.ts";
import { smootherstep } from "../observatory/easing.ts";
import { mix } from "../observatory/vec3.ts";
import { SITTING_LIFT, STANDING_LIFT } from "./body.ts";
import {
  FOLDED,
  GLIDING,
  RAISED,
  SITTING,
  STANDING,
  braking,
  flapping,
  flying,
  mixPose,
  mixWing,
  withWings,
  type Pose,
  type Wing,
} from "./pose.ts";

export type Point = [number, number];
export type Frame = {
  x: number;
  y: number;
  scale: number;
  yaw: number;
  pitch: number;
  roll: number;
  elevation: number;
  pose: Pose;
  opacity: number;
};
type Curve = { points: [Point, Point, Point, Point]; lengths: number[] };

const BEAT = 0.34;
const BRAKING_BEAT = 0.26;
const BURST = { flap: 1.1, glide: 0.9 };
const BRAKE = 0.9;
const SETTLE = 2.6;
const FAR = 0.6;
const TOWARD_VIEWER = 0.3;
const VIEW = { sky: -0.14, perch: 0.16 };
const LEAVE = { stand: 0.16, crouch: 0.1, flight: 2.4 };

const ease = (t: number) => smootherstep(clamp01(t));
const ramp = (t: number, start: number, length: number) => ease((t - start) / length);
const pulse = (t: number, start: number, length: number) =>
  Math.sin(Math.PI * clamp01((t - start) / length));

function bezier([a, b, c, d]: Curve["points"], u: number): Point {
  const v = 1 - u;
  return [0, 1].map(
    (i) => v * v * v * a[i] + 3 * v * v * u * b[i] + 3 * v * u * u * c[i] + u * u * u * d[i],
  ) as Point;
}

function curve(points: Curve["points"]): Curve {
  const lengths = [0];
  let previous = points[0];
  for (let i = 1; i <= 96; i++) {
    const next = bezier(points, i / 96);
    lengths.push(lengths[i - 1] + Math.hypot(next[0] - previous[0], next[1] - previous[1]));
    previous = next;
  }
  return { points, lengths };
}

const lengthOf = (path: Curve) => path.lengths.at(-1)!;

function along(path: Curve, distance: number) {
  const { lengths } = path;
  const target = Math.max(0, Math.min(lengthOf(path), distance));
  let low = 0,
    high = lengths.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (lengths[middle] < target) low = middle;
    else high = middle;
  }
  const span = lengths[high] - lengths[low] || 1;
  const u = (low + (target - lengths[low]) / span) / (lengths.length - 1);
  const at = bezier(path.points, u),
    ahead = bezier(path.points, Math.min(1, u + 0.01)),
    behind = bezier(path.points, Math.max(0, u - 0.01));
  return { at, heading: [ahead[0] - behind[0], ahead[1] - behind[1]] as Point };
}

const climb = ([dx, dy]: Point) =>
  Math.max(-0.4, Math.min(0.4, Math.atan2(-dy, Math.abs(dx)) * 0.7));
const facing = (heading: number) => (heading > 0 ? 0 : Math.PI);

function cruising(t: number): Wing {
  const cycle = t % (BURST.flap + BURST.glide);
  const strength = Math.min(ramp(cycle, 0, 0.15), 1 - ramp(cycle, BURST.flap - 0.15, 0.3));
  return mixWing(GLIDING, flapping(t / BEAT), strength);
}

const bob = (t: number, scale: number) => -0.025 * scale * Math.sin((t / BEAT) * Math.PI * 2);

export type Arrival = {
  path: Curve;
  cruise: number;
  flight: number;
  scale: number;
  heading: number;
};

export function planArrival(entry: Point, scale: number): Arrival {
  const touchdown: Point = [0, -STANDING_LIFT * scale];
  const dx = touchdown[0] - entry[0],
    distance = Math.hypot(dx, touchdown[1] - entry[1]),
    heading = Math.sign(dx) || 1;
  const path = curve([
    entry,
    [entry[0] + heading * 0.42 * Math.abs(dx), entry[1]],
    [touchdown[0] - heading * 0.24 * distance, touchdown[1] + 0.1 * distance],
    touchdown,
  ]);
  const cruise = Math.max(260, Math.min(440, 240 + 0.12 * lengthOf(path)));
  return { path, cruise, flight: lengthOf(path) / cruise + BRAKE / 2, scale, heading };
}

function travelled(plan: Arrival, t: number) {
  const brakesAt = plan.flight - BRAKE;
  if (t <= brakesAt) return plan.cruise * t;
  const braking = Math.min(t, plan.flight) - brakesAt;
  return plan.cruise * (brakesAt + braking - (braking * braking) / (2 * BRAKE));
}

function arrivingWing(plan: Arrival, t: number) {
  const brakesAt = plan.flight - BRAKE;
  return mixWing(
    cruising(t),
    braking((t - brakesAt) / BRAKING_BEAT + 0.75),
    ramp(t, brakesAt, 0.25),
  );
}

export const arrivalLength = (plan: Arrival) => plan.flight + SETTLE;

export function arrivalAt(plan: Arrival, time: number): Frame {
  const t = Math.min(time, plan.flight);
  const brakesAt = plan.flight - BRAKE;
  const distance = travelled(plan, t);
  const { at, heading } = along(plan.path, distance);
  const progress = distance / lengthOf(plan.path);
  const brake = clamp01((t - brakesAt) / BRAKE);
  const flare = 0.62 * ease(brake / 0.6);
  const legs = ease((brake - 0.25) / 0.5);
  const base = facing(plan.heading);
  const frame: Frame = {
    x: at[0],
    y: at[1] + bob(t, plan.scale) * (1 - brake),
    scale: plan.scale * mix(FAR, 1, ease(progress)),
    yaw: base - TOWARD_VIEWER * plan.heading * (1 - ramp(t, brakesAt - 0.8, 1.2)),
    pitch: climb(heading) * (1 - brake) + flare,
    roll: 0.1 * Math.sin(t * 1.6) * (1 - brake),
    elevation: mix(VIEW.sky, VIEW.perch, ease(progress)),
    pose: {
      ...flying(arrivingWing(plan, t)),
      legs,
      stride: 0.55 * legs - 0.3 * ease((brake - 0.8) / 0.2),
      tail: 0.45 * ease(brake),
      fan: mix(0.15, 0.9, ease(brake)),
    },
    opacity: 1,
  };
  return time <= plan.flight ? frame : settling(plan, frame, time - plan.flight);
}

function settling(plan: Arrival, landed: Frame, t: number): Frame {
  const lastWing = landed.pose.right;
  const wing =
    t < 0.4
      ? mixWing(lastWing, RAISED, ease(t / 0.15))
      : mixWing(RAISED, FOLDED, ease((t - 0.4) / 0.45));
  const standing: Pose = {
    ...withWings(STANDING, wing),
    tail: mix(landed.pose.tail, STANDING.tail, ease(t / 0.5)),
    fan: mix(landed.pose.fan, 0, ease(t / 0.5)),
    stride: mix(landed.pose.stride, 0, ease(t / 0.2)),
    neck: mix(0.45, STANDING.neck, ease(t / 0.4)),
    headYaw: -0.9 * plan.heading * Math.min(ramp(t, 1, 0.1), 1 - ramp(t, 1.6, 0.1)),
  };
  const sit = ramp(t, 2, 0.6);
  return {
    ...landed,
    y: -mix(STANDING_LIFT, SITTING_LIFT, sit) * plan.scale + 0.03 * plan.scale * pulse(t, 0, 0.2),
    pitch: landed.pitch * (1 - ease(t / 0.3)) - 0.07 * pulse(t, 0.15, 0.35),
    roll: 0,
    pose: mixPose(standing, { ...SITTING, headYaw: standing.headYaw }, sit),
  };
}

type Habit = {
  at: number;
  kind: "look" | "blink" | "ruffle" | "peck" | "turn";
  value: number;
};

const HABIT_SECONDS = { look: 0.12, blink: 0.14, ruffle: 0.55, peck: 0.8, turn: 1.8 };
const HABITS = { first: 1.4, gap: 4, spread: 6.5, until: 45, firstPeck: 8 };
const KINDS: [Habit["kind"], number][] = [
  ["look", 0.5],
  ["blink", 0.72],
  ["ruffle", 0.82],
  ["peck", 0.9],
  ["turn", 1],
];
const PECKS = [0.32, 0.6];

export function habitsFor(seed: number): Habit[] {
  const random = seededRandom(seed);
  const habits: Habit[] = [{ at: HABITS.first, kind: "look", value: -0.9 }];
  for (;;) {
    const previous = habits.at(-1)!;
    const at = previous.at + HABIT_SECONDS[previous.kind] + HABITS.gap + random() * HABITS.spread;
    if (at > HABITS.until) return habits;
    const roll = random();
    let kind = KINDS.find(([, upTo]) => roll < upTo)![0];
    if (kind === "peck" && (at < HABITS.firstPeck || habits.some((habit) => habit.kind === "peck")))
      kind = "look";
    habits.push({ at, kind, value: kind === "look" ? (random() * 2 - 1) * 1.3 : 0 });
  }
}

export type Perch = { scale: number; heading: number; habits: Habit[] };

function headingAt(perch: Perch, t: number) {
  const turns = perch.habits.filter((habit) => habit.kind === "turn" && habit.at + 0.9 <= t).length;
  return perch.heading * (turns % 2 ? -1 : 1);
}

export function movingAt(perch: Perch, t: number) {
  return perch.habits.some((habit) => t >= habit.at && t < habit.at + HABIT_SECONDS[habit.kind]);
}

export const nextHabitAt = (perch: Perch, t: number) =>
  perch.habits.find((habit) => habit.at > t)?.at ?? Infinity;

export const peckTimes = (perch: Perch) =>
  perch.habits
    .filter((habit) => habit.kind === "peck")
    .flatMap((habit) => PECKS.map((offset) => habit.at + offset));

function headAt(perch: Perch, t: number) {
  let yaw = 0;
  for (const habit of perch.habits) {
    if (habit.at > t) break;
    if (habit.kind === "look")
      yaw = mix(
        yaw,
        habit.value * headingAt(perch, habit.at),
        ease((t - habit.at) / HABIT_SECONDS.look),
      );
    if (habit.kind === "turn") yaw = 0;
  }
  return yaw;
}

export function perchedAt(perch: Perch, t: number): Frame {
  const habit = perch.habits.findLast((candidate) => candidate.at <= t);
  const since = habit ? t - habit.at : Infinity;
  const active = habit && since < HABIT_SECONDS[habit.kind] ? habit.kind : null;
  let pose: Pose = { ...SITTING, headYaw: headAt(perch, t) };
  let pitch = 0,
    roll = 0,
    lift = SITTING_LIFT;
  const heading = headingAt(perch, t);
  let yaw = facing(heading);
  if (active === "blink") pose = { ...pose, eye: 0 };
  if (active === "ruffle") {
    pose = { ...pose, fluff: 0.35 + 0.65 * pulse(since, 0, 0.55) };
    roll = 0.06 * Math.sin(since * 60) * pulse(since, 0, 0.55);
  }
  if (active === "peck") {
    const dip = Math.max(...PECKS.map((offset) => pulse(since, offset - 0.12, 0.24)));
    pose = { ...pose, headYaw: 0, headPitch: -0.9 * dip, neck: 0.2 + 0.3 * dip };
    pitch = -0.32 * pulse(since, 0.05, 0.75);
  }
  if (active === "turn") {
    const up = Math.min(ramp(since, 0, 0.3), 1 - ramp(since, 1.4, 0.4));
    pose = mixPose(pose, { ...STANDING, headYaw: 0 }, up);
    lift = mix(SITTING_LIFT, STANDING_LIFT, up);
    yaw = facing(headingAt(perch, habit!.at)) - Math.PI * ramp(since, 0.3, 1.1);
  }
  return {
    x: 0,
    y: -lift * perch.scale,
    scale: perch.scale,
    yaw,
    pitch,
    roll,
    elevation: VIEW.perch,
    pose,
    opacity: 1,
  };
}

export type Departure = { from: Frame; path: Curve; heading: number; airborne: boolean };

export function planDeparture(from: Frame, exit: Point): Departure {
  const airborne = from.pose.right.fold < 0.5 && from.pose.legs < 0.5;
  const heading = Math.cos(from.yaw) >= 0 ? 1 : -1;
  const start: Point = airborne ? [from.x, from.y] : [from.x, -STANDING_LIFT * from.scale];
  const distance = Math.hypot(exit[0] - start[0], exit[1] - start[1]);
  return {
    from,
    heading,
    airborne,
    path: curve([
      start,
      [start[0] + heading * 0.2 * distance, start[1] + 0.14 * distance],
      [exit[0] + 0.2 * distance * Math.sign(start[0] - exit[0]), exit[1] - 0.05 * distance],
      exit,
    ]),
  };
}

const launchAt = (plan: Departure) => (plan.airborne ? 0 : LEAVE.stand + LEAVE.crouch);

export const departureLength = (plan: Departure) => launchAt(plan) + LEAVE.flight;

export function departureAt(plan: Departure, t: number): Frame {
  const { from } = plan;
  const launch = launchAt(plan);
  if (t < launch) {
    const stand = ramp(t, 0, LEAVE.stand),
      crouch = pulse(t, LEAVE.stand - 0.02, LEAVE.crouch + 0.02);
    return {
      ...from,
      y: -mix(SITTING_LIFT, STANDING_LIFT, stand) * from.scale + 0.025 * from.scale * crouch,
      pitch: 0.18 * crouch,
      pose: mixPose(
        mixPose(from.pose, STANDING, stand),
        withWings({ ...STANDING, neck: 0.65 }, RAISED),
        ramp(t, 0.05, LEAVE.stand + LEAVE.crouch - 0.05),
      ),
    };
  }
  const flight = t - launch;
  const progress = ease(flight / LEAVE.flight) * 0.85 + clamp01(flight / LEAVE.flight) * 0.15;
  const { at, heading } = along(plan.path, progress * lengthOf(plan.path));
  const strong = 1 - ramp(flight, 0.9, 0.4);
  const wing = mixWing(cruising(flight + 0.3), flapping(flight / BRAKING_BEAT + 0.5, 1.15), strong);
  const takeoff = plan.airborne ? 1 : ramp(flight, 0, 0.12);
  const base = facing(plan.heading);
  const away = ramp(flight, 0.35, 1.5);
  return {
    x: at[0],
    y: at[1],
    scale: from.scale * mix(1, 0.16, ease(flight / LEAVE.flight)),
    yaw: base + (Math.PI / 2 - base) * 0.92 * away,
    pitch: climb(heading) * 0.6,
    roll: -0.45 * plan.heading * pulse(flight, 0.3, 1.6),
    elevation: mix(VIEW.perch, -0.08, away),
    pose: {
      ...mixPose(plan.airborne ? from.pose : withWings(STANDING, RAISED), flying(wing), takeoff),
      legs: (1 - ramp(flight, 0.05, 0.35)) * (plan.airborne ? from.pose.legs : 1),
    },
    opacity: 1 - ramp(flight, LEAVE.flight * 0.7, LEAVE.flight * 0.3),
  };
}

export type Moods = { alert: number; asleep: number };
export type Gaze = { yaw: number; pitch: number; weight: number };

const ALERT: Pose = { ...STANDING, neck: 0.75 };
const ASLEEP: Pose = { ...SITTING, headYaw: 2.6, headPitch: -0.3, neck: 0, eye: 0, fluff: 0.7 };

export function withMoods(frame: Frame, moods: Moods): Frame {
  const alert = ease(moods.alert),
    asleep = ease(moods.asleep);
  const { headYaw, headPitch } = frame.pose;
  return {
    ...frame,
    y: mix(frame.y, -STANDING_LIFT * frame.scale, alert),
    pose: mixPose(mixPose(frame.pose, { ...ALERT, headYaw, headPitch }, alert), ASLEEP, asleep),
  };
}

export function withGaze(frame: Frame, gaze: Gaze): Frame {
  return {
    ...frame,
    pose: {
      ...frame.pose,
      headYaw: mix(frame.pose.headYaw, gaze.yaw, gaze.weight),
      headPitch: mix(frame.pose.headPitch, gaze.pitch, gaze.weight),
    },
  };
}
