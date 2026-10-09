const CHOICES = { waves: "studio-wave-sound", sounds: "studio-sound" } as const;
const DEFAULTS: Record<Choice, boolean> = { waves: false, sounds: true };
const GESTURES = ["pointerdown", "pointerup", "keydown", "touchend"] as const;
const OWN_GESTURE = "[data-wave-sound], [data-sounds]";

type Choice = keyof typeof CHOICES;
export type SoundStatus = "on" | "off" | "unavailable";
type Synthesize = (sampleRate: number) => Float32Array<ArrayBuffer>;

const chosen: Partial<Record<Choice, boolean>> = {};
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

function choice(name: Choice) {
  if (chosen[name] === undefined) {
    try {
      const saved = localStorage.getItem(CHOICES[name]);
      chosen[name] = saved === null ? DEFAULTS[name] : saved === "on";
    } catch {
      chosen[name] = DEFAULTS[name];
    }
  }
  return chosen[name];
}

function remember(name: Choice, on: boolean) {
  chosen[name] = on;
  try {
    localStorage.setItem(CHOICES[name], on ? "on" : "off");
  } catch {}
}

export const wavesChosen = () => choice("waves");
export const soundsChosen = () => choice("sounds");
const anySound = () => wavesChosen() || soundsChosen();

export const wavesStatus = (): SoundStatus =>
  failed ? "unavailable" : wavesChosen() && unlocked ? "on" : "off";

export const soundsRunning = () => soundsChosen() && context?.state === "running";

export const audio = () => context;

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
    else if (anySound() && unlocked) void created.resume();
  });
  return created;
}

export function wake() {
  if (!anySound() || document.hidden) return;
  try {
    context ??= open();
    void context.resume().then(settle, settle);
  } catch {
    failed = true;
    publish();
  }
}

export function listenForFirstGesture() {
  if (unlocked || gestureWatch || !anySound()) return;
  if (navigator.userActivation?.hasBeenActive) return wake();
  gestureWatch = new AbortController();
  const listener = (event: Event) => {
    if (!(event.target instanceof Element && event.target.closest(OWN_GESTURE))) wake();
  };
  for (const type of GESTURES)
    document.addEventListener(type, listener, {
      capture: true,
      passive: true,
      signal: gestureWatch.signal,
    });
}

export function toggleWaves() {
  if (wavesStatus() === "on") {
    remember("waves", false);
    publish();
    return;
  }
  remember("waves", true);
  remember("sounds", true);
  failed = false;
  wake();
  publish();
}

export function toggleSounds() {
  const quiet = soundsChosen();
  remember("sounds", !quiet);
  if (quiet) {
    remember("waves", false);
    void context?.suspend();
  } else wake();
  publish();
}

export function soundBuffer(samples: Float32Array<ArrayBuffer>, sampleRate: number) {
  const buffer = new AudioBuffer({ length: samples.length, sampleRate });
  buffer.copyToChannel(samples, 0);
  return buffer;
}

function clipFor(name: string, synthesize: Synthesize, sampleRate: number) {
  let clip = clips.get(name);
  if (!clip) {
    clip = soundBuffer(synthesize(sampleRate), sampleRate);
    clips.set(name, clip);
  }
  return clip;
}

export function prepareClip(name: string, synthesize: Synthesize) {
  if (!context || clips.has(name)) return;
  try {
    clipFor(name, synthesize, context.sampleRate);
  } catch {}
}

export function playClip(
  name: string,
  synthesize: Synthesize,
  { rate = 1, gain = 1, at = 0 } = {},
) {
  if (!soundsChosen() || !context) return;
  try {
    const clip = clipFor(name, synthesize, context.sampleRate);
    const source = new AudioBufferSourceNode(context, { buffer: clip, playbackRate: rate });
    source.connect(new GainNode(context, { gain })).connect(context.destination);
    source.start(at);
  } catch {}
}
