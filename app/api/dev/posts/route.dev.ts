import { savePostFile } from "@/content/post-files";
import { POST_FILE, isLocalSameOrigin, validatePost } from "@/lib/post-file";

const reply = (body: object, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function PUT(request: Request) {
  if (!isLocalSameOrigin(request.headers, request.url)) return reply({ error: "Forbidden." }, 403);
  const input = await request.json().catch(() => null);
  const post = validatePost(input);
  if (typeof post === "string") return reply({ error: post }, 400);
  const file = (input as { file?: unknown }).file;
  if (file !== undefined && file !== null && (typeof file !== "string" || !POST_FILE.test(file)))
    return reply({ error: "Invalid file name." }, 400);
  try {
    return reply({
      file: savePostFile((file as string | null | undefined) ?? null, post.fields, post.body),
    });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "Could not save." }, 400);
  }
}
