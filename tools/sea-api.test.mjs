import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const base = new URL(process.env.SEA_TEST_BASE ?? "http://localhost:3001");
assert.ok(
  ["http:", "https:"].includes(base.protocol) &&
    ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname) &&
    !base.username &&
    !base.password &&
    base.pathname === "/" &&
    !base.search &&
    !base.hash,
  "SEA_TEST_BASE must be a localhost origin, without credentials, path or query",
);

const JSON_PATH = "/api/sea-edition";
const SVG_PATH = "/api/sea-edition/print";
const DEFAULT_SEED = "5ea5cafe";
const OTHER_SEED = "27c4b901";
const digest = (text) => createHash("sha256").update(text).digest("hex");

async function get(path, headers = {}) {
  const response = await fetch(new URL(path, base), {
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(20_000),
  });
  return { response, text: await response.text() };
}

async function ok(path) {
  const result = await get(path);
  assert.equal(result.response.status, 200, `${path} should succeed`);
  return result;
}

const pointLists = (svg) =>
  [...svg.matchAll(/<polyline\b[^>]*\bpoints="([^"]+)"/g)].map((match) => match[1]);

test("edition JSON is canonical and reproducible while another seed changes the actual waves", async () => {
  const first = await ok(JSON_PATH);
  const repeated = await ok(JSON_PATH);
  const canonical = await ok(`${JSON_PATH}?seed=${DEFAULT_SEED}&version=1`);
  const uppercase = await ok(`${JSON_PATH}?seed=${DEFAULT_SEED.toUpperCase()}&version=1`);
  const other = await ok(`${JSON_PATH}?seed=${OTHER_SEED}&version=1`);
  const edition = JSON.parse(first.text);

  assert.equal(repeated.text, first.text, "repeated requests must preserve exact JSON");
  assert.equal(canonical.text, first.text, "the omitted seed must mean the documented default");
  assert.equal(uppercase.text, first.text, "case must not change an edition");
  assert.equal(edition.seed, DEFAULT_SEED);
  assert.equal(edition.version, "1");
  assert.equal(edition.kind, "authored");
  assert.equal(edition.waves.length, 6);
  for (const wave of edition.waves) {
    for (const value of Object.values(wave)) assert.ok(Number.isFinite(value));
    assert.ok(wave.amplitude > 0 && wave.wavelength > 0);
    assert.ok(wave.phase >= 0 && wave.phase < 2 * Math.PI);
  }
  const otherEdition = JSON.parse(other.text);
  assert.equal(otherEdition.seed, OTHER_SEED);
  assert.notDeepEqual(
    otherEdition.waves,
    edition.waves,
    "a new seed must change geometry, not just its label",
  );

  const zero = JSON.parse((await ok(`${JSON_PATH}?seed=00000000`)).text);
  assert.equal(zero.seed, "00000000", "zero is a valid eight-digit seed");
  assert.notDeepEqual(zero.waves, edition.waves);
});

test("print output is canonical and deterministic while another edition changes the engraving", async () => {
  const first = await ok(SVG_PATH);
  const repeated = await ok(SVG_PATH);
  const canonical = await ok(`${SVG_PATH}?seed=${DEFAULT_SEED}&version=1`);
  const uppercase = await ok(`${SVG_PATH}?seed=${DEFAULT_SEED.toUpperCase()}&version=1`);
  const other = await ok(`${SVG_PATH}?seed=${OTHER_SEED}&version=1`);

  for (const result of [repeated, canonical, uppercase]) {
    assert.equal(
      digest(result.text),
      digest(first.text),
      "identical editions must have byte-identical plates",
    );
  }
  assert.ok(pointLists(first.text).length > 1, "the SVG must contain the sampled surface");
  assert.notEqual(
    digest(pointLists(other.text).join("\n")),
    digest(pointLists(first.text).join("\n")),
    "another seed must change the surface paths, not only the printed edition number",
  );
});

