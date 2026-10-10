import { cross, dot, mix, normal, type V3 } from "../observatory/vec3.ts";
import type { Pose, Wing } from "./pose.ts";
import { aboutX, aboutY, aboutZ, compose, turn, unturn, type Rotation } from "./rotation.ts";

export type Tone = "white" | "back" | "under" | "tip" | "bill" | "leg" | "eye";
export type Facet = { points: [number, number][]; depth: number; tone: Tone; light: number };
export type View = {
  x: number;
  y: number;
  scale: number;
  yaw: number;
  pitch: number;
  roll: number;
  elevation: number;
};

type Ring = [x: number, y: number, height: number, width: number];
type Group = { depth: number; facets: Facet[] };
type Painter = ReturnType<typeof painter>;

const SIDES = 8;
const BODY: Ring[] = [
  [-0.24, 0.042, 0.032, 0.042],
  [-0.17, 0.032, 0.068, 0.074],
  [-0.07, 0.014, 0.104, 0.095],
  [0.03, 0.004, 0.116, 0.102],
  [0.13, 0.018, 0.108, 0.09],
  [0.2, 0.05, 0.082, 0.07],
  [0.25, 0.088, 0.055, 0.05],
];
const TAIL: Ring[] = [
  [0, 0, 0.026, 0.036],
  [-0.09, -0.002, 0.013, 0.045],
  [-0.17, -0.004, 0.005, 0.05],
];
const TAIL_ROOT: V3 = [-0.23, 0.04, 0];
const TAIL_FAN = [0, 0.04, 0.075];
const HEAD: Ring[] = [
  [-0.03, -0.012, 0.046, 0.044],
  [0.018, 0.014, 0.06, 0.051],
  [0.066, 0.022, 0.06, 0.05],
  [0.108, 0.013, 0.046, 0.04],
  [0.135, 0, 0.029, 0.021],
];
const BILL: Ring[] = [
  [0.135, 0, 0.027, 0.019],
  [0.18, -0.004, 0.019, 0.012],
  [0.216, -0.014, 0.008, 0.007],
];
const BILL_TIP: V3 = [0.23, -0.024, 0];
const EYE: V3 = [0.08, 0.034, 0.038];
const NECK = { hunched: [0.235, 0.1, 0] as V3, stretched: [0.27, 0.165, 0] as V3 };
const SHOULDER: V3 = [0.12, 0.06, 0.07];
const WRIST: V3 = [0.04, 0, 0.42];
const HIP: V3 = [0.01, -0.085, 0.04];
const LEG = 0.11;
const LIGHT = normal([-0.4, 0.8, 0.45]);
const TOP: V3 = [0, 1, 0];

const FOLDED_PANELS: [number, number][][] = [
  [
    [0.15, 0.08],
    [0.12, 0],
    [-0.14, 0.004],
    [-0.12, 0.1],
  ],
  [
    [-0.02, 0.016],
    [-0.31, 0.04],
    [-0.33, 0.08],
    [-0.14, 0.096],
    [0, 0.068],
  ],
  [
    [-0.31, 0.04],
    [-0.47, 0.056],
    [-0.33, 0.08],
  ],
];
const FOLDED_GAP = 0.012;
const FOLDED_CROSSING = 0.018;

export const SITTING_LIFT = 0.108;
export const STANDING_LIFT = SITTING_LIFT + LEG;

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const blend = (a: V3, b: V3, t: number): V3 => [
  mix(a[0], b[0], t),
  mix(a[1], b[1], t),
  mix(a[2], b[2], t),
];
const mirror = ([x, y, z]: V3, side: number): V3 => [x, y, z * side];
const centre = (points: V3[]) =>
  points
    .reduce((sum, point) => add(sum, point), [0, 0, 0] as V3)
    .map((value) => value / points.length) as V3;

const orientation = (view: View): Rotation =>
  compose(aboutX(view.elevation), aboutY(view.yaw), aboutZ(view.pitch), aboutX(view.roll));

const headRotation = (pose: Pose, view: View) =>
  compose(aboutY(pose.headYaw), aboutZ(pose.headPitch - view.pitch * 0.8));

const neckOf = (pose: Pose) =>
  NECK.hunched.map((value, i) => mix(value, NECK.stretched[i], pose.neck)) as V3;

function ring([x, y, height, width]: Ring, puff = 1, flare = 0): V3[] {
  return Array.from({ length: SIDES }, (_, k) => {
    const angle = ((k + 0.5) / SIDES) * Math.PI * 2;
    return [x, y + height * puff * Math.cos(angle), (width + flare) * puff * Math.sin(angle)] as V3;
  });
}

