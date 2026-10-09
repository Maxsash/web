import { type RefObject, useEffect } from "react";
import { audio, playClip, soundRunning } from "@/components/sound/sound";
import { DETENTS, chooseDetent, clickTimes, ratchet, synthesizeDetent } from "@/lib/sound/dial";
import { TURN } from "./medal";

export function useDialSound(medal: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = medal.current;
    if (!element) return;
    let detent: number | null = null;
    let last = 0;
    let previous = -1;
    let frame = 0;
    let scrolling: AbortController | null = null;

    const turn = () => {
      frame = 0;
      const context = audio();
      if (!context || !soundRunning()) {
        detent = null;
        return;
      }
      const progress = Number.parseFloat(getComputedStyle(element).getPropertyValue("--progress"));
      const step = ratchet(detent, (progress - 0.5) * TURN);
      detent = step.detent;
      for (const at of clickTimes(context.currentTime, last, step.clicks)) {
        const take = chooseDetent(Math.random, previous);
        previous = take.variant;
        last = at;
        playClip(
          `detent-${take.variant}`,
          (sampleRate) => synthesizeDetent(sampleRate, DETENTS[take.variant]),
          { rate: take.rate, gain: take.gain, at },
        );
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      scrolling?.abort();
      scrolling = null;
      detent = null;
      if (!entry.isIntersecting) return;
      scrolling = new AbortController();
      addEventListener("scroll", () => (frame ||= requestAnimationFrame(turn)), {
        passive: true,
        signal: scrolling.signal,
      });
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      scrolling?.abort();
      cancelAnimationFrame(frame);
    };
  }, [medal]);
}
