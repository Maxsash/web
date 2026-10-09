import { IDLE_AFTER, idleLevel } from "@/lib/feedback/idle";
import { FEEDBACK } from "@/lib/feedback/vocabulary";
import { respond } from "./respond";

const WELCOME_MS = 3000;
const ANCHORED_ICON = "/at-anchor.svg";
const ACTIVITY = ["pointermove", "pointerdown", "keydown", "wheel", "scroll", "touchstart"];

export function watchIdle(signal: AbortSignal) {
  const root = document.documentElement;
  let active = performance.now();
  let timer = 0;
  const check = () => {
    const seconds = (performance.now() - active) / 1000;
    const level = idleLevel(seconds);
    if (level) root.dataset.idle = String(level);
    else delete root.dataset.idle;
    const next = IDLE_AFTER[level];
    timer = next === undefined ? 0 : window.setTimeout(check, (next - seconds) * 1000 + 20);
  };
  const wake = () => {
    active = performance.now();
    if (!root.dataset.idle) return;
    clearTimeout(timer);
    check();
  };
  for (const type of ACTIVITY)
    addEventListener(type, wake, { capture: true, passive: true, signal });
  check();
  signal.addEventListener("abort", () => {
    clearTimeout(timer);
    delete root.dataset.idle;
  });
}

export function watchAbsence(signal: AbortSignal) {
  let title: string | null = null;
  let icons: [HTMLLinkElement, string | null][] = [];
  let welcome = 0;
  const settle = () => {
    if (title !== null) document.title = title;
    title = null;
  };
  const leave = () => {
    clearTimeout(welcome);
    title ??= document.title;
    document.title = `${FEEDBACK.away.title} · ${title}`;
    icons = [...document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]')].map((link) => [
      link,
      link.getAttribute("href"),
    ]);
    icons.forEach(([link]) => link.setAttribute("href", ANCHORED_ICON));
  };
  const back = () => {
    icons.forEach(([link, href]) => href !== null && link.setAttribute("href", href));
    icons = [];
    if (title === null) return;
    document.title = `${FEEDBACK.back.title} · ${title}`;
    welcome = window.setTimeout(settle, WELCOME_MS);
  };
  document.addEventListener("visibilitychange", () => (document.hidden ? leave() : back()), {
    signal,
  });
  signal.addEventListener("abort", () => {
    clearTimeout(welcome);
    back();
    settle();
  });
}

export function watchConnection(signal: AbortSignal) {
  const root = document.documentElement;
  const mark = (online: boolean) => {
    if (online) delete root.dataset.offline;
    else root.dataset.offline = "";
  };
  mark(navigator.onLine);
  for (const online of [true, false])
    addEventListener(
      online ? "online" : "offline",
      () => {
        mark(online);
        respond(online ? "online" : "offline");
      },
      { signal },
    );
  signal.addEventListener("abort", () => mark(true));
}
