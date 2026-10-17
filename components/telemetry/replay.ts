import { recordingAllowed, type ReplayPolicy } from "@/lib/telemetry/replay-policy";
import type { DetectedRegion } from "@/lib/telemetry/replay-preferences";
import type { RouteCatalog } from "@/lib/telemetry/schema";
import { track } from "./actions";
import { labelSnapshot, setVisitLabels } from "./visit";
import { preferenceSnapshot, subscribePreference } from "./preferences";
import {
  initialiseReplayPreferences,
  replayPreferencesSnapshot,
  setReplayPreferences,
  subscribeReplayPreferences,
} from "./replay-preferences";

export type ReplayStatus = "off" | "loading" | "recording" | "error";
type Policy = ReplayPolicy & { token: string; host: string };
type PolicyResponse = Partial<Policy> & { detectedRegion: DetectedRegion };
type State = {
  ready: boolean;
  available: boolean;
  status: ReplayStatus;
  mode: "voluntary" | "automatic";
  reason: "voluntary" | "automatic";
  detectedRegion: DetectedRegion;
  open: boolean;
};
const initial: State = {
  ready: false,
  available: false,
  status: "off",
  mode: "voluntary",
  reason: "voluntary",
  detectedRegion: "unknown",
  open: false,
};
let state = initial;
let policy: Policy | null = null;
let catalog: RouteCatalog = { work: [], notebook: [] };
let generation = 0;
let stopRecorder: (() => void) | null = null;
let recorderTransition: Promise<void> = Promise.resolve();
let expiryTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();
export const replaySnapshot = () => state;
export const serverReplay = () => initial;
export function subscribeReplay(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function update(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}
function privacyRequested() {
  return (
    navigator.doNotTrack === "1" ||
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
  );
}
export function openReplay() {
  if (state.available) update({ open: true });
}
export function closeReplay() {
  update({ open: false });
}
export function stopReplay() {
  generation++;
  const active = state.status === "recording";
  if (active) track("replay_choice", { action: "stop", reason: state.reason });
  stopRecorder?.();
  stopRecorder = null;
  update({ status: "off" });
}
export function disableReplay() {
  stopReplay();
  const preferences = replayPreferencesSnapshot();
  setReplayPreferences({ region: preferences.region, automatic: false });
}
function automaticAllowed() {
  const preferences = replayPreferencesSnapshot();
  return preferences.automatic && preferences.storageAvailable;
}
export async function startReplay(mode: "voluntary" | "automatic" = "voluntary") {
  if (
    !policy ||
    !state.available ||
    privacyRequested() ||
    preferenceSnapshot() !== "measure" ||
    state.status === "loading" ||
    state.status === "recording"
  )
    return;
  if (!recordingAllowed(policy, mode) || (mode === "automatic" && !automaticAllowed())) return;
  if (mode === "voluntary" && labelSnapshot().visit_role !== "owner")
    setVisitLabels({ ...labelSnapshot(), visit_role: "tester" });
  const attempt = ++generation;
  const permitted = () =>
    attempt === generation &&
    !privacyRequested() &&
    preferenceSnapshot() === "measure" &&
    recordingAllowed(policy, mode) &&
    (mode === "voluntary" || automaticAllowed());
  update({ status: "loading", reason: mode, open: false });
  const activate = async () => {
    try {
      const { startRecorder } = await import("./replay-recorder");
      if (!policy || !permitted()) {
        if (attempt === generation) stopReplay();
        return;
      }
      const recorder = await startRecorder(policy, catalog, permitted);
      if (!permitted()) {
        recorder.stop();
        if (attempt === generation) stopReplay();
        return;
      }
      stopRecorder = recorder.stop;
      if (!recorder.started) {
        stopReplay();
        update({ status: "error" });
        return;
      }
      update({ status: "recording" });
      track("replay_choice", { action: "start", reason: mode });
    } catch {
      if (attempt === generation) {
        stopReplay();
        update({ status: "error" });
      }
    }
  };
  const transition = recorderTransition.then(activate);
  recorderTransition = transition.catch(() => {});
  await transition;
}
function scheduleExpiry() {
  clearTimeout(expiryTimer);
  if (policy?.mode !== "automatic" || !policy.validUntil) return;
  const remaining = Date.parse(policy.validUntil) - Date.now();
  if (remaining > 0) {
    expiryTimer = setTimeout(scheduleExpiry, Math.min(remaining, 2147483647));
    return;
  }
  if (state.status === "loading" || state.status === "recording") {
    if (state.reason === "automatic") stopReplay();
  }
  policy = { ...policy, mode: "voluntary", sampleRate: 0, validUntil: null };
  update({ mode: "voluntary" });
}
export function initialiseReplay(knownRoutes: RouteCatalog) {
  catalog = knownRoutes;
  const disposePreferences = initialiseReplayPreferences();
  let request: AbortController | null = null;
  let disposed = false;
  function refreshPolicy() {
    request?.abort();
    clearTimeout(expiryTimer);
    stopReplay();
    policy = null;
    update({ ready: false, available: false, open: false });
    const current = new AbortController();
    request = current;
    const region = replayPreferencesSnapshot().region;
    void fetch(`/api/telemetry/replay-policy?region=${region}`, {
      cache: "no-store",
      signal: current.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((result: PolicyResponse | null) => {
        if (disposed || current.signal.aborted || !result) return;
        const available =
          !!result.enabled &&
          !privacyRequested() &&
          result.host === "https://eu.i.posthog.com" &&
          !!result.token;
        policy = available ? (result as Policy) : null;
        update({
          ready: true,
          available,
          detectedRegion: result.detectedRegion,
          mode: available && result.mode === "automatic" ? "automatic" : "voluntary",
        });
        scheduleExpiry();
        if (!available) return;
        if (
          policy?.mode === "automatic" &&
          automaticAllowed() &&
          crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32 < policy.sampleRate
        )
          void startReplay("automatic");
      })
      .catch(() => {
        if (!disposed && !current.signal.aborted) update({ ready: true });
      });
  }
  const unsubscribePreferences = subscribeReplayPreferences(refreshPolicy);
  const unsubscribeAnalytics = subscribePreference(() => {
    if (preferenceSnapshot() !== "measure") stopReplay();
  });
  refreshPolicy();
  return () => {
    disposed = true;
    request?.abort();
    clearTimeout(expiryTimer);
    unsubscribePreferences();
    unsubscribeAnalytics();
    disposePreferences();
    stopReplay();
    policy = null;
    update(initial);
  };
}
