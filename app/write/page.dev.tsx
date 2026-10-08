import type { Metadata } from "next";
import PostEditor from "@/components/editor/PostEditor";
import { listPostFiles, readPostFile } from "@/content/post-files";

export const metadata: Metadata = { title: "Write", robots: { index: false, follow: false } };

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ file?: string }>;
}) {
  const { file } = await searchParams;
  const post = file ? readPostFile(file) : null;
  return (
    <PostEditor
      key={file ?? "none"}
      files={listPostFiles()}
      current={file && post ? { file, ...post } : null}
    />
  );
}
