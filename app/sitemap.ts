import type { MetadataRoute } from "next";
import { caseStudyPath, projects } from "@/content/projects";
import { notebook } from "@/content/notebook";
import { writtenPosts } from "@/content/posts";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/blog") },
    ...notebook.map((post) => ({ url: absoluteUrl(`/blog/${post.slug}`) })),
    ...writtenPosts()
      .filter((post) => !post.draft)
      .map((post) => ({ url: absoluteUrl(`/blog/${post.slug}`) })),
    ...projects.map(({ slug }) => ({ url: absoluteUrl(caseStudyPath(slug)) })),
  ];
}
