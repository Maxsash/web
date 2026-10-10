import { soundsChosen, subscribeSound, wavesDeclined, wavesStatus } from "@/components/sound/sound";
import { gullFacets, lookTowards } from "./body";
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
  type Arrival,
  type Departure,
  type Frame,
  type Gaze,
  type Moods,
  type Perch,
  type Point,
} from "./flight";
import { paintGull } from "./paint";

const WAIT_MS = 3000;
const QUIET_MS = 1000;
const CANVAS_LENGTHS = 2.8;
const LENGTHS_PER_BUTTON = 1.14;
const SEAT = { width: 0.95, height: 0.34 };
const ENTRY = { beyond: 70, down: 0.17 };
const EXIT = { across: 0.55, down: 0.3 };
const LOOK = { radius: 280, toward: 140, settle: 16 };
const SETTLE_SECONDS = { mood: 0.3, ink: 0.5 };
const ASLEEP_AT_IDLE = 3;
const DIP = { landing: 1.5, peck: 1, ms: 110 };

let visited = false;

type Phase =
  | { kind: "waiting" }
  | { kind: "arriving"; plan: Arrival; at: number }
  | { kind: "perched"; perch: Perch; at: number }
  | { kind: "leaving"; plan: Departure; at: number }
  | { kind: "gone" };

const welcome = () => !wavesDeclined() && soundsChosen() && wavesStatus() === "off";
const approach = (value: number, target: number, step: number) =>
  value < target ? Math.min(target, value + step) : Math.max(target, value - step);

