import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export const siteOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? site.url).origin;
export const absoluteUrl = (path: string) => new URL(path, `${siteOrigin}/`).href;
const socialImage = {
  url: absoluteUrl("/images/living-atlas-day-v1.jpg"),
  width: 1200,
  height: 630,
  alt: "Maxsash Studio — Sea. Ship. Math. A sailboat on the sunlit Living Atlas sea.",
};

export function sharingMetadata(
  title: string,
  description: string,
  path: string,
  type: "website" | "article" = "website",
): Metadata {
  return {
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: site.name,
      locale: "en_US",
      type,
      images: [socialImage],
    },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
  };
}

export const studioStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": absoluteUrl("/#yash"),
      name: site.owner,
      jobTitle: site.role,
      image: absoluteUrl(site.portrait),
      url: site.links.portfolio,
      sameAs: [site.links.linkedin, site.links.github, site.links.portfolio],
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      name: site.name,
      url: absoluteUrl("/"),
      description: site.description,
      inLanguage: "en",
      creator: { "@id": absoluteUrl("/#yash") },
    },
    {
      "@type": "ProfilePage",
      "@id": absoluteUrl("/#page"),
      url: absoluteUrl("/"),
      name: site.name,
      description: site.description,
      isPartOf: { "@id": absoluteUrl("/#website") },
      mainEntity: { "@id": absoluteUrl("/#yash") },
      hasPart: projects.map((project) => ({
        "@type": "CreativeWork",
        name: project.title,
        description: project.summary,
        url: project.caseStudy ?? project.href,
        creator: { "@id": absoluteUrl("/#yash") },
      })),
    },
  ],
};
