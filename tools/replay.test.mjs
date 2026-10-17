import test from "node:test";
import assert from "node:assert/strict";
import { visitLabels, defaultLabels } from "../lib/telemetry/visit-labels.ts";
import {
  replayPolicy,
  automaticReplayRules,
  recordingAllowed,
  privacySignal,
} from "../lib/telemetry/replay-policy.ts";
import {
  detectedRegion,
  replayRegion,
  parseReplayPreferences,
} from "../lib/telemetry/replay-preferences.ts";
import { replayUrl, redactReplay } from "../lib/telemetry/replay-redaction.ts";
import { visitSession } from "../components/telemetry/session.ts";
import { sanitiseBatch } from "../lib/telemetry/schema.ts";

const catalog = { work: ["example"], notebook: ["essay"] };
test("visit URLs only accept fixed labels, reject duplicates and retain missing context in memory", () => {
  const owner = visitLabels("?studio_visit=owner&studio_intent=work&email=private");
  assert.deepEqual(owner, { visit_role: "owner", declared_intent: "work" });
  assert.deepEqual(visitLabels("", owner), owner);
  assert.deepEqual(
    visitLabels("?studio_visit=visitor&studio_intent=unknown", owner),
    defaultLabels,
  );
  assert.deepEqual(
    visitLabels("?studio_visit=private@example.com&studio_intent=client"),
    defaultLabels,
  );
  assert.deepEqual(
    visitLabels("?studio_visit=owner&studio_visit=tester&studio_intent=read&studio_intent=play"),
    defaultLabels,
  );
});
test("country policy fails to voluntary for absent, unknown, expired or invalid rules", () => {
  assert.equal(
    replayPolicy("IN", automaticReplayRules, Date.parse("2027-04-29T23:59:59Z")).mode,
    "automatic",
  );
  const expired = replayPolicy("IN", automaticReplayRules, Date.parse("2027-04-30T00:00:00Z"));
  assert.equal(expired.mode, "voluntary");
  assert.equal(expired.sampleRate, 0);
  assert.equal(recordingAllowed(expired, "automatic"), false);
  const now = Date.parse("2026-10-15T12:00:00Z");
  const rule = { country: "IN", reviewUntil: "2026-10-16T00:00:00Z", sampleRate: 0.1 };
  assert.equal(replayPolicy("IN", [rule], now).mode, "automatic");
  const policy = replayPolicy("IN", [rule], now);
  assert.equal(recordingAllowed(policy, "automatic", now), true);
  assert.equal(recordingAllowed(policy, "automatic", Date.parse(rule.reviewUntil)), false);
  assert.equal(recordingAllowed(policy, "voluntary", Date.parse(rule.reviewUntil)), true);
  assert.equal(recordingAllowed(null, "voluntary", now), false);
  for (const country of [null, "XX", "in", "IN,US", "US"])
    assert.equal(replayPolicy(country, [rule], now).mode, "voluntary");
  for (const override of [
    { reviewUntil: "bad" },
    { reviewUntil: "2026-10-15T12:00:00Z" },
    { sampleRate: -1 },
    { sampleRate: 2 },
  ])
    assert.equal(replayPolicy("IN", [{ ...rule, ...override }], now).mode, "voluntary");
  assert.equal(privacySignal(new Headers({ "Sec-GPC": "1" })), true);
  assert.equal(privacySignal(new Headers({ DNT: "1" })), true);
});
test("region choices are coarse, explicit and fail closed for malformed saved preferences", () => {
  assert.equal(detectedRegion("IN"), "IN");
  assert.equal(detectedRegion("FR"), "EU");
  assert.equal(detectedRegion("CH"), "EU");
  assert.equal(detectedRegion("GB"), "GB");
  assert.equal(detectedRegion("US"), "US");
  assert.equal(detectedRegion("AU"), "other");
  for (const value of [null, "XX", "ZZ", "in", "IN,US"])
    assert.equal(detectedRegion(value), "unknown");
  assert.equal(replayRegion("India"), "auto");
  assert.equal(replayRegion("IN"), "IN");
  assert.deepEqual(parseReplayPreferences(null), { region: "auto", automatic: true });
  assert.deepEqual(parseReplayPreferences('{"version":1,"region":"GB","automatic":false}'), {
    region: "GB",
    automatic: false,
  });
  for (const value of [
    "bad",
    '{"version":2}',
    '{"version":1,"region":"private","automatic":true}',
    '{"version":1,"automatic":"true"}',
  ])
    assert.equal(parseReplayPreferences(value).automatic, false);
});
test("replay scrubs URLs and excludes plugin/console/network custom payloads", () => {
  const clean = (url) => replayUrl(url, "https://www.maxsash.com", catalog);
  const payload = [
    { type: 4, data: { href: "https://www.maxsash.com/?seed=deadbeef&email=private#secret" } },
    {
      type: 2,
      data: {
        attributes: { href: "mailto:private@example.com", src: "/images/public.webp?secret=value" },
      },
    },
    { type: 6, data: { payload: "private-console" } },
    { type: 5, data: { payload: "private-network" } },
  ];
  const redacted = redactReplay(payload, clean);
  assert.equal(redacted.length, 2);
  const json = JSON.stringify(redacted);
  for (const value of ["deadbeef", "private", "secret", "mailto:"])
    assert.equal(json.includes(value), false);
  assert.equal(clean("/someone@example.com?token=secret"), "https://www.maxsash.com/unknown");
  assert.equal(clean("https://other.test/private"), "about:blank");
});
test("new visits use valid time-stamped UUID7s accepted by the relay without rejecting existing UUID4s", () => {
  const session = visitSession()();
  assert.match(session, /^[a-f\d]{8}-[a-f\d]{4}-7[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/);
  const batch = {
    session,
    context: {
      device: "touch",
      browser: "safari",
      viewport: "narrow",
      visit_role: "owner",
      declared_intent: "work",
    },
    events: [
      {
        event: "page_view",
        route: "/",
        timestamp: new Date().toISOString(),
        properties: { source: "direct", campaign: "none" },
      },
    ],
  };
  assert.equal(sanitiseBatch(batch, catalog).context.visit_role, "owner");
  batch.context.visit_role = "admin";
  assert.equal(sanitiseBatch(batch, catalog), null);
});

test(
  "replay policy is private, ignores local country spoofing and honours browser privacy headers",
  { skip: !process.env.SEA_TEST_BASE },
  async () => {
    const endpoint = new URL("/api/telemetry/replay-policy", process.env.SEA_TEST_BASE);
    for (const headers of [{ "Sec-GPC": "1" }, { DNT: "1" }]) {
      const response = await fetch(endpoint, { headers });
      assert.match(response.headers.get("cache-control"), /no-store/);
      const policy = await response.json();
      assert.equal(policy.enabled, false);
      assert.equal(policy.detectedRegion, "unknown");
      assert.equal("token" in policy, false);
    }
    const response = await fetch(endpoint, { headers: { "x-vercel-ip-country": "IN" } });
    const policy = await response.json();
    assert.match(response.headers.get("cache-control"), /private/);
    if (policy.enabled) {
      assert.equal(policy.mode, "voluntary");
      assert.equal(policy.validUntil, null);
      assert.equal(policy.detectedRegion, "unknown");
      for (const [query, expected] of [
        ["region=IN", "automatic"],
        ["region=GB", "voluntary"],
        ["region=EU", "voluntary"],
        ["region=US", "voluntary"],
        ["region=other", "voluntary"],
        ["region=IN&region=GB", "voluntary"],
        ["region=invalid", "voluntary"],
      ]) {
        const corrected = await fetch(`${endpoint}?${query}`).then((r) => r.json());
        assert.equal(corrected.mode, expected);
        assert.equal(corrected.detectedRegion, "unknown");
      }
    }
  },
);
