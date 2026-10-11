import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readingMinutes } from "@/lib/format";
import { parseMarkdown } from "@/lib/markdown";

const caseStudiesDirectory = join(process.cwd(), "content", "work");

export function readCaseStudy(slug: string) {
  const text = readFileSync(join(caseStudiesDirectory, `${slug}.md`), "utf8");
  return { blocks: parseMarkdown(text), minutes: readingMinutes(text) };
}
