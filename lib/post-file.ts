import { parseFrontmatter } from "./markdown.ts";

export const POST_FILE = /^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

export type PostFields = {
  title: string;
  summary: string;
  topic: string;
  date: string;
  status: "draft" | "published";
  emphasis: string;
  caption: string;
  closing: string;
};

const FIELD_ORDER: (keyof PostFields)[] = [
  "title",
  "summary",
  "topic",
  "date",
  "status",
  "emphasis",
  "caption",
  "closing",
];
const MAX_FIELD = 400;
export const MAX_BODY = 200_000;

const singleLine = (value: string) => value.replace(/\s+/g, " ").trim();

export function serializePost(fields: PostFields, body: string) {
  const header = FIELD_ORDER.filter((key) => fields[key]).map((key) => `${key}: ${fields[key]}`);
  return `---\n${header.join("\n")}\n---\n\n${body.replace(/^\s*\n/, "").trimEnd()}\n`;
}

export function parsePostText(text: string) {
  const { meta, body } = parseFrontmatter(text);
  const fields: PostFields = {
    title: meta.title ?? "",
    summary: meta.summary ?? "",
    topic: meta.topic ?? "",
    date: meta.date ?? "",
    status: meta.status === "published" ? "published" : "draft",
    emphasis: meta.emphasis ?? "",
    caption: meta.caption ?? "",
    closing: meta.closing ?? "",
  };
  return { fields, body: body.replace(/^\s*\n/, "") };
}

export function validatePost(input: unknown): { fields: PostFields; body: string } | string {
  if (typeof input !== "object" || input === null) return "Expected an object.";
  const { fields, body } = input as { fields?: Record<string, unknown>; body?: unknown };
  if (typeof fields !== "object" || fields === null || typeof body !== "string")
    return "Expected fields and a body.";
  if (body.length > MAX_BODY) return "The body is too long.";
  const clean = {} as PostFields;
  for (const key of FIELD_ORDER) {
    const value = fields[key];
    if (typeof value !== "string") return `Missing ${key}.`;
    const line = singleLine(value);
    if (line.length > MAX_FIELD) return `${key} is too long.`;
    (clean as Record<string, string>)[key] = line;
  }
  if (!clean.title) return "A post needs a title.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean.date)) return "The date must look like 2026-10-08.";
  if (clean.status !== "draft" && clean.status !== "published")
    return "The status must be draft or published.";
  return { fields: clean, body };
}

export function slugFromTitle(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || "untitled";
}

export function nextFileName(title: string, existing: string[]) {
  const highest = Math.max(0, ...existing.map((file) => Number.parseInt(file, 10) || 0));
  return `${String(highest + 1).padStart(2, "0")}-${slugFromTitle(title)}.md`;
}

export const slugFromFile = (file: string) => file.replace(/^\d+-/, "").replace(/\.md$/, "");

export function starterPost(title: string, date: string) {
  const fields: PostFields = {
    title,
    summary: "One sentence on what this note is about.",
    topic: "Notes",
    date,
    status: "draft",
    emphasis: "",
    caption: "A line under the cover plate.",
    closing: "",
  };
  const body = [
    "The opening paragraph is set large. Make it the sentence that earns the second one.",
    "",
    "## A first section",
    "",
    "> Margin note / One / Two",
    "",
    "Write the section here.",
    "",
    "## Notes for the editor (delete before publishing)",
    "",
    "- Facts to check, and sentences that are inference.",
  ].join("\n");
  return { fields, body };
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function isLocalSameOrigin(headers: Pick<Headers, "get">, requestUrl: string) {
  const url = new URL(requestUrl);
  const host = headers.get("host")?.replace(/:\d+$/, "") ?? "";
  const origin = headers.get("origin");
  const fetchSite = headers.get("sec-fetch-site");
  return (
    LOCAL_HOSTS.has(url.hostname) &&
    LOCAL_HOSTS.has(host) &&
    origin === url.origin &&
    (fetchSite === null || fetchSite === "same-origin") &&
    (headers.get("content-type") ?? "").startsWith("application/json")
  );
}