function flank(x: number, y: number) {
  const after = BODY.findIndex(([at]) => at >= x);
  if (after <= 0) return FOLDED_CROSSING;
  const [x0, y0, h0, w0] = BODY[after - 1],
    [x1, y1, h1, w1] = BODY[after];
  const t = (x - x0) / (x1 - x0);
  const height = mix(h0, h1, t),
    across = (y - mix(y0, y1, t)) / height;
  return Math.max(
    FOLDED_CROSSING,
    mix(w0, w1, t) * Math.sqrt(Math.max(0, 1 - across * across)) + FOLDED_GAP,
  );
}

function painter(view: View, rotation: Rotation) {
  const project = (point: V3): [number, number] => {
    const [x, y] = turn(rotation, point);
    return [view.x + x * view.scale, view.y - y * view.scale];
  };
  const depthOf = (point: V3) => turn(rotation, point)[2];
  const shade = (facing: V3) => 0.62 + 0.38 * Math.max(0, dot(facing, LIGHT));
  const facingOf = (turned: V3[]) =>
    normal(cross(sub(turned[1], turned[0]), sub(turned[2], turned[0])));

  const solid = (points: V3[], outward: V3, tone: Tone): Facet | null => {
    const turned = points.map((point) => turn(rotation, point));
    let facing = facingOf(turned);
    if (dot(facing, turn(rotation, outward)) < 0) facing = facing.map((v) => -v) as V3;
    if (facing[2] <= 0) return null;
    return { points: points.map(project), depth: centre(turned)[2], tone, light: shade(facing) };
  };

  const sheet = (points: V3[], up: V3, [top, under]: [Tone, Tone]): Facet => {
    const turned = points.map((point) => turn(rotation, point));
    let facing = facingOf(turned);
    if (facing[2] < 0) facing = facing.map((v) => -v) as V3;
    return {
      points: points.map(project),
      depth: centre(turned)[2],
      tone: dot(turn(rotation, up), facing) >= 0 ? top : under,
      light: shade(facing),
    };
  };

  const loft = (
    rings: V3[][],
    place: (point: V3) => V3,
    toneOf: (outward: V3, middle: V3) => Tone,
  ) => {
    const facets: Facet[] = [];
    for (let i = 0; i + 1 < rings.length; i++) {
      const axis = centre([...rings[i], ...rings[i + 1]]);
      for (let k = 0; k < SIDES; k++) {
        const next = (k + 1) % SIDES;
        const quad = [rings[i][k], rings[i][next], rings[i + 1][next], rings[i + 1][k]];
        const outward = sub(centre(quad), axis);
        const facet = solid(
          quad.map(place),
          sub(place(add(axis, outward)), place(axis)),
          toneOf(outward, centre(quad)),
        );
        if (facet) facets.push(facet);
      }
    }
    return facets;
  };

  const strand = (from: V3, to: V3, width: number): Facet => {
    const [a, b] = [project(from), project(to)];
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const [nx, ny] = [((a[1] - b[1]) / length) * width, ((b[0] - a[0]) / length) * width];
    return {
      points: [
        [a[0] + nx, a[1] + ny],
        [b[0] + nx, b[1] + ny],
        [b[0] - nx, b[1] - ny],
        [a[0] - nx, a[1] - ny],
      ],
      depth: (depthOf(from) + depthOf(to)) / 2,
      tone: "leg",
      light: 1,
    };
  };

  const disc = (point: V3, radius: number, tone: Tone): Facet => {
    const [x, y] = project(point);
    return {
      points: Array.from({ length: 8 }, (_, k) => {
        const angle = (k / 8) * Math.PI * 2;
        return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius] as [number, number];
      }),
      depth: depthOf(point) + 0.001,
      tone,
      light: 1,
    };
  };

  return { solid, sheet, loft, strand, disc, depthOf };
}

function body(pose: Pose, draw: Painter): Group {
  const puff = 1 + 0.07 * pose.fluff;
  const tail = compose(aboutZ(pose.tail));
  const facets = [
    ...draw.loft(
      BODY.map((section) => ring(section, puff)),
      (point) => point,
      (outward, [x]) => (normal(outward)[1] > 0.6 && x > -0.2 && x < 0.21 ? "back" : "white"),
    ),
    ...draw.loft(
      TAIL.map((section, i) => ring(section, 1, TAIL_FAN[i] * pose.fan)),
      (point) => add(TAIL_ROOT, turn(tail, point)),
      () => "white",
    ),
  ];
  return { depth: 0, facets };
}

