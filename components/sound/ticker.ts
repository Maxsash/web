import { DETENTS, chooseDetent, clickTimes, synthesizeDetent } from "@/lib/sound/dial";
import { audio, playClip, soundsRunning } from "./sound";

export function createTicker(play: (at: number) => void) {
  let last = 0;
  return (clicks: number) => {
    const context = audio();
    if (!clicks || !context || !soundsRunning()) return;
    for (const at of clickTimes(context.currentTime, last, clicks)) {
      last = at;
      play(at);
    }
  };
}

export function createDetentTicker(gain = 1) {
  let previous = -1;
  return createTicker((at) => {
    const take = chooseDetent(Math.random, previous);
    previous = take.variant;
    playClip(
      `detent-${take.variant}`,
      (sampleRate) => synthesizeDetent(sampleRate, DETENTS[take.variant]),
      { rate: take.rate, gain: take.gain * gain, at },
    );
  });
}
