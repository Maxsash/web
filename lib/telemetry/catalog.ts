import { projects } from "@/content/projects";
import { notebook } from "@/content/notebook";
import { writtenPosts } from "@/content/posts";
import type { RouteCatalog } from "./schema";

export function telemetryCatalog(): RouteCatalog {
  return {
    work: projects.map(({ slug }) => slug),
    notebook: [...notebook, ...writtenPosts().filter((post) => !post.draft)].map(
      ({ slug }) => slug,
    ),
  };
}
