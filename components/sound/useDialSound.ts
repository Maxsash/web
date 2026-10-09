import { type RefObject, useEffect } from "react";
import { soundsRunning } from "./sound";
import { createDetentTicker } from "./ticker";
import { ratchet } from "@/lib/sound/dial";

export function useDialSound(dial: RefObject<Element | null>, turn: number) {
  useEffect(() => {
    const element = dial.current;
    if (!element) return;
    const tick = createDetentTicker();
    let detent: number | null = null;
    let frame = 0;
    let scrolling: AbortController | null = null;

    const turned = () => {
      frame = 0;
      if (!soundsRunning()) {
        detent = null;
        return;
      }
      const progress = Number.parseFloat(getComputedStyle(element).getPropertyValue("--progress"));
      const step = ratchet(detent, (progress - 0.5) * turn);
      detent = step.detent;
      tick(step.clicks);
    };

    const observer = new IntersectionObserver(([entry]) => {
      scrolling?.abort();
      scrolling = null;
      detent = null;
      if (!entry.isIntersecting) return;
      scrolling = new AbortController();
      addEventListener("scroll", () => (frame ||= requestAnimationFrame(turned)), {
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
  }, [dial, turn]);
}
