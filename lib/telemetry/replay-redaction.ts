import { normaliseRoute, type RouteCatalog } from "./schema.ts";

export function replayUrl(value: string, origin: string, catalog: RouteCatalog): string {
  try {
    const url = new URL(value, origin);
    if (url.origin !== origin) return "about:blank";
    const path = url.pathname;
    if (
      path.startsWith("/_next/static/") ||
      path.startsWith("/images/") ||
      /^\/(favicon\.ico|icon\.svg|apple-icon\.png)$/.test(path)
    )
      return new URL(path, origin).href;
    return new URL(normaliseRoute(path, catalog).route, origin).href;
  } catch {
    return "about:blank";
  }
}

export function redactReplay(value: unknown, cleanUrl: (url: string) => string): unknown {
  if (Array.isArray(value))
    return value
      .filter(
        (item) =>
          !(
            item &&
            typeof item === "object" &&
            "type" in item &&
            (item.type === 6 || item.type === 5)
          ),
      )
      .map((item) => redactReplay(item, cleanUrl));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      typeof item === "string" && ["href", "url", "src", "$current_url", "$referrer"].includes(key)
        ? cleanUrl(item)
        : redactReplay(item, cleanUrl),
    ]),
  );
}
