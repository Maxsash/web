import assert from "node:assert/strict";
import test from "node:test";
import { prefetchesAhead } from "../lib/prefetch.ts";

test("links prefetch the Notebook, its notes and case studies, nothing heavier", () => {
  for (const href of ["/blog", "/blog/three-waves-one-sea", "/work/velora-rights"])
    assert.ok(prefetchesAhead(href), href);
  for (const href of ["/", "/#work", "/sea", "/sea?seed=ab74d47f&version=2", "/plate", "/privacy"])
    assert.ok(!prefetchesAhead(href), href);
  assert.ok(!prefetchesAhead("/blogroll"));
});
