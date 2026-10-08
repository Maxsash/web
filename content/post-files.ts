import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  POSTS_DIR,
  POST_FILE,
  nextFileName,
  parsePostText,
  serializePost,
  type PostFields,
} from "@/lib/post-file";

const directory = () => resolve(process.cwd(), POSTS_DIR);

export function listPostFiles() {
  mkdirSync(directory(), { recursive: true });
  return readdirSync(directory())
    .filter((file) => POST_FILE.test(file))
    .sort()
    .map((file) => {
      const { fields } = parsePostText(readFileSync(join(directory(), file), "utf8"));
      return { file, title: fields.title || file, status: fields.status };
    });
}

export function readPostFile(file: string) {
  if (!POST_FILE.test(file)) return null;
  try {
    return parsePostText(readFileSync(join(directory(), file), "utf8"));
  } catch {
    return null;
  }
}

export function savePostFile(file: string | null, fields: PostFields, body: string) {
  const target =
    file ??
    nextFileName(
      fields.title,
      listPostFiles().map((entry) => entry.file),
    );
  if (!POST_FILE.test(target)) throw new Error("Invalid file name.");
  if (file && !readPostFile(file)) throw new Error("No such post.");
  writeFileSync(join(directory(), target), serializePost(fields, body));
  return target;
}
