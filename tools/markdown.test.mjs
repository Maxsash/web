import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { parseFrontmatter, parseInline, parseMarkdown } from "../lib/markdown.ts";

const text = (value) => ({ type: "text", text: value });

test("inline markup: code, strong, emphasis and links", () => {
  assert.deepEqual(parseInline("a `b_c` **d** _e_ f"), [
    text("a "),
    { type: "code", text: "b_c" },
    text(" "),
    { type: "strong", children: [text("d")] },
    text(" "),
    { type: "em", children: [text("e")] },
    text(" f"),
  ]);
  assert.deepEqual(parseInline("snake_case_name and x_y"), [text("snake_case_name and x_y")]);
  assert.deepEqual(parseInline("[a](/blog) <https://x.dev>"), [
    { type: "link", href: "/blog", children: [text("a")] },
    text(" "),
    { type: "link", href: "https://x.dev", children: [text("https://x.dev")] },
  ]);
});

test("links with unsafe schemes are reduced to their text", () => {
  for (const href of ["javascript:void", "data:text/html,x", "vbscript:x", "//evil.test"]) {
    assert.deepEqual(parseInline(`[click](${href})`), [text("click")]);
  }
});

test("blocks: headings, paragraphs, code, lists and rules", () => {
  const blocks = parseMarkdown(
    [
      "## Title",
      "first line",
      "second line",
      "",
      "```ts",
      "const a = 1;",
      "",
      "const b = 2;",
      "```",
      "- one",
      "  wrapped",
      "- two",
      "",
      "1. first",
      "2. second",
      "---",
      "tail",
    ].join("\n"),
  );
  assert.deepEqual(
    blocks.map((block) => block.type),
    ["heading", "paragraph", "code", "list", "list", "rule", "paragraph"],
  );
  assert.deepEqual(blocks[1].children, [text("first line second line")]);
  assert.equal(blocks[2].language, "ts");
  assert.equal(blocks[2].text, "const a = 1;\n\nconst b = 2;");
  assert.equal(blocks[3].ordered, false);
  assert.deepEqual(blocks[3].items[0], [text("one wrapped")]);
  assert.equal(blocks[4].ordered, true);
});

test("tables need a separator row and keep inline markup in cells", () => {
  const [table, notATable] = parseMarkdown(
    ["| A | B |", "| --- | --- |", "| `x` | y |", "", "| lone | row |"].join("\n"),
  );
  assert.equal(table.type, "table");
  assert.deepEqual(table.head, [[text("A")], [text("B")]]);
  assert.deepEqual(table.rows, [[[{ type: "code", text: "x" }], [text("y")]]]);
  assert.equal(notATable.type, "paragraph");
});

test("frontmatter is split from the body", () => {
  const { meta, body } = parseFrontmatter("---\ntitle: A: B\nstatus: draft\n---\nHello");
  assert.deepEqual(meta, { title: "A: B", status: "draft" });
  assert.equal(body, "Hello");
  assert.deepEqual(parseFrontmatter("no frontmatter").meta, {});
});

test("every post has complete frontmatter and parses into blocks", () => {
  const files = readdirSync("content/posts").filter((file) => file.endsWith(".md"));
  assert.ok(files.length > 0);
  for (const file of files) {
    const { meta, body } = parseFrontmatter(readFileSync(`content/posts/${file}`, "utf8"));
    for (const key of ["title", "summary", "topic", "date", "status"])
      assert.ok(meta[key], `${file}: missing ${key}`);
    assert.match(meta.date, /^\d{4}-\d{2}-\d{2}$/, `${file}: date`);
    assert.ok(["draft", "published"].includes(meta.status), `${file}: status`);
    assert.ok(/^\d+-[a-z0-9-]+\.md$/.test(file), `${file}: name`);
    assert.ok(parseMarkdown(body).length > 5, `${file}: body`);
  }
});
