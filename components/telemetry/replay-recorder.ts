import type { PostHogConfig } from "posthog-js";
import type { RouteCatalog } from "@/lib/telemetry/schema";
import { replayUrl, redactReplay } from "@/lib/telemetry/replay-redaction";
import { currentVisit, setReplaySession } from "./session";
import { labelSnapshot } from "./visit";
import { version } from "@/package.json";

let initialised = false;

export async function startRecorder(
  config: { token: string; host: string },
  catalog: RouteCatalog,
  allowed: () => boolean,
) {
  const { default: posthog } = await import("posthog-js/full/no-external");
  let active = true;
  const cleanUrl = (url: string) => replayUrl(url, location.origin, catalog);
  const session = currentVisit();
  if (!allowed()) return { started: false, stop() {} };
  const options: Partial<PostHogConfig> = {
    api_host: config.host,
    disable_session_recording: true,
    ui_host: "https://eu.posthog.com",
    persistence: "memory",
    session_idle_timeout_seconds: 1800,
    bootstrap: { distinctID: session, sessionID: session, isIdentifiedID: false },
    person_profiles: "never",
    ip: false,
    autocapture: false,
    rageclick: false,
    capture_dead_clicks: false,
    capture_pageview: false,
    capture_pageleave: false,
    capture_performance: false,
    capture_exceptions: false,
    disableDeviceModel: true,
    capture_heatmaps: false,
    enable_recording_console_log: false,
    logs: { captureConsoleLogs: false, beforeSend: () => null },
    disable_surveys: true,
    disable_conversations: true,
    disable_product_tours: true,
    disable_web_experiments: true,
    disable_external_dependency_loading: true,
    advanced_disable_feature_flags: true,
    save_referrer: false,
    save_campaign_params: false,
    disable_capture_url_hashes: true,
    request_batching: false,
    respect_dnt: true,
    get_current_url: cleanUrl,
    session_recording: {
      maskAllInputs: true,
      blockSelector:
        "[data-telemetry-ignore], a[href^='mailto:'], a[href*='wa.me'], canvas, script, iframe",
      recordBody: false,
      recordHeaders: false,
      captureCanvas: { recordCanvas: false },
      captureJsonLd: false,
      slimDOMOptions: "all",
      compress_events: false,
      maskAttributeFn: (name, value) => {
        if (["href", "src", "action", "poster"].includes(name)) return cleanUrl(value);
        if (name.startsWith("data-") || name.startsWith("on") || ["value", "srcset"].includes(name))
          return "";
        return value;
      },
      maskCapturedNetworkRequestFn: (request) =>
        Object.keys(request).length === 1 ? { ...request, name: cleanUrl(request.name) } : null,
    },
    before_send: (event) => {
      if (!active || !allowed() || event.event !== "$snapshot") return null;
      return {
        ...event,
        properties: {
          $snapshot_data: redactReplay(event.properties.$snapshot_data, cleanUrl),
          $snapshot_bytes: event.properties.$snapshot_bytes,
          $session_id: event.properties.$session_id,
          $window_id: event.properties.$window_id,
          $lib: event.properties.$lib,
          $lib_version: event.properties.$lib_version,
          token: config.token,
          distinct_id: event.properties.$session_id,
          $process_person_profile: false,
          $geoip_disable: true,
          $ip: null,
          site_release: version,
          schema_version: 1,
          ...labelSnapshot(),
        },
      };
    },
  };
  if (initialised) {
    posthog.set_config(options);
    posthog.reset({ resetDeviceID: true, bootstrap: options.bootstrap });
  } else {
    posthog.init(config.token, options);
    initialised = true;
  }
  const unsubscribe = posthog.onSessionId((id) => {
    if (active && allowed()) setReplaySession(id);
  });
  // Trigger overrides can emit snapshots synchronously, so enable capture first.
  posthog.set_config({ disable_session_recording: false });
  posthog.startSessionRecording(true);
  for (
    let attempt = 0;
    attempt < 100 && active && allowed() && !posthog.sessionRecordingStarted();
    attempt++
  )
    await new Promise((resolve) => setTimeout(resolve, 100));
  return {
    started: posthog.sessionRecordingStarted(),
    stop() {
      active = false;
      unsubscribe();
      posthog.stopSessionRecording();
      setReplaySession(null);
    },
  };
}
