import { BED, SURF, synthesizeSurf } from "@/lib/sound/surf";
import { audio, soundBuffer, subscribeSound, wavesStatus } from "./sound";

type Bed = { source: AudioBufferSourceNode; fade: GainNode; duck: GainNode };

let holders = 0;
let bed: Bed | null = null;
let loop: AudioBuffer | null = null;
let preparing = false;
let unsubscribe: (() => void) | null = null;

function prepare() {
  if (preparing) return;
  preparing = true;
  setTimeout(() => {
    loop = soundBuffer(synthesizeSurf(SURF.sampleRate), SURF.sampleRate);
    preparing = false;
    reconcile();
  });
}

function arrive(context: AudioContext, buffer: AudioBuffer): Bed {
  const source = new AudioBufferSourceNode(context, { buffer, loop: true });
  const duck = new GainNode(context);
  const fade = new GainNode(context, { gain: 0 });
  source.connect(duck).connect(fade).connect(context.destination);
  source.start(0, Math.random() * buffer.duration);
  fade.gain.setTargetAtTime(1, context.currentTime, BED.arrive);
  return { source, fade, duck };
}

function leave({ source, fade }: Bed, context: AudioContext, muted: boolean) {
  if (muted) return source.stop();
  fade.gain.cancelScheduledValues(context.currentTime);
  fade.gain.setTargetAtTime(0, context.currentTime, BED.leave);
  source.stop(context.currentTime + BED.leave * 8);
}

function reconcile() {
  const context = audio();
  const status = wavesStatus();
  const wanted = holders > 0 && status === "on";
  if (!context || wanted === Boolean(bed)) return;
  if (bed) {
    leave(bed, context, status !== "on");
    bed = null;
  } else if (loop) bed = arrive(context, loop);
  else prepare();
}

export function holdWaves() {
  holders += 1;
  unsubscribe ??= subscribeSound(reconcile);
  reconcile();
  return () => {
    holders -= 1;
    reconcile();
    if (holders === 0) {
      unsubscribe?.();
      unsubscribe = null;
    }
  };
}

export function duckWaves() {
  const context = audio();
  if (!bed || !context) return;
  const { level, attack, hold, release } = BED.duck;
  const { gain } = bed.duck;
  const now = context.currentTime;
  gain.cancelScheduledValues(now);
  gain.setTargetAtTime(level, now, attack);
  gain.setTargetAtTime(1, now + hold, release);
}
