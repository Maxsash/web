import {
  acquisition,
  durationBucket,
  normaliseRoute,
  placements,
  type EventDetails,
  type EventName,
  type RouteCatalog,
  type TelemetryEvent,
} from "@/lib/telemetry/schema";
import { connectTelemetry } from "./actions";
import { observeEngagement, observeSections } from "./observations";
import { eventTransport } from "./transport";
import { visitSession } from "./session";
import { preferenceSnapshot } from "./preferences";

type Pending = {
  target: string;
  started: number;
  repeated: boolean;
  timedOut: boolean;
  timer: ReturnType<typeof setTimeout>;
};

export function observeJourney(catalog: RouteCatalog) {
  const transport = eventTransport();
  const session = visitSession();
  const entry = acquisition(document.referrer, location.origin, location.search);
  let route = normaliseRoute(location.pathname, catalog);
  let currentSession = "";
  let stopRoute = () => {};
  let pending: Pending | null = null;
  let stopped = false;
  const events = new AbortController();
  const emit = <Name extends EventName>(event: Name, properties: EventDetails[Name]) => {
    if (stopped || preferenceSnapshot() !== "measure") return;
    const id = session();
    const timestamp = new Date().toISOString();
    if (id !== currentSession) {
      currentSession = id;
      if (event !== "page_view")
        transport.push(id, { ...route, event: "page_view", properties: entry, timestamp });
    }
    transport.push(id, { ...route, event, properties, timestamp } as TelemetryEvent);
  };
  const disconnect = connectTelemetry(emit);
  const placement = (element: Element): EventDetails["content_open"]["placement"] => {
    const explicit = element
      .closest("[data-telemetry-placement]")
      ?.getAttribute("data-telemetry-placement");
    if (explicit && placements.includes(explicit as (typeof placements)[number]))
      return explicit as (typeof placements)[number];
    if (element.closest("[data-shore],footer")) return "shore";
    for (const section of ["work", "about", "contact", "notebook"] as const)
      if (element.closest(`#${section}`)) return section;
    if (element.closest("[data-observatory]")) return "hero";
    return route.route_group === "work"
      ? "case-study"
      : route.route_group === "notebook"
        ? "article"
        : route.route_group === "studio"
          ? "studio"
          : "navigation";
  };
  const finishNavigation = (outcome: EventDetails["navigation_result"]["outcome"]) => {
    if (!pending) return;
    emit("navigation_result", {
      target: pending.target,
      outcome,
      duration: durationBucket(performance.now() - pending.started),
      repeated: pending.repeated,
    });
  };
  document.addEventListener(
    "click",
    (event) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.closest("[data-telemetry-ignore]")) return;
      const url = new URL(anchor.href, location.href);
      const position = placement(anchor);
      if (url.protocol === "mailto:")
        emit("contact_action", { channel: "email", action: "open", placement: position });
      else if (["wa.me", "api.whatsapp.com", "web.whatsapp.com"].includes(url.hostname))
        emit("contact_action", { channel: "whatsapp", action: "open", placement: position });
      if (url.origin !== location.origin) return;
      const target = normaliseRoute(url.pathname, catalog);
      const content = target.route_group;
      const slug = target.route.split("/")[2];
      if (slug && (content === "work" || content === "notebook"))
        emit("content_open", { content, slug, placement: position });
      if (route.route_group === "studio" || route.route_group === "print") {
        const action = anchor.hasAttribute("download")
          ? "save"
          : url.pathname === "/plate"
            ? "print"
            : url.pathname === "/"
              ? "sail"
              : null;
        if (action) emit("studio_action", { action, setting: "none" });
      }
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        target.route_group === "error"
      )
        return;
      if (url.pathname === location.pathname) return;
      if (pending?.target === target.route) {
        pending.repeated = true;
        return;
      }
      if (pending) clearTimeout(pending.timer);
      pending = {
        target: target.route,
        started: performance.now(),
        repeated: false,
        timedOut: false,
        timer: setTimeout(() => {
          if (pending) {
            pending.timedOut = true;
            finishNavigation("timeout");
          }
        }, 10000),
      };
    },
    { capture: true, signal: events.signal },
  );
  const flushHidden = () => {
    if (document.hidden) transport.flush();
  };
  document.addEventListener("visibilitychange", flushHidden, { signal: events.signal });
  window.addEventListener("pagehide", transport.flush, { signal: events.signal });

  return {
    visit() {
      stopRoute();
      route = normaliseRoute(location.pathname, catalog);
      emit("page_view", entry);
      if (pending && route.route === pending.target) {
        clearTimeout(pending.timer);
        finishNavigation(pending.timedOut ? "late" : "completed");
        pending = null;
      }
      const cleanups: (() => void)[] = [];
      const issues = new Set<string>();
      const issue = (code: EventDetails["experience_issue"]["issue"]) => {
        if (!issues.has(code)) {
          issues.add(code);
          emit("experience_issue", { issue: code });
        }
      };
      if (route.route_group === "home")
        cleanups.push(observeSections((section) => emit("section_view", { section })));
      const content = route.route_group;
      const slug = route.route.split("/")[2];
      if (slug && (content === "work" || content === "notebook"))
        cleanups.push(observeEngagement(() => emit("content_engaged", { content, slug })));
      const scene = document.querySelector<HTMLElement>("[data-observatory]");
      if (scene) {
        const check = () => {
          if (scene.dataset.rendering === "fallback") issue("static-fallback");
        };
        const observer = new MutationObserver(check);
        observer.observe(scene, { attributes: true, attributeFilter: ["data-rendering"] });
        check();
        const lost = () => issue("context-lost");
        scene.addEventListener("webglcontextlost", lost, true);
        cleanups.push(() => {
          observer.disconnect();
          scene.removeEventListener("webglcontextlost", lost, true);
        });
      }
      const failure = document
        .querySelector("[data-telemetry-error]")
        ?.getAttribute("data-telemetry-error");
      if (failure === "route-error") issue("route-error");
      else if (route.route_group === "error" || failure === "not-found") issue("not-found");
      stopRoute = () => cleanups.forEach((cleanup) => cleanup());
    },
    stop() {
      stopped = true;
      stopRoute();
      events.abort();
      disconnect();
      if (pending) clearTimeout(pending.timer);
      transport.stop();
    },
  };
}