function head(pose: Pose, view: View, draw: Painter): Group {
  const neck = neckOf(pose);
  const rotation = headRotation(pose, view);
  const place = (point: V3) => add(neck, turn(rotation, point));
  const facets = [
    ...draw.loft(
      HEAD.map((section) => ring(section)),
      place,
      () => "white",
    ),
    ...draw.loft(
      BILL.map((section) => ring(section)),
      place,
      () => "bill",
    ),
  ];
  const last = BILL.at(-1)!;
  const tip = ring(last);
  for (let k = 0; k < SIDES; k++) {
    const facet = draw.solid(
      [tip[k], tip[(k + 1) % SIDES], BILL_TIP].map(place),
      sub(place(BILL_TIP), place([last[0], last[1], 0])),
      "bill",
    );
    if (facet) facets.push(facet);
  }
  if (pose.eye > 0.5)
    for (const side of [-1, 1]) {
      const facing = turn(orientation(view), turn(rotation, normal([0.3, 0.3, side])));
      if (facing[2] > 0.2)
        facets.push(draw.disc(place(mirror(EYE, side)), Math.max(0.85, 0.013 * view.scale), "eye"));
    }
  return { depth: draw.depthOf(place([0.06, 0.02, 0])) + 0.03, facets };
}

function wingPanels(w: Wing) {
  const arm = compose(aboutY(-w.sweep), aboutX(-w.lift), aboutZ(w.twist));
  const hand = compose(arm, aboutY(-w.wristSweep), aboutX(-w.wristLift));
  const atArm = ([x, y, z]: V3) => add(SHOULDER, turn(arm, [x, y, z * w.reach]));
  const wrist = atArm(WRIST);
  const atHand = (point: V3) => add(wrist, turn(hand, point));
  const trailingWrist = atHand([-0.21, 0, -0.02]),
    leadingBand = atHand([-0.106, 0, 0.33]),
    trailingBand = atHand([-0.233, 0, 0.466]);
  return {
    panels: [
      [atArm([0.06, 0, 0]), wrist, trailingWrist, atArm([-0.2, 0, 0])],
      [wrist, leadingBand, trailingBand, atHand([-0.26, 0, 0.34]), trailingWrist],
      [leadingBand, atHand([-0.2, 0, 0.62]), trailingBand],
    ],
    ups: [turn(arm, TOP), turn(hand, TOP), turn(hand, TOP)],
    anchor: atArm([0, 0, 0.21]),
  };
}

const FOLDED = FOLDED_PANELS.map((panel) => panel.map(([x, y]) => [x, y, flank(x, y)] as V3));
const FOLDED_UP: V3 = [0, 0.35, 1];
const FOLDED_ANCHOR: V3 = [0, 0.05, flank(0, 0.05)];
const PANEL_TONES: [Tone, Tone][] = [
  ["back", "under"],
  ["back", "under"],
  ["tip", "tip"],
];

function wing(w: Wing, side: number, draw: Painter): Group {
  const open = wingPanels(w);
  const folding = w.fold;
  const facets = open.panels
    .map((panel, i) =>
      draw.sheet(
        panel.map((point, k) => mirror(blend(point, FOLDED[i][k], folding), side)),
        mirror(normal(blend(open.ups[i], FOLDED_UP, folding)), side),
        PANEL_TONES[i],
      ),
    )
    .sort((a, b) => a.depth - b.depth);
  return { depth: draw.depthOf(mirror(blend(open.anchor, FOLDED_ANCHOR, folding), side)), facets };
}

function leg(pose: Pose, side: number, scale: number, draw: Painter): Group {
  const top = mirror(HIP, side);
  const foot = add(top, [
    Math.sin(pose.stride) * LEG * pose.legs,
    -Math.cos(pose.stride) * LEG * pose.legs,
    0,
  ]);
  return {
    depth: draw.depthOf(top),
    facets: [
      draw.strand(top, foot, Math.max(0.55, 0.009 * scale)),
      draw.sheet(
        [foot, add(foot, [0.062, -0.004, 0.028]), add(foot, [0.068, -0.004, -0.024])],
        TOP,
        ["leg", "leg"],
      ),
    ],
  };
}

export function gullFacets(pose: Pose, view: View): Facet[] {
  const draw = painter(view, orientation(view));
  const groups = [
    body(pose, draw),
    head(pose, view, draw),
    wing(pose.left, -1, draw),
    wing(pose.right, 1, draw),
  ];
  if (pose.legs > 0.15)
    groups.push(leg(pose, -1, view.scale, draw), leg(pose, 1, view.scale, draw));
  return groups
    .sort((a, b) => a.depth - b.depth)
    .flatMap((group) => group.facets.sort((a, b) => a.depth - b.depth));
}

export function lookTowards(pose: Pose, view: View, toward: V3) {
  const rotation = orientation(view);
  const eye = turn(rotation, add(neckOf(pose), [0.07, 0.02, 0]));
  const target: V3 = [
    toward[0] / view.scale - eye[0],
    -toward[1] / view.scale - eye[1],
    toward[2] / view.scale - eye[2],
  ];
  const [x, y, z] = unturn(rotation, normal(target));
  return {
    headYaw: Math.max(-1.9, Math.min(1.9, Math.atan2(-z, x))),
    headPitch: Math.max(-0.7, Math.min(0.6, Math.atan2(y, Math.hypot(x, z)))) + view.pitch * 0.8,
  };
}
