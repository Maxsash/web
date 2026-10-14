import test from "node:test";
import assert from "node:assert/strict";
import {
  acquisition,
  durationBucket,
  normaliseRoute,
  sanitiseBatch,
} from "../lib/telemetry/schema.ts";
import { posthogBatch } from "../lib/telemetry/posthog.ts";
import { dashboards } from "./telemetry/reports.mjs";
import { telemetryConfig } from "../lib/telemetry/config.ts";
import { visitSession } from "../components/telemetry/session.ts";

const catalog = { work: ["example"], notebook: ["essay"] };
const now = Date.parse("2026-10-14T12:00:00Z");
const context = { device: "touch", browser: "safari", viewport: "narrow" };
const session = "e096d90c-3c14-4d80-b6e3-d176486f2aa6";
const makeBatch = (event = "page_view", properties = { source: "direct", campaign: "none" }) => ({
  session,
  context: { ...context },
  events: [
    { event, route: "/", route_group: "home", timestamp: new Date(now).toISOString(), properties },
  ],
});

test("only known routes survive; queries, seeds, fragments and arbitrary paths cannot leak", () => {
  assert.deepEqual(normaliseRoute("/work/example?email=private#secret", catalog), {
    route: "/work/example",
    route_group: "work",
  });
  for (const path of [
    "/work/private-person",
    "/blog/unpublished",
    "/someone@example.com",
    "constructor",
  ])
    assert.deepEqual(normaliseRoute(path, catalog), { route: "/unknown", route_group: "error" });
  assert.equal(normaliseRoute("/?seed=deadbeef", catalog).route, "/");
});

test("acquisition reduces referrers to known sources and rejects arbitrary campaign text", () => {
  assert.deepEqual(
    acquisition(
      "https://www.google.co.in/search?q=private",
      "https://maxsash.com",
      "?utm_campaign=outreach&seed=deadbeef",
    ),
    { source: "google", campaign: "outreach" },
  );
  assert.equal(
    acquisition(
      "https://google.com.evil.test/person",
      "https://maxsash.com",
      "?utm_campaign=client-email",
    ).source,
    "external",
  );
  assert.equal(
    acquisition(
      "https://example.org/secret",
      "https://maxsash.com",
      "?utm_campaign=person@example.com",
    ).campaign,
    "none",
  );
  assert.equal(acquisition("malformed", "https://maxsash.com", "").source, "unknown");
});

test("server rebuilds allowlisted properties instead of forwarding a client payload", () => {
  const input = makeBatch();
  input.events[0].route = "/?seed=deadbeef&private=secret";
  input.events[0].route_group = "invented";
  input.events[0].properties = {
    ...input.events[0].properties,
    email: "private@example.com",
    $ip: "1.2.3.4",
    $current_url: "https://evil.test/private",
  };
  input.context.fullAgent = "private agent";
  const result = sanitiseBatch(input, catalog, now);
  assert.deepEqual(result, makeBatch());
  assert.equal(JSON.stringify(result).includes("private"), false);
});

test("invalid identity, event, context, enums, content slugs and timestamps are rejected", () => {
  for (const mutate of [
    (b) => (b.session = "email@example.com"),
    (b) => (b.events[0].event = "$identify"),
    (b) => (b.events[0].properties.source = "private-domain"),
    (b) => (b.context.browser = "raw-user-agent"),
    (b) => (b.events[0].timestamp = "bad-date"),
    (b) => (b.events[0].timestamp = new Date(now - 31 * 60000).toISOString()),
    (b) => (b.events[0].timestamp = new Date(now + 61000).toISOString()),
    (b) => (b.events = Array(21).fill(b.events[0])),
  ]) {
    const batch = makeBatch();
    mutate(batch);
    assert.equal(sanitiseBatch(batch, catalog, now), null);
  }
  assert.equal(
    sanitiseBatch(
      makeBatch("content_open", { content: "work", slug: "private", placement: "work" }),
      catalog,
      now,
    ),
    null,
  );
});

