import { FEEDBACK, allowed, type Action, type Response } from "@/lib/feedback/vocabulary";
import { CUES, synthesizeCue, type CueName } from "@/lib/sound/cues";
import { playClip, prepareClip, soundsRunning } from "@/components/sound/sound";
import { announce } from "./announce";

const PREPARE_GAP_MS = 40;
const last = new Map<Action, number>();
let prepared = false;

const clipName = (name: CueName) => `cue-${name}`;
const synthesis = (name: CueName) => (sampleRate: number) => synthesizeCue(sampleRate, CUES[name]);
const spread = (value: number, by: number) => value * (1 + by * (Math.random() * 2 - 1));

export function playCue(name: CueName, { gain = 1, rate = 1 }: Response = {}, at = 0) {
  playClip(clipName(name), synthesis(name), {
    gain: spread(gain, 0.08),
    rate: spread(rate, 0.03),
    at,
  });
}

function vibrate(pattern: number | number[]) {
  if (!navigator.userActivation?.hasBeenActive) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {}
}

export function respond(action: Action) {
  const response: Response = FEEDBACK[action];
  const now = performance.now() / 1000;
  if (!allowed(response, now, last.get(action))) return;
  last.set(action, now);
  if (response.sound) playCue(response.sound, response);
  if (response.haptic) vibrate(response.haptic);
  if (response.say) announce(response.say);
}

export function prepareCues() {
  if (prepared || !soundsRunning()) return;
  prepared = true;
  const waiting = Object.keys(CUES) as CueName[];
  const next = () => {
    const name = waiting.shift();
    if (!name) return;
    prepareClip(clipName(name), synthesis(name));
    setTimeout(next, PREPARE_GAP_MS);
  };
  setTimeout(next, PREPARE_GAP_MS);
}
