"use client";

import { useAnalyticsPreference, useTelemetryEnabled } from "./Telemetry";
import { setPreference } from "./preferences";
import styles from "./AnalyticsPreferences.module.css";

export default function AnalyticsPreferences() {
  const enabled = useTelemetryEnabled();
  const preference = useAnalyticsPreference();
  if (!enabled) return <p>Visitor analytics is currently off.</p>;
  const measuring = preference === "measure";
  return (
    <div className={styles.preferences} data-telemetry-ignore>
      <p id="analytics-explanation">
        Analytics uses a temporary identifier held only in memory. It is forgotten when you reload
        or close this page. There are no analytics cookies or saved visitor identifiers.
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          aria-describedby="analytics-explanation"
          aria-pressed={!measuring}
          onClick={() => setPreference(measuring ? "off" : "measure")}
        >
          {measuring ? "Pause analytics for this visit" : "Resume analytics for this visit"}
        </button>
      </div>
      <p role="status">
        {measuring
          ? "Analytics is on for this page. You can pause it here."
          : "Analytics is paused for this visit. Reloading starts a new visit with analytics on."}
      </p>
    </div>
  );
}
