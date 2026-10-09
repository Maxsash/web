import { isAction, type Action } from "./vocabulary.ts";

export type Activated = {
  tag: string;
  declared?: string | null;
  href?: string | null;
  download?: boolean;
  newTab?: boolean;
  location?: { origin: string; pathname: string; search: string };
};

export function activationFor({
  tag,
  declared,
  href,
  download,
  newTab,
  location,
}: Activated): Action | null {
  if (declared !== undefined && declared !== null) return isAction(declared) ? declared : null;
  if (tag === "summary") return null;
  if (tag !== "a") return "press";
  if (!href) return null;
  if (href.startsWith("#")) return "glide";
  if (href.startsWith("mailto:")) return "mail";
  if (download) return "save";
  if (!location) return null;
  const url = new URL(href, location.origin + location.pathname);
  if (url.origin !== location.origin || newTab) return "leave";
  if (url.pathname === location.pathname && url.search === location.search) return "glide";
  return null;
}