test("the printable back edge is derived from the coefficients served for that edition", async () => {
  for (const seed of [DEFAULT_SEED, OTHER_SEED, "00000000"]) {
    const edition = JSON.parse((await ok(`${JSON_PATH}?seed=${seed}`)).text);
    const svg = (await ok(`${SVG_PATH}?seed=${seed}`)).text;
    const firstLine = pointLists(svg)[0];
    assert.ok(firstLine, "the plate needs a sampled back edge");
    const points = firstLine
      .trim()
      .split(/\s+/)
      .map((point) => point.split(",").map(Number));
    assert.ok(points.length >= 5);

    for (const index of [
      0,
      Math.floor(points.length / 4),
      Math.floor(points.length / 2),
      points.length - 1,
    ]) {
      const x = -10 + (20 * index) / (points.length - 1);
      const z = -9;
      const height = edition.waves.reduce((sum, wave) => {
        const k = (2 * Math.PI) / wave.wavelength;
        return (
          sum +
          wave.amplitude *
            Math.sin(k * (Math.cos(wave.direction) * x + Math.sin(wave.direction) * z) + wave.phase)
        );
      }, 0);
      const expected = [640 + 28 * (x - z), 475 + 12 * (x + z) - 62 * height];
      assert.ok(
        Math.abs(points[index][0] - expected[0]) <= 0.0051,
        `seed ${seed}, point ${index}: projected x`,
      );
      assert.ok(
        Math.abs(points[index][1] - expected[1]) <= 0.0051,
        `seed ${seed}, point ${index}: height must match issued waves`,
      );
    }
  }
});

