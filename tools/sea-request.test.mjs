import test from "node:test";
import assert from "node:assert/strict";
import { resolveApiSea, resolvePageSea, SEED_ERROR, VERSION_ERROR } from "../lib/sea/request.ts";

const fresh = () => "aaaaaaaa";
const page = (query) => resolvePageSea(query, fresh);
const api = (search) => resolveApiSea(new URL(`http://localhost/api/sea-edition${search}`));

test("page without a seed starts a fresh version 2 sea, or the default version 1 sea", () => {
  assert.deepEqual(page({}), { seed: "aaaaaaaa", version: "2" });
  assert.deepEqual(page({ version: "2" }), { seed: "aaaaaaaa", version: "2" });
  assert.deepEqual(page({ version: "1" }), { seed: "5ea5cafe", version: "1" });
  for (const version of ["3", "", ["1", "2"]]) assert.equal(page({ version }), null);
});

test("page with a seed is version 1 unless a version says otherwise", () => {
  assert.deepEqual(page({ seed: "27C4B901" }), { seed: "27c4b901", version: "1" });
  assert.deepEqual(page({ seed: "27c4b901", version: "2" }), { seed: "27c4b901", version: "2" });
  assert.equal(page({ seed: "27c4b901", version: "3" }), null);
  assert.equal(page({ seed: ["27c4b901", "5ea5cafe"] }), null);
  for (const seed of ["", "123", "<script>", "5ea5cafe\n"]) assert.equal(page({ seed }), null);
});

test("api requests default to the version 1 default sea and reject ambiguity", () => {
  assert.deepEqual(api(""), { seed: "5ea5cafe", version: "1" });
  assert.deepEqual(api("?seed=27C4B901&version=2"), { seed: "27c4b901", version: "2" });
  assert.deepEqual(api("?seed=27c4b901&seed=5ea5cafe"), { error: SEED_ERROR });
  assert.deepEqual(api("?seed=nope"), { error: SEED_ERROR });
  assert.deepEqual(api("?seed=27c4b901&version=3"), { error: VERSION_ERROR });
});
