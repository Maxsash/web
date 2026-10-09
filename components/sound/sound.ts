const CHOICE = "studio-wave-sound";
const GESTURES = ["pointerdown", "pointerup", "keydown", "touchend"] as const;

export type SoundStatus = "on" | "off" | "unavailable";
type Synthesize = (sampleRate: number) => Float32Array<ArrayBuffer>;

let chosen: boolean | undefined;
let context: AudioContext | null = null;
let unlocked = false;
let failed = false;
let gestureWatch: AbortController | null = null;
const listeners = new Set<() => void>();
const clips = new Map<string, AudioBuffer>();

const publish = () => listeners.forEach((listener) => listener());

export function subscribeSound(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

export function soundChosen() {
  if (chosen === undefined) {
    try {
      chosen = localStorage.getItem(CHOICE) === "on";
    } catch {
      chosen = false;
    }
  }
  return chosen;
}

export const soundStatus = (): SoundStatus =>
  failed ? "unavailable" : soundChosen() && unlocked ? "on" : "off";

export const soundRunning = () => soundStatus() === "on" && context?.state === "running";

export const audio = () => context;

function remember(choice: boolean) {
  chosen = choice;
  try {
    localStorage.setItem(CHOICE, choice ? "on" : "off");
  } catch {}
}

function settle() {
  if (context?.state === "running" && !unlocked) {
    unlocked = true;
    gestureWatch?.abort();
    gestureWatch = null;
  }
  publish();
}

function open() {
  const created = new AudioContext();
  created.addEventListener("statechange", settle);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) void created.suspend();
    else if (soundStatus() === "on") void created.resume();
  });
  return created;
}

export function wake() {
  if (!soundChosen() || document.hidden) return;
  try {
    context ??= open();
    void context.resume().then(settle, settle);
  } catch {
    failed = true;
    publish();
  }
}

export function resumeOnFirstGesture() {
  if (unlocked || gestureWatch || !soundChosen()) return;
  if (navigator.userActivation?.hasBeenActive) return wake();
  gestureWatch = new AbortController();
  const listener = (event: Event) => {
    if (!(event.target instanceof Element && event.target.closest("[data-wave-sound]"))) wake();
  };
  for (const type of GESTURES)
    document.addEventListener(type, listener, {
      capture: true,
      passive: true,
      signal: gestureWatch.signal,
    });
}

export function toggleSound() {
  if (soundStatus() === "on") {
    remember(false);
    publish();
    void context?.suspend();
    return;
  }
  remember(true);
  failed = false;
  wake();
  publish();
}

export function soundBuffer(samples: Float32Array<ArrayBuffer>, sampleRate: number) {
  const buffer = new AudioBuffer({ length: samples.length, sampleRate });
  buffer.copyToChannel(samples, 0);
  return buffer;
}

export function playClip(
  name: string,
  synthesize: Synthesize,
  { rate = 1, gain = 1, at = 0 } = {},
) {
  if (!soundChosen() || !context) return;
  try {
    let clip = clips.get(name);
    if (!clip) {
      clip = soundBuffer(synthesize(context.sampleRate), context.sampleRate);
      clips.set(name, clip);
    }
    const source = new AudioBufferSourceNode(context, { buffer: clip, playbackRate: rate });
    source.connect(new GainNode(context, { gain })).connect(context.destination);
    source.start(at);
  } catch {}
}
