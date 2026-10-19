import type { Metadata } from "next";
import {
  caseStudyPath,
  caseStudyTitle,
  projects,
  searchDescription,
  type Project,
} from "@/content/projects";
import { site } from "@/content/site";

export const siteOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? site.url).origin;
export const absoluteUrl = (path: string) => new URL(path, `${siteOrigin}/`).href;

type ShareImage = { url: string; width: number; height: number; alt: string };

export function sharingMetadata(
  title: string,
  description: string,
  path: string,
  type: "website" | "article" = "website",
  image: ShareImage = site.shareImage,
): Metadata {
  const sharedImage = { ...image, url: absoluteUrl(image.url) };
  return {
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: site.name,
      locale: "en_US",
      type,
      images: [sharedImage],
    },
    twitter: { card: "summary_large_image", title, description, images: [sharedImage] },
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
      "@type": "Organization",
      "@id": absoluteUrl("/#studio"),
      name: site.name,
      url: absoluteUrl("/"),
      logo: absoluteUrl(site.logo),
      description: site.description,
      email: site.email,
      foundingDate: site.founded,
      founder: { "@id": absoluteUrl("/#yash") },
      sameAs: [site.links.studioLinkedin, site.links.instagram],
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      name: site.name,
      url: absoluteUrl("/"),
      description: site.description,
      inLanguage: "en",
      creator: { "@id": absoluteUrl("/#yash") },
      publisher: { "@id": absoluteUrl("/#studio") },
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
        description: searchDescription(project),
        url: absoluteUrl(caseStudyPath(project.slug)),
        creator: { "@id": absoluteUrl("/#yash") },
      })),
    },
  ],
};

export const caseStudyStructuredData = (project: Project) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: caseStudyTitle(project),
  description: searchDescription(project),
  url: absoluteUrl(caseStudyPath(project.slug)),
  inLanguage: "en",
  author: { "@type": "Person", "@id": absoluteUrl("/#yash"), name: site.owner },
  isPartOf: { "@id": absoluteUrl("/#website") },
});

type PublishedNotebookArticle = {
  slug: string;
  title: string;
  summary: string;
  topic: string;
  date: string;
};

export const blogPostingStructuredData = (article: PublishedNotebookArticle) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: article.title,
  description: article.summary,
  url: absoluteUrl(`/blog/${article.slug}`),
  inLanguage: "en",
  datePublished: article.date,
  articleSection: article.topic,
  author: { "@type": "Person", "@id": absoluteUrl("/#yash"), name: site.owner },
  isPartOf: { "@id": absoluteUrl("/#website") },
});
