import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // The notebook is sample writing and deliberately noindex. Seed variants
  // canonicalize to the homepage. Neither belongs in the indexable sitemap.
  return [{ url: absoluteUrl("/") }];
}
