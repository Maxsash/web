import { respond } from "@/components/feedback/respond";
import { applyInitialTheme } from "./initial-theme";

type ThemeOrigin = "sky" | "control" | "system";
let manual = false;
let followers = 0;
let stopFollowing: (() => void) | null = null;

export const nightTheme = () => document.documentElement.dataset.studioTheme === "night";

export function subscribeTheme(callback: () => void) {
  window.addEventListener("studio-theme", callback);
  return () => window.removeEventListener("studio-theme", callback);
}

function applyTheme(night: boolean, origin: ThemeOrigin) {
  document.documentElement.dataset.studioTheme = night ? "night" : "day";
  window.dispatchEvent(new CustomEvent("studio-theme", { detail: { origin } }));
}

export function toggleTheme(origin: "sky" | "control" = "control") {
  const night = !nightTheme();
  manual = true;
  respond(night ? "dusk" : "dawn");
  try {
    localStorage.setItem("studio-theme", night ? "night" : "day");
  } catch {}
  applyTheme(night, origin);
}

export function followTheme() {
  if (followers++ === 0) {
    const media = matchMedia("(prefers-color-scheme: dark)");
    manual = applyInitialTheme();
    applyTheme(nightTheme(), "system");
    const followSystem = () => {
      if (!manual) applyTheme(media.matches, "system");
    };
    media.addEventListener("change", followSystem);
    stopFollowing = () => media.removeEventListener("change", followSystem);
  }
  return () => {
    if (--followers === 0) {
      stopFollowing?.();
      stopFollowing = null;
    }
  };
}
