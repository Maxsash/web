import type { MetadataRoute } from "next";
import { caseStudyPath, projects } from "@/content/projects";
import { absoluteUrl } from "@/lib/seo";

// The notebook is sample writing (noindex) and seed variants canonicalize to the homepage.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/") },
    ...projects.map(({ slug }) => ({ url: absoluteUrl(caseStudyPath(slug)) })),
  ];
}
