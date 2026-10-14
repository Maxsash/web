export function telemetryConfig() {
  const token = process.env.POSTHOG_PROJECT_TOKEN;
  const host = process.env.POSTHOG_HOST ?? "https://eu.i.posthog.com";
  const permitted = ["https://eu.i.posthog.com", "https://us.i.posthog.com"];
  const production =
    process.env.NODE_ENV === "production" &&
    (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production");
  const enabled =
    production && process.env.TELEMETRY_ENABLED === "true" && !!token && permitted.includes(host);
  return { enabled, token, host };
}