test("both routes reject malformed and repeated seeds without reflecting executable input", async () => {
  const malformed = [
    "",
    "5ea5caf",
    "5ea5cafe0",
    "gggggggg",
    " 5ea5cafe",
    '<svg onload="alert(1)">',
  ];
  for (const route of [JSON_PATH, SVG_PATH]) {
    for (const seed of malformed) {
      const { response, text } = await get(`${route}?seed=${encodeURIComponent(seed)}`);
      assert.equal(response.status, 400, `${route}: reject malformed seed ${JSON.stringify(seed)}`);
      assert.match(response.headers.get("cache-control") ?? "", /no-store/);
      assert.doesNotMatch(text, /<svg|onload|alert\(/i);
    }
    for (const second of [DEFAULT_SEED, OTHER_SEED]) {
      const { response } = await get(`${route}?seed=${DEFAULT_SEED}&seed=${second}`);
      assert.equal(response.status, 400, `${route}: reject ambiguous repeated seed`);
    }
  }
});

test("both routes reject unsupported model versions", async () => {
  for (const route of [JSON_PATH, SVG_PATH]) {
    for (const version of ["", "0", "3", "future"]) {
      const { response } = await get(`${route}?seed=${DEFAULT_SEED}&version=${version}`);
      assert.equal(
        response.status,
        400,
        `${route}: reject model version ${JSON.stringify(version)}`,
      );
    }
  }
});

test("each representation supports stable validators and empty 304 responses", async () => {
  const representationEtags = [];
  for (const route of [JSON_PATH, SVG_PATH]) {
    const initial = await ok(`${route}?seed=${DEFAULT_SEED}&version=1`);
    const etag = initial.response.headers.get("etag");
    assert.ok(etag, `${route}: expose a validator`);
    assert.match(initial.response.headers.get("cache-control") ?? "", /public/);
    representationEtags.push(etag);

    const cached = await get(`${route}?seed=${DEFAULT_SEED.toUpperCase()}&version=1`, {
      "If-None-Match": etag,
    });
    assert.equal(
      cached.response.status,
      304,
      `${route}: canonical identity must reuse a validator`,
    );
    assert.equal(cached.text, "", "304 responses must not contain a representation body");
    assert.equal(cached.response.headers.get("etag"), etag);

    const changed = await get(`${route}?seed=${OTHER_SEED}&version=1`, { "If-None-Match": etag });
    assert.equal(
      changed.response.status,
      200,
      `${route}: an old edition validator cannot hide a new edition`,
    );
    assert.notEqual(changed.response.headers.get("etag"), etag);
    assert.ok(changed.text.length > 0);

    const unrelated = await get(`${route}?seed=${DEFAULT_SEED}`, {
      "If-None-Match": '"unrelated"',
    });
    assert.equal(unrelated.response.status, 200);
  }
  assert.notEqual(...representationEtags, "JSON and SVG need distinct representation validators");
});

test("authored provenance and safe standalone SVG delivery remain explicit", async () => {
  const json = await ok(JSON_PATH);
  const print = await ok(SVG_PATH);
  assert.match(json.response.headers.get("content-type") ?? "", /^application\/json\b/);
  assert.equal(JSON.parse(json.text).kind, "authored");
  assert.match(print.response.headers.get("content-type") ?? "", /^image\/svg\+xml\b/);
  assert.equal(print.response.headers.get("x-content-type-options"), "nosniff");
  assert.match(print.response.headers.get("content-security-policy") ?? "", /default-src 'none'/);
  assert.match(print.response.headers.get("content-security-policy") ?? "", /\bsandbox\b/);
  assert.match(print.text, /<title\b[^>]*>[^<]*authored edition/i);
  assert.match(print.text, /<desc\b[^>]*>[^<]*not an ocean observation/i);
  assert.match(print.text, /AUTHORED STUDY/);
  assert.match(print.text, /NOT LIVE OBSERVATIONS/);
  assert.doesNotMatch(
    print.text,
    /<(?:script|foreignObject|iframe|image|use)\b|\son\w+\s*=|(?:href|src)\s*=|<!DOCTYPE|<!ENTITY/i,
  );
  assert.doesNotMatch(print.text, /NaN|Infinity/);
});

test("version 2 editions are served by recipe, are distinct, and unversioned stays version 1", async () => {
  const unversioned = JSON.parse((await ok(`${JSON_PATH}?seed=${DEFAULT_SEED}`)).text);
  assert.equal(unversioned.version, "1", "an unversioned request must always mean version 1");

  const glass = JSON.parse((await ok(`${JSON_PATH}?seed=1e801407&version=2`)).text);
  const squall = JSON.parse((await ok(`${JSON_PATH}?seed=fa32fa07&version=2`)).text);
  assert.equal(glass.version, "2");
  assert.deepEqual(glass.settings, { swell: 30, heading: 128, character: 20, variation: 7 });
  assert.equal(squall.waves.length, 6);
  const height = (edition) => edition.waves.reduce((sum, wave) => sum + wave.amplitude, 0);
  assert.ok(
    height(squall) > height(glass) * 1.8,
    "the swell setting must visibly change wave height",
  );

  const plate = (await ok(`${SVG_PATH}?seed=1e801407&version=2`)).text;
  assert.match(plate, /SWELL 30 · HEADING 128 · CHARACTER 20 · VARIATION 7/);
  assert.match(plate, /MODEL V2/);
  const first = pointLists(plate)[0]
    .trim()
    .split(/\s+/)
    .map((point) => point.split(",").map(Number));
  for (const index of [0, Math.floor(first.length / 2), first.length - 1]) {
    const x = -10 + (20 * index) / (first.length - 1),
      z = -9;
    const h = glass.waves.reduce((sum, wave) => {
      const k = (2 * Math.PI) / wave.wavelength;
      return (
        sum +
        wave.amplitude *
          Math.sin(k * (Math.cos(wave.direction) * x + Math.sin(wave.direction) * z) + wave.phase)
      );
    }, 0);
    assert.ok(
      Math.abs(first[index][1] - (475 + 12 * (x + z) - 62 * h)) <= 0.0051,
      "v2 plate must match its issued waves",
    );
  }

  const download = await get(`${SVG_PATH}?seed=1e801407&version=2&download=1`);
  assert.match(
    download.response.headers.get("content-disposition") ?? "",
    /^attachment; filename="sea-1e801407-v2\.svg"$/,
  );
  const inline = await get(`${SVG_PATH}?seed=1e801407&version=2`);
  assert.match(inline.response.headers.get("content-disposition") ?? "", /^inline;/);
});
