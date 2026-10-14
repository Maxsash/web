import type { TelemetryEvent, VisitContext } from "@/lib/telemetry/schema";
import { preferenceSnapshot } from "./preferences";

export function eventTransport() {
  const agent = navigator.userAgent;
  const context: VisitContext = {
    device: matchMedia("(pointer: coarse)").matches ? "touch" : "pointer",
    browser: /Edg\//.test(agent)
      ? "edge"
      : /Firefox\//.test(agent)
        ? "firefox"
        : /Chrome\/|CriOS\//.test(agent)
          ? "chrome"
          : /Safari\//.test(agent)
            ? "safari"
            : "other",
    viewport: innerWidth < 760 ? "narrow" : innerWidth < 1200 ? "medium" : "wide",
  };
  let queue: TelemetryEvent[] = [];
  let session = "";
  let timer: ReturnType<typeof setTimeout> | undefined;
  const requests = new Set<AbortController>();
  let stopped = false;
  const flush = () => {
    clearTimeout(timer);
    timer = undefined;
    if (stopped || !queue.length) return;
    if (preferenceSnapshot() !== "measure") {
      queue = [];
      return;
    }
    const body = JSON.stringify({ session, context, events: queue });
    queue = [];
    const controller = new AbortController();
    requests.add(controller);
    void fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      signal: controller.signal,
    })
      .catch(() => {})
      .finally(() => requests.delete(controller));
  };
  return {
    push(id: string, event: TelemetryEvent) {
      if (stopped) return;
      if (session && session !== id) flush();
      session = id;
      queue.push(event);
      if (queue.length >= 20) flush();
      else timer ??= setTimeout(flush, 1500);
    },
    flush,
    stop() {
      stopped = true;
      clearTimeout(timer);
      queue = [];
      requests.forEach((controller) => controller.abort());
      requests.clear();
    },
  };
}
