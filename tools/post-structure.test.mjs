import test from "node:test";
import assert from "node:assert/strict";
import { parseMarkdown } from "../lib/markdown.ts";
import { structurePost } from "../lib/post-structure.ts";
import { seaSeedForName } from "../lib/sea/presets.ts";
import { normaliseSeaSeed } from "../lib/sea/seed.ts";

const structured = (source) => structurePost(parseMarkdown(source));
const plain = (nodes) => nodes.map((node) => node.text ?? "").join("");

test("a post splits into an opening, intro, numbered sections and editor notes", () => {
  const post = structured(
    [
      "Opening line.",
      "",
      "More introduction.",
      "",
      "## First",
      "",
      "> One / Two",
      "",
      "Body one.",
      "",
      "## Second",
      "",
      "Body two.",
      "",
      "---",
      "",
      "## Notes for the editor (delete)",
      "",
      "- check this",
    ].join("\n"),
  );
  assert.equal(plain(post.opening.children), "Opening line.");
  assert.equal(post.intro.length, 1);
  assert.deepEqual(
    post.sections.map((section) => plain(section.title)),
    ["First", "Second"],
  );
  assert.equal(plain(post.sections[0].marginNote), "One / Two");
  assert.equal(post.sections[1].marginNote, null);
  assert.equal(post.sections[0].blocks.length, 1);
  assert.equal(post.sections[1].blocks.at(-1).type, "paragraph");
  assert.deepEqual(
    post.editorNotes.map((block) => block.type),
    ["list"],
  );
});

test("a quote that is not first in its section stays in the body", () => {
  const post = structured("## A\n\nText.\n\n> Later quote\n");
  assert.equal(post.sections[0].marginNote, null);
  assert.deepEqual(
    post.sections[0].blocks.map((block) => block.type),
    ["paragraph", "quote"],
  );
});

test("each post gets its own repeatable sea", () => {
  const seed = seaSeedForName("the-flag");
  assert.equal(seed, seaSeedForName("the-flag"));
  assert.notEqual(seed, seaSeedForName("another-post"));
  assert.ok(normaliseSeaSeed(seed));
});
