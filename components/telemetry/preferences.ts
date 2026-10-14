const CHANGE = "studio-analytics-preference";
export type Preference = "measure" | "off";
let preference: Preference = "measure";

export const preferenceSnapshot = () => preference;
export const serverPreference = (): Preference => "measure";

export function subscribePreference(listener: () => void) {
  window.addEventListener(CHANGE, listener);
  return () => window.removeEventListener(CHANGE, listener);
}

export function setPreference(choice: Preference) {
  preference = choice;
  window.dispatchEvent(new Event(CHANGE));
}