test("navigation targets are scrubbed and bucket boundaries are exact", () => {
  const result = sanitiseBatch(
    makeBatch("navigation_result", {
      target: "/blog/essay?email=secret",
      outcome: "completed",
      duration: "1-3s",
      repeated: false,
    }),
    catalog,
    now,
  );
  assert.equal(result.events[0].properties.target, "/blog/essay");
  assert.deepEqual([999, 1000, 2999, 3000, 9999, 10000].map(durationBucket), [
    "under-1s",
    "1-3s",
    "1-3s",
    "3-10s",
    "3-10s",
    "over-10s",
  ]);
});

test("PostHog payload pins privacy flags and the random visit identity", () => {
  const batch = sanitiseBatch(makeBatch(), catalog, now);
  const payload = posthogBatch(batch, "test-token", "1.1.0", "https://studio.maxsash.com");
  const event = payload.batch[0];
  assert.equal(event.distinct_id, session);
  assert.equal(event.properties.$session_id, session);
  assert.equal(event.properties.$process_person_profile, false);
  assert.equal(event.properties.$geoip_disable, true);
  assert.equal(event.properties.$ip, null);
  assert.equal(event.properties.$current_url, "https://studio.maxsash.com/");
  assert.equal(event.properties.schema_version, 1);
});

test("contact funnels aggregate by visit rather than multi-visit people", () => {
  assert.equal(dashboards.length, 5);
  const funnels = dashboards
    .flatMap((dashboard) => dashboard.insights)
    .filter((insight) => insight.query.source.kind === "FunnelsQuery");
  assert.ok(funnels.length >= 4);
  for (const funnel of funnels) {
    assert.equal(
      funnel.query.source.funnelsFilter.funnelAggregateByHogQL,
      "properties.$session_id",
    );
    assert.equal(funnel.query.source.funnelsFilter.funnelWindowIntervalUnit, "hour");
  }
});

test("collection requires production, explicit enablement, a token and an approved host", () => {
  const names = [
    "NODE_ENV",
    "VERCEL_ENV",
    "TELEMETRY_ENABLED",
    "POSTHOG_PROJECT_TOKEN",
    "POSTHOG_HOST",
  ];
  const before = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  try {
    process.env.NODE_ENV = "production";
    delete process.env.VERCEL_ENV;
    process.env.TELEMETRY_ENABLED = "true";
    process.env.POSTHOG_PROJECT_TOKEN = "test-token";
    delete process.env.POSTHOG_HOST;
    assert.equal(telemetryConfig().enabled, true);
    for (const [name, value] of [
      ["NODE_ENV", "development"],
      ["VERCEL_ENV", "preview"],
      ["TELEMETRY_ENABLED", "false"],
      ["POSTHOG_PROJECT_TOKEN", ""],
      ["POSTHOG_HOST", "https://evil.test"],
    ]) {
      const previous = process.env[name];
      process.env[name] = value;
      assert.equal(telemetryConfig().enabled, false);
      if (previous === undefined) delete process.env[name];
      else process.env[name] = previous;
    }
  } finally {
    for (const name of names)
      if (before[name] === undefined) delete process.env[name];
      else process.env[name] = before[name];
  }
});

test("visit identity is memory-only, resets for a new observer and rotates after inactivity", () => {
  const original = Date.now;
  let clock = now;
  Date.now = () => clock;
  try {
    const visit = visitSession();
    const first = visit();
    assert.equal(visit(), first);
    assert.notEqual(visitSession()(), first);
    clock += 30 * 60000;
    assert.notEqual(visit(), first);
  } finally {
    Date.now = original;
  }
});

test(
  "production endpoint rejects unsafe and malformed requests before forwarding",
  { skip: !process.env.SEA_TEST_BASE },
  async () => {
    const base = process.env.SEA_TEST_BASE;
    const endpoint = new URL("/api/telemetry", base);
    const origin = new URL(base).origin;
    const request = (body, headers) =>
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: origin, ...headers },
        body,
      });
    const disabled = await request("{}", {});
    if (disabled.status === 204) return;
    assert.equal(disabled.status, 400);
    assert.equal((await request("{}", { Origin: "https://evil.test" })).status, 403);
    assert.equal((await request("{}", { "Content-Type": "text/plain" })).status, 415);
    assert.equal((await request("not-json", {})).status, 400);
    assert.equal((await request(" ".repeat(16001), {})).status, 413);
  },
);
