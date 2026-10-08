import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// The notebook is sample writing (noindex) and seed variants canonicalize to the homepage.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: absoluteUrl("/") }];
}
