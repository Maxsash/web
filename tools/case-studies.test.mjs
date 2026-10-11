import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { projects } from "../content/projects.ts";
import { readingMinutes } from "../lib/format.ts";
import { parseMarkdown } from "../lib/markdown.ts";

const directory = "content/work";
const files = readdirSync(directory).filter((file) => file.endsWith(".md"));
const read = (slug) => readFileSync(`${directory}/${slug}.md`, "utf8");
const headings = (text) =>
  parseMarkdown(text)
    .filter((block) => block.type === "heading" && block.level === 2)
    .map((block) => block.children.map((child) => child.text).join(""));

test("every project has one case study and every case study a project", () => {
  assert.deepEqual(
    files.map((file) => file.replace(/\.md$/, "")).sort(),
    projects.map((project) => project.slug).sort(),
  );
});

for (const { slug } of projects) {
  test(`${slug} opens with the brief and ends with the outcome`, () => {
    const sections = headings(read(slug));
    assert.equal(sections[0], "The brief");
    assert.equal(sections.at(-1), "The outcome");
  });

  test(`${slug} reads in two to five minutes`, () => {
    const minutes = readingMinutes(read(slug));
    assert.ok(minutes >= 2 && minutes <= 5, `${minutes} min`);
  });
}
