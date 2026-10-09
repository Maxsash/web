import { isAction } from "@/lib/feedback/vocabulary";
import { respond } from "./respond";

const CROSSINGS = "main > section, main ~ footer";

export function watchArrivals(signal: AbortSignal) {
  const arrivals = new IntersectionObserver(
    (entries) => {
      for (const { isIntersecting, target } of entries) {
        if (!isIntersecting || !(target instanceof HTMLElement || target instanceof SVGElement))
          continue;
        arrivals.unobserve(target);
        target.dataset.arrived = "";
        const cue = target.dataset.arriveCue;
        if (isAction(cue)) respond(cue);
      }
    },
    { rootMargin: "0px 0px -12% 0px" },
  );
  let settled = false;
  const crossings = new IntersectionObserver(
    (entries) => {
      if (settled && entries.some((entry) => entry.isIntersecting)) respond("cross");
      settled = true;
    },
    { rootMargin: "-50% 0px -50% 0px" },
  );
  document
    .querySelectorAll("[data-arrive]:not([data-arrived])")
    .forEach((element) => arrivals.observe(element));
  document.querySelectorAll(CROSSINGS).forEach((element) => crossings.observe(element));
  signal.addEventListener("abort", () => {
    arrivals.disconnect();
    crossings.disconnect();
  });
}
