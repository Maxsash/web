import { acquisitionValues, type Acquisition } from "./acquisition.ts";
import { visitRoles, visitIntents, type VisitLabels } from "./visit-labels.ts";

export type RouteCatalog = { work: string[]; notebook: string[] };
export type RouteGroup = "home" | "work" | "notebook" | "studio" | "print" | "privacy" | "error";
export type TelemetryRoute = { route: string; route_group: RouteGroup };
export type VisitContext = Partial<VisitLabels & Acquisition> & {
  device: "touch" | "pointer" | "unknown";
  browser: "safari" | "chrome" | "firefox" | "edge" | "other";
  viewport: "narrow" | "medium" | "wide";
};

export const sections = ["hero", "work", "about", "contact", "notebook", "shore"] as const;
export const studioActions = [
  "preset",
  "randomise",
  "setting",
  "copy",
  "save",
  "print",
  "sail",
] as const;
export const placements = [
  "hero",
  "work",
  "about",
  "contact",
  "notebook",
  "shore",
  "article",
  "case-study",
  "studio",
  "navigation",
  "other",
] as const;

export type EventDetails = {
  page_view: Pick<Acquisition, "source" | "campaign">;
  section_view: { section: (typeof sections)[number] };
  content_open: {
    content: "work" | "notebook";
    slug: string;
    placement: (typeof placements)[number];
  };
  content_engaged: { content: "work" | "notebook"; slug: string };
  contact_action: {
    channel: "email" | "whatsapp";
    action: "open" | "copy";
    placement: (typeof placements)[number];
  };
  studio_action: {
    action: (typeof studioActions)[number];
    setting: "swell" | "heading" | "character" | "variation" | "none";
  };
  navigation_result: {
    target: string;
    outcome: "completed" | "timeout" | "late";
    duration: "under-1s" | "1-3s" | "3-10s" | "over-10s";
    repeated: boolean;
  };
  replay_choice: { action: "start" | "stop"; reason: "voluntary" | "automatic" };
  experience_issue: { issue: "route-error" | "not-found" | "static-fallback" | "context-lost" };
};
export type EventName = keyof EventDetails;
export type TelemetryEvent = {
  [Name in EventName]: TelemetryRoute & {
    event: Name;
    properties: EventDetails[Name];
    timestamp: string;
  };
}[EventName];
export type TelemetryBatch = { session: string; context: VisitContext; events: TelemetryEvent[] };

const member = <T extends string>(value: unknown, options: readonly T[]): value is T =>
  typeof value === "string" && options.includes(value as T);
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

