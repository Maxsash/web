import test from "node:test";
import assert from "node:assert/strict";
import {
  POST_FILE,
  isLocalSameOrigin,
  nextFileName,
  parsePostText,
  serializePost,
  slugFromFile,
  slugFromTitle,
  starterPost,
  validatePost,
} from "../lib/post-file.ts";

const fields = {
  title: "A title: with a colon",
  summary: "One line.",
  topic: "Notes",
  date: "2026-10-08",
  status: "draft",
  emphasis: "",
  caption: "",
  closing: "The end.",
};

test("a post survives being written and read back", () => {
  const text = serializePost(fields, "\n\nFirst paragraph.\n\n## Section\n");
  assert.ok(text.startsWith("---\ntitle: A title: with a colon\n"));
  assert.ok(!text.includes("emphasis:"), "empty fields are left out");
  const read = parsePostText(text);
  assert.deepEqual(read.fields, fields);
  assert.equal(read.body, "First paragraph.\n\n## Section\n");
  assert.equal(serializePost(read.fields, read.body), text);
});

test("input is validated and cannot inject frontmatter lines", () => {
  const ok = validatePost({
    fields: { ...fields, summary: "One\nstatus: published\n---" },
    body: "x",
  });
  assert.equal(typeof ok, "object");
  assert.equal(ok.fields.summary, "One status: published ---");
  for (const bad of [
    null,
    { fields, body: 5 },
    { fields: { ...fields, title: "" }, body: "" },
    { fields: { ...fields, date: "8 Oct" }, body: "" },
    { fields: { ...fields, status: "live" }, body: "" },
    { fields: { ...fields, title: "x".repeat(401) }, body: "" },
    { fields: { ...fields, closing: undefined }, body: "" },
    { fields, body: "x".repeat(200_001) },
  ])
    assert.equal(typeof validatePost(bad), "string");
});

test("file names are safe and numbered", () => {
  assert.equal(slugFromTitle("  The flag, that 'half' works! "), "the-flag-that-half-works");
  assert.equal(slugFromTitle("!!!"), "untitled");
  assert.equal(nextFileName("New one", ["01-a.md", "03-b.md", "02-c.md"]), "04-new-one.md");
  assert.equal(nextFileName("First", []), "01-first.md");
  assert.equal(slugFromFile("03-the-flag.md"), "the-flag");
  for (const name of ["01-a.md", "12-two-words.md"]) assert.ok(POST_FILE.test(name));
  for (const name of [
    "../01-a.md",
    "01-a.md/../x",
    "1-a.md",
    "01-A.md",
    "01-a.txt",
    "01-a.md\n",
    "01--a.md",
  ])
    assert.ok(!POST_FILE.test(name), name);
});

test("only a same-origin JSON request from localhost may write", () => {
  const request = (headers, url = "http://localhost:3000/api/dev/posts") =>
    isLocalSameOrigin(new Headers(headers), url);
  const good = {
    host: "localhost:3000",
    origin: "http://localhost:3000",
    "content-type": "application/json",
  };
  assert.ok(request(good));
  assert.ok(request({ ...good, "sec-fetch-site": "same-origin" }));
  assert.ok(!request({ ...good, origin: "https://evil.example" }), "other website");
  assert.ok(!request({ ...good, "sec-fetch-site": "cross-site" }));
  assert.ok(!request({ ...good, origin: undefined }), "no origin");
  assert.ok(!request({ ...good, "content-type": "text/plain" }), "simple request");
  assert.ok(!request({ ...good, host: "evil.example" }), "DNS rebinding host");
  assert.ok(!request(good, "https://www.maxsash.com/api/dev/posts"), "never on the live site");
});

test("the starter post is valid", () => {
  const starter = starterPost("My title", "2026-10-08");
  assert.equal(typeof validatePost(starter), "object");
});
