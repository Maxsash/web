import { sections, type EventDetails } from "@/lib/telemetry/schema";

const sectionSelectors = {
  hero: "[data-observatory]",
  work: "#work",
  about: "#about",
  contact: "#contact",
  notebook: "#notebook",
  shore: "[data-shore]",
};

export function observeSections(
  onSection: (section: EventDetails["section_view"]["section"]) => void,
) {
  const seen = new Set<string>();
  const intersecting = new Map<Element, (typeof sections)[number]>();
  const timers = new Map<Element, ReturnType<typeof setTimeout>>();
  const stopTimers = () => {
    timers.forEach(clearTimeout);
    timers.clear();
  };
  const qualify = (element: Element, section: (typeof sections)[number]) => {
    if (document.hidden || seen.has(section) || timers.has(element)) return;
    timers.set(
      element,
      setTimeout(() => {
        timers.delete(element);
        if (document.hidden || !intersecting.has(element)) return;
        seen.add(section);
        onSection(section);
      }, 1000),
    );
  };
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const section = sections.find((name) => entry.target.matches(sectionSelectors[name]))!;
      if (entry.isIntersecting) {
        intersecting.set(entry.target, section);
        qualify(entry.target, section);
      } else {
        intersecting.delete(entry.target);
        clearTimeout(timers.get(entry.target));
        timers.delete(entry.target);
      }
    }
  });
  sections.forEach((section) => {
    const element = document.querySelector(sectionSelectors[section]);
    if (element) observer.observe(element);
  });
  const visibility = () => {
    stopTimers();
    if (!document.hidden) intersecting.forEach((section, element) => qualify(element, section));
  };
  document.addEventListener("visibilitychange", visibility);
  return () => {
    observer.disconnect();
    stopTimers();
    document.removeEventListener("visibilitychange", visibility);
  };
}

export function observeEngagement(onEngaged: () => void) {
  const marker = document.querySelector("[data-telemetry-end]");
  if (!marker) return () => {};
  let endSeen = false,
    sent = false,
    elapsed = 0;
  let last = performance.now();
  const tick = () => {
    const now = performance.now();
    if (!document.hidden) elapsed += Math.min(now - last, 1500);
    last = now;
    if (!sent && endSeen && elapsed >= 30000) {
      sent = true;
      onEngaged();
    }
  };
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) endSeen = true;
  });
  observer.observe(marker);
  const timer = setInterval(tick, 1000);
  const visibility = () => {
    last = performance.now();
  };
  document.addEventListener("visibilitychange", visibility);
  return () => {
    clearInterval(timer);
    observer.disconnect();
    document.removeEventListener("visibilitychange", visibility);
  };
}