export function normaliseRoute(path: string, catalog: RouteCatalog): TelemetryRoute {
  const route = path.split(/[?#]/, 1)[0];
  const fixed: Record<string, RouteGroup> = {
    "/": "home",
    "/work": "work",
    "/blog": "notebook",
    "/sea": "studio",
    "/plate": "print",
    "/privacy": "privacy",
  };
  if (Object.hasOwn(fixed, route)) return { route, route_group: fixed[route] };
  for (const [prefix, slugs, group] of [
    ["/work/", catalog.work, "work"],
    ["/blog/", catalog.notebook, "notebook"],
  ] as const) {
    if (route.startsWith(prefix) && slugs.includes(route.slice(prefix.length)))
      return { route, route_group: group };
  }
  return { route: "/unknown", route_group: "error" };
}

export function durationBucket(ms: number): EventDetails["navigation_result"]["duration"] {
  return ms < 1000 ? "under-1s" : ms < 3000 ? "1-3s" : ms < 10000 ? "3-10s" : "over-10s";
}

function eventProperties(
  name: unknown,
  p: Record<string, unknown>,
  catalog: RouteCatalog,
): EventDetails[EventName] | null {
  switch (name) {
    case "page_view":
      return member(p.source, acquisitionValues.source) &&
        member(p.campaign, acquisitionValues.campaign)
        ? { source: p.source, campaign: p.campaign }
        : null;
    case "section_view":
      return member(p.section, sections) ? { section: p.section } : null;
    case "content_open":
    case "content_engaged": {
      if (
        !member(p.content, ["work", "notebook"]) ||
        typeof p.slug !== "string" ||
        !catalog[p.content].includes(p.slug)
      )
        return null;
      const content = { content: p.content, slug: p.slug };
      if (name === "content_engaged") return content;
      return member(p.placement, placements) ? { ...content, placement: p.placement } : null;
    }
    case "contact_action":
      return member(p.channel, ["email", "whatsapp"]) &&
        member(p.action, ["open", "copy"]) &&
        member(p.placement, placements)
        ? { channel: p.channel, action: p.action, placement: p.placement }
        : null;
    case "studio_action":
      return member(p.action, studioActions) &&
        member(p.setting, ["swell", "heading", "character", "variation", "none"])
        ? { action: p.action, setting: p.setting }
        : null;
    case "navigation_result": {
      if (
        typeof p.target !== "string" ||
        !member(p.outcome, ["completed", "timeout", "late"]) ||
        !member(p.duration, ["under-1s", "1-3s", "3-10s", "over-10s"]) ||
        typeof p.repeated !== "boolean"
      )
        return null;
      return {
        target: normaliseRoute(p.target, catalog).route,
        outcome: p.outcome,
        duration: p.duration,
        repeated: p.repeated,
      };
    }
    case "replay_choice":
      return member(p.action, ["start", "stop"]) && member(p.reason, ["voluntary", "automatic"])
        ? { action: p.action, reason: p.reason }
        : null;
    case "experience_issue":
      return member(p.issue, ["route-error", "not-found", "static-fallback", "context-lost"])
        ? { issue: p.issue }
        : null;
    default:
      return null;
  }
}

export function sanitiseBatch(
  input: unknown,
  catalog: RouteCatalog,
  now = Date.now(),
): TelemetryBatch | null {
  if (
    !record(input) ||
    typeof input.session !== "string" ||
    !/^[a-f\d]{8}-[a-f\d]{4}-[47][a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i.test(input.session)
  )
    return null;
  if (!Array.isArray(input.events) || input.events.length < 1 || input.events.length > 20)
    return null;
  if (
    !record(input.context) ||
    !member(input.context.device, ["touch", "pointer", "unknown"]) ||
    !member(input.context.browser, ["safari", "chrome", "firefox", "edge", "other"]) ||
    !member(input.context.viewport, ["narrow", "medium", "wide"])
  )
    return null;
  if (input.context.visit_role !== undefined && !member(input.context.visit_role, visitRoles))
    return null;
  if (
    input.context.declared_intent !== undefined &&
    !member(input.context.declared_intent, visitIntents)
  )
    return null;
  const attribution: Partial<Acquisition> = {};
  for (const key of Object.keys(acquisitionValues) as (keyof Acquisition)[]) {
    const value = input.context[key];
    if (value === undefined) continue;
    if (!member(value, acquisitionValues[key])) return null;
    Object.assign(attribution, { [key]: value });
  }
  const context: VisitContext = {
    ...attribution,
    device: input.context.device,
    browser: input.context.browser,
    viewport: input.context.viewport,
    ...(input.context.visit_role !== undefined
      ? { visit_role: input.context.visit_role as VisitLabels["visit_role"] }
      : {}),
    ...(input.context.declared_intent !== undefined
      ? { declared_intent: input.context.declared_intent as VisitLabels["declared_intent"] }
      : {}),
  };
  const events: TelemetryEvent[] = [];
  for (const item of input.events) {
    if (
      !record(item) ||
      !record(item.properties) ||
      typeof item.route !== "string" ||
      typeof item.timestamp !== "string"
    )
      return null;
    const time = Date.parse(item.timestamp);
    if (!Number.isFinite(time) || time > now + 60000 || time < now - 30 * 60000) return null;
    const properties = eventProperties(item.event, item.properties, catalog);
    if (!properties) return null;
    events.push({
      ...normaliseRoute(item.route, catalog),
      event: item.event,
      timestamp: new Date(time).toISOString(),
      properties,
    } as TelemetryEvent);
  }
  return { session: input.session, context, events };
}