export function visit(canvas: HTMLCanvasElement, seat: HTMLElement) {
  const button = canvas.closest("button");
  const context = canvas.getContext("2d");
  if (!button || !context || !welcome()) return;
  const sky = canvas.closest<HTMLElement>("[data-gull-sky]") ?? document.documentElement;
  const scene = canvas.closest<HTMLElement>("[data-observatory]");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const events = new AbortController();
  const root = document.documentElement;

  let phase: Phase = { kind: "waiting" };
  let scale = 1,
    side = 1,
    ratio = 1;
  let raf = 0,
    timer = 0,
    waiting = 0,
    last = 0,
    lastT = 0;
  let onScreen = false,
    hovering = false,
    focused = false,
    scrolledAt = 0,
    frozenAt: number | null = performance.now(),
    frozenFor = 0;
  const moods: Moods = { alert: 0, asleep: 0 };
  const gaze: Gaze = { yaw: 0, pitch: 0, weight: 0 };
  let ink = 0;
  let pointer: Point | null = null;

  const clock = () => ((frozenAt ?? performance.now()) - frozenFor) / 1000;
  const still = () => scene?.dataset.still !== undefined;
  const inkTarget = () => (/structure|atlas/.test(scene?.dataset.chapter ?? "") ? 1 : 0);

  const show = (kind: Phase["kind"]) => {
    canvas.dataset.gull = kind;
    if (kind === "perched") seat.dataset.perched = "";
    else delete seat.dataset.perched;
  };

  const perchPoint = (): Point => {
    const bounds = button.getBoundingClientRect();
    return [bounds.left + canvas.offsetLeft + side / 2, bounds.top + canvas.offsetTop + side / 2];
  };

  const fromPerch = (x: number, y: number): Point => {
    const [px, py] = perchPoint();
    return [x - px, y - py];
  };

  const area = () => sky.getBoundingClientRect();

  const resize = () => {
    scale = button.offsetHeight * LENGTHS_PER_BUTTON;
    side = Math.ceil(scale * CANVAS_LENGTHS);
    ratio = Math.min(2, devicePixelRatio || 1);
    canvas.style.setProperty("--gull-size", `${side}px`);
    canvas.width = canvas.height = Math.round(side * ratio);
    seat.style.width = `${scale * SEAT.width}px`;
    seat.style.height = `${scale * SEAT.height}px`;
  };

  const dip = (pixels: number) => {
    button.style.setProperty("--perch-dip", `${pixels}px`);
    window.setTimeout(() => button.style.removeProperty("--perch-dip"), DIP.ms);
  };

  const draw = (frame: Frame) => {
    canvas.style.transform = `translate(${frame.x}px, ${frame.y}px)`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, side, side);
    paintGull(context, gullFacets(frame.pose, { ...frame, x: side / 2, y: side / 2 }), {
      night: root.dataset.studioTheme === "night",
      ink,
      opacity: frame.opacity,
    });
  };

  const settle = (at: number) => {
    visited = true;
    const habits = reduced.matches ? [] : habitsFor(Math.floor(Math.random() * 2 ** 32));
    const heading = phase.kind === "arriving" ? phase.plan.heading : 1;
    phase = { kind: "perched", perch: { scale, heading, habits }, at };
    show("perched");
  };

  const frameAt = (t: number): Frame | null => {
    if (phase.kind === "arriving") {
      const since = t - phase.at;
      if (since < arrivalLength(phase.plan)) return arrivalAt(phase.plan, since);
      settle(phase.at + arrivalLength(phase.plan));
    }
    if (phase.kind === "perched") {
      const frame = perchedAt(phase.perch, t - phase.at);
      return withMoods(withGaze(frame, gaze), moods);
    }
    if (phase.kind === "leaving") {
      const since = t - phase.at;
      if (since < departureLength(phase.plan)) return departureAt(phase.plan, since);
      phase = { kind: "gone" };
      show("gone");
      dispose();
    }
    return null;
  };

  const lookAt = (frame: Frame) => {
    if (!pointer || reduced.matches) return null;
    const [px, py] = perchPoint();
    const dx = pointer[0] - (px + frame.x),
      dy = pointer[1] - (py + frame.y);
    if (Math.hypot(dx, dy) > LOOK.radius) return null;
    return lookTowards(frame.pose, { ...frame, x: 0, y: 0 }, [dx, dy, LOOK.toward]);
  };

  const approachTargets = (seconds: number, frame: Frame | null) => {
    const calm = reduced.matches || phase.kind !== "perched";
    const sleepy = Number(root.dataset.idle ?? 0) >= ASLEEP_AT_IDLE;
    const targets = {
      alert: !calm && (hovering || focused) && !sleepy ? 1 : 0,
      asleep: !calm && sleepy ? 1 : 0,
      ink: inkTarget(),
    };
    moods.alert = approach(moods.alert, targets.alert, seconds / SETTLE_SECONDS.mood);
    moods.asleep = approach(moods.asleep, targets.asleep, seconds / SETTLE_SECONDS.mood);
    ink = approach(ink, targets.ink, seconds / SETTLE_SECONDS.ink);
    const look = frame && !calm && !sleepy ? lookAt(frame) : null;
    const follow = 1 - Math.exp(-seconds * LOOK.settle);
    gaze.weight += ((look ? 1 : 0) - gaze.weight) * follow;
    if (gaze.weight < 0.002) gaze.weight = 0;
    if (look) {
      gaze.yaw += (look.headYaw - gaze.yaw) * follow;
      gaze.pitch += (look.headPitch - gaze.pitch) * follow;
    }
    const near = (a: number, b: number) => Math.abs(a - b) < 0.002;
    return !(
      moods.alert === targets.alert &&
      moods.asleep === targets.asleep &&
      ink === targets.ink &&
      near(gaze.weight, look ? 1 : 0) &&
      (!look || (near(gaze.yaw, look.headYaw) && near(gaze.pitch, look.headPitch)))
    );
  };

  const request = () => {
    if (!raf && phase.kind !== "gone" && phase.kind !== "waiting")
      raf = requestAnimationFrame(tick);
  };

  const pecked = (from: number, to: number) => {
    if (phase.kind !== "perched") return false;
    const since = phase.at;
    return peckTimes(phase.perch).some((at) => at > from - since && at <= to - since);
  };

  function tick(time: number) {
    raf = 0;
    clearTimeout(timer);
    const seconds = last ? Math.min(0.05, (time - last) / 1000) : 0;
    last = time;
    if (frozenAt !== null) {
      last = 0;
      return;
    }
    const t = clock();
    const landing = phase.kind === "arriving" ? phase.at + phase.plan.flight : Infinity;
    const changing = approachTargets(seconds, frameAt(t));
    const frame = frameAt(t);
    if (!frame) return;
    draw(frame);
    if (lastT < landing && t >= landing) dip(DIP.landing);
    if (pecked(lastT, t)) dip(DIP.peck);
    lastT = t;
    if (phase.kind !== "perched" || changing || movingAt(phase.perch, t - phase.at)) {
      raf = requestAnimationFrame(tick);
      return;
    }
    last = 0;
    const wait = nextHabitAt(phase.perch, t - phase.at) - (t - phase.at);
    if (Number.isFinite(wait)) timer = window.setTimeout(request, wait * 1000);
  }

  const refreeze = () => {
    const frozen = document.hidden || !onScreen || still();
    if (frozen && frozenAt === null) frozenAt = performance.now();
    if (!frozen && frozenAt !== null) {
      frozenFor += performance.now() - frozenAt;
      frozenAt = null;
    }
    if (frozen) {
      cancelAnimationFrame(raf);
      raf = 0;
      clearTimeout(timer);
    } else request();
  };

  const arrive = () => {
    waiting = 0;
    if (phase.kind !== "waiting") return;
    const quietFor = performance.now() - scrolledAt;
    if (document.hidden || !onScreen || quietFor < QUIET_MS) {
      if (onScreen) waiting = window.setTimeout(arrive, document.hidden ? WAIT_MS : QUIET_MS);
      return;
    }
    if (!welcome()) return leave();
    if (reduced.matches || visited) settle(clock());
    else {
      const [left, top, height] = [area().left, area().top, area().height];
      const entry = fromPerch(left - ENTRY.beyond, top + height * ENTRY.down);
      phase = { kind: "arriving", plan: planArrival(entry, scale), at: clock() };
      show("arriving");
    }
    lastT = clock();
    request();
  };

  function leave() {
    clearTimeout(waiting);
    if (phase.kind === "waiting") {
      phase = { kind: "gone" };
      return dispose();
    }
    if (phase.kind !== "arriving" && phase.kind !== "perched") return;
    const t = clock();
    const from = frameAt(t);
    if (!from || reduced.matches) {
      phase = { kind: "gone" };
      show("gone");
      return dispose();
    }
    const { left, top, width, height } = area();
    const exit = fromPerch(left + width * EXIT.across, top + height * EXIT.down);
    phase = { kind: "leaving", plan: planDeparture(from, exit), at: t };
    show("leaving");
    request();
  }

  const unsubscribe = subscribeSound(() => {
    if (!welcome()) leave();
  });

  const intersection = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.intersectionRatio > 0.98;
      if (phase.kind === "waiting") {
        clearTimeout(waiting);
        if (onScreen) waiting = window.setTimeout(arrive, WAIT_MS);
      }
      refreeze();
    },
    { threshold: [0, 0.99] },
  );
  intersection.observe(button);

  const watcher = new MutationObserver(() => {
    refreeze();
    request();
  });
  if (scene)
    watcher.observe(scene, { attributes: true, attributeFilter: ["data-chapter", "data-still"] });
  watcher.observe(root, { attributes: true, attributeFilter: ["data-idle", "data-studio-theme"] });

  const sizing = new ResizeObserver(() => {
    resize();
    request();
  });
  sizing.observe(button);

  document.addEventListener("visibilitychange", refreeze, { signal: events.signal });
  addEventListener("scroll", () => (scrolledAt = performance.now()), {
    passive: true,
    signal: events.signal,
  });
  button.addEventListener(
    "focus",
    () => {
      focused = button.matches(":focus-visible");
      request();
    },
    { signal: events.signal },
  );
  button.addEventListener(
    "blur",
    () => {
      focused = false;
      request();
    },
    { signal: events.signal },
  );
  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse" || phase.kind !== "perched") return;
      pointer = [event.clientX, event.clientY];
      const [px, py] = perchPoint();
      if (gaze.weight > 0 || Math.hypot(pointer[0] - px, pointer[1] - py) < LOOK.radius) request();
    },
    { passive: true, signal: events.signal },
  );
  for (const [type, over] of [
    ["pointerenter", true],
    ["pointerleave", false],
  ] as const)
    button.addEventListener(
      type,
      (event) => {
        if (event.pointerType !== "mouse") return;
        hovering = over;
        request();
      },
      { signal: events.signal },
    );
  reduced.addEventListener("change", request, { signal: events.signal });

  resize();
  show("waiting");

  function dispose() {
    events.abort();
    unsubscribe();
    intersection.disconnect();
    watcher.disconnect();
    sizing.disconnect();
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    clearTimeout(waiting);
  }
  return () => {
    dispose();
    show("gone");
  };
}
