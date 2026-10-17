"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useAnalyticsPreference } from "./Telemetry";
import {
  closeReplay,
  replaySnapshot,
  serverReplay,
  startReplay,
  disableReplay,
  stopReplay,
  subscribeReplay,
} from "./replay";
import styles from "./ReplayControls.module.css";

export default function ReplayControls() {
  const state = useSyncExternalStore(subscribeReplay, replaySnapshot, serverReplay);
  const preference = useAnalyticsPreference();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (state.open && !dialog.current?.open) dialog.current?.showModal();
    else if (!state.open && dialog.current?.open) dialog.current.close();
  }, [state.open]);
  if (!state.available) return null;
  const recording = state.status === "recording";
  return (
    <>
      {(recording || state.status === "loading" || state.status === "error") && (
        <aside
          className={styles.status}
          aria-label="Site testing"
          data-replay-status
          data-telemetry-ignore
        >
          <span role="status">
            {recording
              ? "Session recording on"
              : state.status === "loading"
                ? "Starting test session…"
                : "Recording unavailable"}
          </span>
          {state.status !== "error" ? (
            <button type="button" onClick={disableReplay}>
              {recording ? "Stop recording" : "Cancel"}
            </button>
          ) : (
            <button type="button" onClick={stopReplay}>
              Dismiss
            </button>
          )}
        </aside>
      )}
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="replay-title"
        aria-describedby="replay-description"
        onCancel={closeReplay}
        onClose={closeReplay}
        data-telemetry-ignore
      >
        <h2 id="replay-title">Help test this site</h2>
        <p id="replay-description">
          Share a recording of how you use this site to help improve navigation and understand what
          visitors come here to do.
        </p>
        <p>
          PostHog receives page content, clicks and scrolling. Typed inputs and contact links are
          hidden. The animated sea, console logs and network bodies are not recorded. Recordings are
          kept for up to 30 days.
        </p>
        <p>
          Your test visit is labelled “tester” (or “owner” if you used an owner link). This is a
          visit label, not your identity. You can stop at any time; reloading ends this permission.
          Starting this test does not change your saved automatic-recording choice.{" "}
          <a href="/privacy">Privacy & recordings</a>
        </p>
        {preference !== "measure" && (
          <p>Analytics is paused. Resume it on the privacy page before starting a test.</p>
        )}
        {state.status === "error" && (
          <p role="status">
            The recorder could not start. Your browser may be blocking it. The site still works
            normally.
          </p>
        )}
        <div className={styles.actions}>
          <button type="button" onClick={closeReplay}>
            Close
          </button>
          {recording ? (
            <button
              type="button"
              onClick={() => {
                disableReplay();
                closeReplay();
              }}
            >
              Stop recording
            </button>
          ) : (
            <button
              type="button"
              disabled={preference !== "measure" || state.status === "loading"}
              onClick={() => void startReplay()}
            >
              Start test session
            </button>
          )}
        </div>
      </dialog>
    </>
  );
}
