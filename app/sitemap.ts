import type { MetadataRoute } from "next";
import { caseStudyPath, projects } from "@/content/projects";
import { writtenPosts } from "@/content/posts";
import { absoluteUrl } from "@/lib/seo";

// Samples stay noindex and seed variants canonicalize to the homepage.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/") },
    ...writtenPosts()
      .filter((post) => !post.draft)
      .map((post) => ({ url: absoluteUrl(`/blog/${post.slug}`) })),
    ...projects.map(({ slug }) => ({ url: absoluteUrl(caseStudyPath(slug)) })),
  ];
}
