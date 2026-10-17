"use client";

import { useSyncExternalStore } from "react";
import { replayRegion, replayRegions, regionNames } from "@/lib/telemetry/replay-preferences";
import { useTelemetryEnabled } from "./Telemetry";
import { replaySnapshot, serverReplay, subscribeReplay, openReplay } from "./replay";
import {
  replayPreferencesSnapshot,
  serverReplayPreferences,
  subscribeReplayPreferences,
  setReplayPreferences,
} from "./replay-preferences";
import styles from "./AnalyticsPreferences.module.css";

export default function ReplayPreferences() {
  const enabled = useTelemetryEnabled();
  const state = useSyncExternalStore(subscribeReplay, replaySnapshot, serverReplay);
  const preferences = useSyncExternalStore(
    subscribeReplayPreferences,
    replayPreferencesSnapshot,
    serverReplayPreferences,
  );
  if (!enabled) return <p>Session recording is currently off.</p>;
  return (
    <div className={styles.preferences} data-telemetry-ignore>
      <p>
        Detected region:{" "}
        <strong>
          {state.ready ? (regionNames[state.detectedRegion] ?? regionNames.unknown) : "Checking…"}
        </strong>
        .
      </p>
      <label>
        Where are you currently browsing from?{" "}
        <select
          aria-describedby="region-explanation"
          value={preferences.region}
          onChange={(event) =>
            setReplayPreferences({
              region: replayRegion(event.target.value),
              automatic: preferences.automatic,
            })
          }
        >
          {replayRegions.map((region) => (
            <option key={region} value={region}>
              {regionNames[region]}
            </option>
          ))}
        </select>
      </label>
      <p id="region-explanation">
        Correct an inaccurate location, for example when using a VPN. Selecting India permits
        sampled automatic recording while its reviewed rule is active. This preference is saved only
        in this browser and is not included in analytics.
      </p>
      <label>
        <input
          type="checkbox"
          checked={preferences.automatic && preferences.storageAvailable}
          onChange={(event) =>
            setReplayPreferences({ region: preferences.region, automatic: event.target.checked })
          }
        />{" "}
        Allow automatic recordings where available
      </label>
      <p role="status" data-replay-policy>
        {!state.ready
          ? "Checking the recording policy…"
          : !state.available
            ? "Recording is unavailable or blocked by a browser privacy signal."
            : !preferences.automatic || !preferences.storageAvailable
              ? "Automatic recordings are off. You can still volunteer for one test visit."
              : state.mode === "automatic"
                ? "India: up to 10% of eligible visits are recorded automatically. Stop recording also saves your refusal."
                : "Your region uses voluntary recording. Nothing is recorded unless you start a test visit."}
      </p>
      {!preferences.storageAvailable && state.ready && (
        <p>
          Your browser cannot save these preferences. Automatic recording stays off; your region
          correction lasts for this page only.
        </p>
      )}
      <p>
        India’s automatic-recording rule ends on 30 April 2027 at 00:00 UTC. After that, India uses
        voluntary recording unless a new review changes the policy.
      </p>
      {state.available && (
        <div className={styles.actions}>
          <button type="button" onClick={openReplay}>
            Help test this site
          </button>
        </div>
      )}
    </div>
  );
}
