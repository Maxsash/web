/** The saved choice, else the OS preference. The root layout inlines this in <head> so the first
 * paint (and Safari's bar colours, read once around load) has the visitor's theme; it is
 * serialised, so it must not reference anything outside itself. Returns whether it was saved. */
export function applyInitialTheme() {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem("studio-theme");
  } catch {}
  const chosen = saved === "night" || saved === "day";
  const night = chosen ? saved === "night" : matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.studioTheme = night ? "night" : "day";
  return chosen;
}
