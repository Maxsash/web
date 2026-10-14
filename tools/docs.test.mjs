import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const read = (path) => readFileSync(path, "utf8");
const lineCount = (path) => read(path).trimEnd().split("\n").length;
const withoutFences = (markdown) => markdown.replace(/^```[\s\S]*?^```/gm, "");

const budgets = new Map(
  [...read("AGENTS.md").matchAll(/^\| `([^`]+\.md)` +\|[^|]+\| (\d+) +\|$/gm)].map(
    ([, path, lines]) => [path, Number(lines)],
  ),
);
const docs = readdirSync("docs")
  .filter((file) => file.endsWith(".md"))
  .map((file) => `docs/${file}`);
const documents = ["AGENTS.md", "README.md", "CHANGELOG.md", "SECURITY.md", ...docs];

const headings = (path) =>
  [...withoutFences(read(path)).matchAll(/^#+ (.+)$/gm)].map(([, text]) => text);
const anchor = (heading) =>
  heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N} _-]/gu, "")
    .replace(/ /g, "-");
const links = (path) =>
  [...withoutFences(read(path)).matchAll(/\]\(([^)\s]+)\)/g)]
    .map(([, target]) => target)
    .filter((target) => !/^(https?:|mailto:)/.test(target));
const resolves = (from, target) => {
  const [file, fragment] = target.split("#");
  const path = file ? normalize(join(dirname(from), file)) : from;
  if (!existsSync(path)) return false;
  return !fragment || !path.endsWith(".md") || headings(path).map(anchor).includes(fragment);
};
const MONTH =
  /\b\d{1,2} (January|February|March|April|May|June|July|August|September|October|November|December)\b/;

test("every document in docs/ has a job and a budget in AGENTS.md", () => {
  assert.deepEqual(
    docs.filter((path) => !budgets.has(path)),
    [],
  );
});

test("documents stay within their line budgets", () => {
  const over = [...budgets]
    .filter(([path, budget]) => lineCount(path) > budget)
    .map(([path, budget]) => `${path}: ${lineCount(path)} lines, budget ${budget}`);
  assert.deepEqual(over, []);
});

test("headings name a subject, not a date", () => {
  const dated = documents.flatMap((path) =>
    headings(path)
      .filter((heading) => MONTH.test(heading))
      .map((heading) => `${path}: ${heading}`),
  );
  assert.deepEqual(dated, []);
});

test("relative links and anchors resolve", () => {
  const broken = documents.flatMap((path) =>
    links(path)
      .filter((target) => !resolves(path, target))
      .map((target) => `${path}: ${target}`),
  );
  assert.deepEqual(broken, []);
});
