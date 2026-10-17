import { detectedRegion, replayRegion } from "@/lib/telemetry/replay-preferences";
import { telemetryConfig } from "@/lib/telemetry/config";
import { replayPolicy, privacySignal } from "@/lib/telemetry/replay-policy";

export function GET(request: Request) {
  const config = telemetryConfig();
  const enabled =
    config.enabled &&
    config.host === "https://eu.i.posthog.com" &&
    process.env.REPLAY_ENABLED === "true" &&
    !privacySignal(request.headers);
  const country = process.env.VERCEL === "1" ? request.headers.get("x-vercel-ip-country") : null;
  const detected = detectedRegion(country);
  const supplied = new URL(request.url).searchParams.getAll("region");
  const correction = supplied.length === 1 ? replayRegion(supplied[0]) : "auto";
  const region = correction === "auto" ? detected : correction;
  return Response.json(
    enabled
      ? {
          ...replayPolicy(region),
          detectedRegion: detected,
          token: config.token,
          host: config.host,
        }
      : { enabled: false, detectedRegion: detected },
    {
      headers: {
        "Cache-Control": "private, no-store",
        Vary: "Sec-GPC, DNT, X-Vercel-IP-Country",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
