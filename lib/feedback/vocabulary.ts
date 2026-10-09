import { site } from "../../content/site.ts";
import type { CueName } from "../sound/cues.ts";

export type Response = {
  sound?: CueName;
  gain?: number;
  rate?: number;
  spacing?: number;
  haptic?: number | number[];
  say?: string;
  title?: string;
};

export const FEEDBACK = {
  hover: { sound: "tick", spacing: 0.05 },
  press: { sound: "click", spacing: 0.04 },
  focus: { sound: "tick", gain: 0.6, rate: 1.25, spacing: 0.05 },
  glide: { sound: "whoosh" },
  leave: { sound: "sail" },
  mail: { sound: "bell", say: `Opening your mail app. The address is ${site.email}.` },
  save: { sound: "slide", haptic: 8 },
  copy: { sound: "scratch", say: "Copied." },
  select: { sound: "scratch", gain: 0.6, rate: 1.2, spacing: 0.4 },
  cross: { sound: "swell", spacing: 1.5 },
  away: { title: "At anchor" },
  back: { title: "Welcome back" },
  offline: {
    sound: "foghorn",
    say: "You are offline. The sea is in fog until the connection comes back.",
  },
  online: { sound: "bell", gain: 0.6, say: "Back online. The fog has lifted." },
  success: { sound: "stamp", haptic: 12 },
  refusal: { sound: "thud", haptic: [18, 60, 18] },
  share: { sound: "bell", haptic: 12 },
  preset: { sound: "pin", haptic: 8 },
  dice: { sound: "dice", haptic: [6, 40, 6, 40, 6] },
  detent: { gain: 0.6, haptic: 2, spacing: 0.03 },
  key: { sound: "key", spacing: 0.03 },
  redraw: { sound: "nib", spacing: 0.06 },
  unfold: { sound: "latch" },
  fold: { sound: "latch", rate: 0.85 },
  print: { sound: "stamp", rate: 0.85 },
  sail: { sound: "swell", gain: 1.6 },
  rope: { sound: "rope" },
  still: { sound: "calm" },
  stir: { sound: "stir" },
  swipe: { sound: "swell", haptic: 10 },
  draw: { sound: "nib", gain: 0.7 },
  drop: { sound: "drop", spacing: 0.08 },
  slide: { sound: "slide", spacing: 0.2 },
  engrave: { sound: "scratch", rate: 0.8, spacing: 0.6 },
  drawing: { sound: "pen" },
  step: { sound: "step", spacing: 0.1 },
  dawn: { sound: "swell", rate: 1.25 },
  dusk: { sound: "swell", rate: 0.8 },
  end: { sound: "quill" },
} satisfies Record<string, Response>;

export type Action = keyof typeof FEEDBACK;

export const isAction = (name: string | null | undefined): name is Action =>
  Boolean(name && Object.hasOwn(FEEDBACK, name));

export function allowed(response: Response, now: number, last: number | undefined) {
  return last === undefined || !response.spacing || now - last >= response.spacing;
}
