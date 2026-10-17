"use client";

import { useSyncExternalStore } from "react";
import { labelSnapshot, serverLabels, setVisitLabels, subscribeLabels } from "./visit";
import { useTelemetryEnabled } from "./Telemetry";
import { stopReplay } from "./replay";
import styles from "./AnalyticsPreferences.module.css";

export default function VisitLabels() {
  const enabled = useTelemetryEnabled();
  const labels = useSyncExternalStore(subscribeLabels, labelSnapshot, serverLabels);
  if (!enabled) return null;
  return (
    <div className={styles.preferences} data-telemetry-ignore>
      <p>
        Visit label: <strong>{labels.visit_role}</strong>. Declared interest:{" "}
        <strong>
          {labels.declared_intent === "unknown" ? "not provided" : labels.declared_intent}
        </strong>
        . These are self-declared, not verified identities.
      </p>
      <p>
        What brings you here? This optional choice helps interpret visits; it does not change the
        page order or start a recording. Changing these choices ends any recording and starts a
        fresh visit.
      </p>
      <div className={styles.actions} aria-label="Your interest">
        {(
          [
            ["work", "Explore the work"],
            ["read", "Read the Notebook"],
            ["play", "Play with the sea"],
            ["unknown", "Prefer not to say"],
          ] as const
        ).map(([value, label]) => (
          <button
            type="button"
            key={value}
            aria-pressed={labels.declared_intent === value}
            onClick={() => {
              stopReplay();
              setVisitLabels({ ...labels, declared_intent: value });
            }}
          >
            {label}
          </button>
        ))}
        {labels.visit_role !== "visitor" && (
          <button
            type="button"
            onClick={() => {
              stopReplay();
              setVisitLabels({ ...labels, visit_role: "visitor" });
            }}
          >
            Clear visit label
          </button>
        )}
      </div>
    </div>
  );
}
