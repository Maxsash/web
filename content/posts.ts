import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter, parseMarkdown, type Block } from "@/lib/markdown";
import { slugFromFile } from "@/lib/post-file";
import { notebook } from "./notebook";

export type WrittenPost = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  topic: string;
  emphasis: string;
  caption: string;
  closing: string;
  date: string;
  minutes: number;
  draft: boolean;
  blocks: Block[];
};

export const postsDirectory = join(process.cwd(), "content", "posts");
const WORDS_PER_MINUTE = 200;
const showDrafts = process.env.NODE_ENV !== "production";

function readPost(file: string, index: number): WrittenPost {
  const { meta, body } = parseFrontmatter(readFileSync(join(postsDirectory, file), "utf8"));
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    slug: slugFromFile(file),
    number: String(notebook.length + index + 1).padStart(3, "0"),
    title: meta.title,
    summary: meta.summary,
    topic: meta.topic,
    emphasis: meta.emphasis ?? "",
    caption: meta.caption ?? "",
    closing: meta.closing ?? "",
    date: meta.date,
    minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    draft: meta.status !== "published",
    blocks: parseMarkdown(body),
  };
}

export const writtenPosts = (): WrittenPost[] =>
  readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map(readPost)
    .filter((post) => showDrafts || !post.draft);

type NoteKind = "Note" | "Draft" | "Sample essay";

export const noteMeta = (kind: NoteKind, minutes: number) => `${kind} · ${minutes} min read`;
export const writtenKind = (post: WrittenPost): NoteKind => (post.draft ? "Draft" : "Note");

export const latestNotes = (count: number) =>
  [
    ...writtenPosts()
      .toReversed()
      .map((post) => ({ ...post, kind: writtenKind(post) })),
    ...notebook.map((post) => ({ ...post, kind: "Sample essay" as const })),
  ].slice(0, count);

export const findWrittenPost = (slug: string) => writtenPosts().find((post) => post.slug === slug);

export function nextEntry(slug: string) {
  const entries = [...notebook, ...writtenPosts()];
  const index = entries.findIndex((entry) => entry.slug === slug);
  return entries[(index + 1) % entries.length];
}
