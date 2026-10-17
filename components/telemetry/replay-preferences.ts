import {
  defaultReplayPreferences,
  parseReplayPreferences,
  replayPreferenceKey,
  type ReplayPreferences,
} from "@/lib/telemetry/replay-preferences";

type State = ReplayPreferences & { storageAvailable: boolean };
const initial: State = { ...defaultReplayPreferences, storageAvailable: false };
let state = initial;
const listeners = new Set<() => void>();
export const replayPreferencesSnapshot = () => state;
export const serverReplayPreferences = () => initial;
export function subscribeReplayPreferences(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function update(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}
function readPreferences() {
  try {
    const preferences = parseReplayPreferences(localStorage.getItem(replayPreferenceKey));
    localStorage.setItem(`${replayPreferenceKey}-check`, "1");
    localStorage.removeItem(`${replayPreferenceKey}-check`);
    update({ ...preferences, storageAvailable: true });
  } catch {
    update({ ...initial, automatic: false });
  }
}
export function initialiseReplayPreferences() {
  readPreferences();
  const changed = (event: StorageEvent) => {
    if (event.key === replayPreferenceKey || event.key === null) readPreferences();
  };
  window.addEventListener("storage", changed);
  return () => window.removeEventListener("storage", changed);
}
export function setReplayPreferences(next: ReplayPreferences) {
  try {
    localStorage.setItem(replayPreferenceKey, JSON.stringify({ version: 1, ...next }));
    update({ ...next, storageAvailable: true });
  } catch {
    update({ ...next, automatic: false, storageAvailable: false });
  }
}
