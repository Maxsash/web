import type { TelemetryBatch } from "./schema";

export function posthogBatch(
  batch: TelemetryBatch,
  token: string,
  release: string,
  origin: string,
) {
  return {
    api_key: token,
    batch: batch.events.map(({ event, route, route_group, timestamp, properties }) => ({
      event,
      timestamp,
      distinct_id: batch.session,
      properties: {
        ...properties,
        ...batch.context,
        route,
        route_group,
        schema_version: 1,
        site_release: release,
        $session_id: batch.session,
        $process_person_profile: false,
        $geoip_disable: true,
        $ip: null,
        $current_url: new URL(route, origin).href,
      },
    })),
  };
}
