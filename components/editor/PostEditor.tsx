"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { slugFromFile, starterPost, type PostFields } from "@/lib/post-file";
import styles from "./PostEditor.module.css";

type Entry = { file: string; title: string; status: string };
type Props = { files: Entry[]; current: { file: string; fields: PostFields; body: string } | null };
type SaveState = "saved" | "dirty" | "saving" | "error";

const TEXT_FIELDS: { key: keyof PostFields; label: string; hint?: string }[] = [
  { key: "title", label: "Title" },
  {
    key: "emphasis",
    label: "Emphasis",
    hint: "The last words of the title, set in italics. Leave empty unless the stress matters",
  },
  { key: "summary", label: "Summary" },
  { key: "topic", label: "Topic" },
  { key: "caption", label: "Cover caption" },
  { key: "closing", label: "Closing line" },
  { key: "date", label: "Date" },
];

const SNIPPETS = {
  Section: "\n\n## Section title\n\n> Margin note / One / Two\n\nText.\n",
  Code: "\n\n```ts\ncode\n```\n",
  Table: "\n\n| Column | Column |\n| --- | --- |\n| One | Two |\n",
  List: "\n\n- One\n- Two\n",
};

async function save(file: string | null, fields: PostFields, body: string) {
  const response = await fetch("/api/dev/posts", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file, fields, body }),
  });
  const result = (await response.json()) as { file?: string; error?: string };
  if (!response.ok || !result.file) throw new Error(result.error ?? "Could not save.");
  return result.file;
}

export default function PostEditor({ files, current }: Props) {
  const router = useRouter();
  const [fields, setFields] = useState<PostFields | null>(current?.fields ?? null);
  const [body, setBody] = useState(current?.body ?? "");
  const [state, setState] = useState<SaveState>("saved");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(0);
  const [title, setTitle] = useState("");
  const editor = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const file = current?.file ?? null;

  const persist = async (nextFields: PostFields, nextBody: string) => {
    if (!file) return;
    setState("saving");
    try {
      await save(file, nextFields, nextBody);
      setState("saved");
      setMessage("");
      setPreview((value) => value + 1);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not save.");
    }
  };

  const change = (nextFields: PostFields, nextBody: string) => {
    setFields(nextFields);
    setBody(nextBody);
    setState("dirty");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void persist(nextFields, nextBody), 800);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const insert = (snippet: string) => {
    const area = editor.current;
    if (!area || !fields) return;
    const { selectionStart, selectionEnd } = area;
    change(fields, body.slice(0, selectionStart) + snippet + body.slice(selectionEnd));
  };

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    const starter = starterPost(title.trim(), new Date().toISOString().slice(0, 10));
    try {
      router.push(`/write?file=${await save(null, starter.fields, starter.body)}`);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not create.");
    }
  };

  return (
    <div className={styles.editor}>
      <aside className={styles.sidebar}>
        <p className={styles.banner}>Local editor · development only</p>
        <Link prefetch={false} href="/blog">
          ← The notebook
        </Link>
        <nav aria-label="Posts">
          <ul>
            {files.map((entry) => (
              <li key={entry.file}>
                <a
                  href={`/write?file=${entry.file}`}
                  aria-current={entry.file === file ? "page" : undefined}
                >
                  {entry.title}
                  <span>{entry.status}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <form onSubmit={create} className={styles.create}>
          <label>
            New post
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title"
            />
          </label>
          <button type="submit">Create</button>
        </form>
      </aside>

      {fields ? (
        <>
          <section className={styles.writing} aria-label="Write">
            <header>
              <strong>{slugFromFile(file ?? "")}</strong>
              <span role="status" data-state={state}>
                {state === "saved"
                  ? "Saved"
                  : state === "saving"
                    ? "Saving…"
                    : state === "dirty"
                      ? "Unsaved"
                      : message}
              </span>
              <a href={`/blog/${slugFromFile(file ?? "")}`} target="_blank" rel="noreferrer">
                Open page ↗
              </a>
            </header>
            <div className={styles.fields}>
              {TEXT_FIELDS.map(({ key, label, hint }) => (
                <label key={key} title={hint}>
                  {label}
                  <input
                    value={fields[key]}
                    onChange={(event) => change({ ...fields, [key]: event.target.value }, body)}
                  />
                </label>
              ))}
              <label>
                Status
                <select
                  value={fields.status}
                  onChange={(event) =>
                    change({ ...fields, status: event.target.value as PostFields["status"] }, body)
                  }
                >
                  <option value="draft">draft (development only)</option>
                  <option value="published">published</option>
                </select>
              </label>
            </div>
            <div className={styles.toolbar} role="toolbar" aria-label="Insert">
              {Object.entries(SNIPPETS).map(([name, snippet]) => (
                <button key={name} type="button" onClick={() => insert(snippet)}>
                  {name}
                </button>
              ))}
            </div>
            <textarea
              ref={editor}
              value={body}
              spellCheck
              aria-label="Markdown"
              onChange={(event) => change(fields, event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "s") {
                  event.preventDefault();
                  clearTimeout(timer.current);
                  void persist(fields, body);
                }
              }}
            />
          </section>
          <iframe
            key={preview}
            className={styles.preview}
            title="Preview"
            src={`/blog/${slugFromFile(file ?? "")}`}
          />
        </>
      ) : (
        <p className={styles.empty}>Choose a post, or create a new one.</p>
      )}
    </div>
  );
}
