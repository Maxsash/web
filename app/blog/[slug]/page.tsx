import type { Metadata } from "next";
import { sharingMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { notebook, findPost } from "@/content/notebook";
import { findWrittenPost, nextEntry, writtenPosts } from "@/content/posts";
import {
  ArticleCover,
  ArticleHead,
  ArticleTop,
  ArticleEnd,
  ReadingSection,
} from "@/components/atlas/ArticleParts";
import WrittenArticle from "@/components/atlas/WrittenArticle";
import OceanPlate from "@/components/atlas/OceanPlate";
import MarkPlate from "@/components/atlas/MarkPlate";
import styles from "@/components/atlas/Atlas.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [...notebook, ...writtenPosts()].map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const written = findWrittenPost(slug);
  if (written) {
    return {
      title: written.title,
      description: written.summary,
      ...sharingMetadata(
        `${written.title} | Maxsash Studio`,
        written.summary,
        `/blog/${written.slug}`,
        "article",
      ),
      robots: { index: false, follow: true },
    };
  }
  const post = findPost(slug);
  if (!post) notFound();
  return {
    title: post.title,
    description: post.summary,
    ...sharingMetadata(
      `${post.title} | Maxsash Studio`,
      `Sample essay: ${post.summary}`,
      `/blog/${post.slug}`,
      "article",
    ),
    robots: { index: false, follow: true },
  };
}

export default async function AtlasArticle({ params }: Props) {
  const slug = (await params).slug;
  const written = findWrittenPost(slug);
  if (written) return <WrittenArticle post={written} />;
  const post = findPost(slug);
  if (!post) notFound();

  const waves = post.diagram === "waves";
  const next = nextEntry(post.slug);

  return (
    <main id="atlas-content" className={styles.article}>
      <ArticleTop number={post.number} status="Sample essay" />
      <article>
        <ArticleHead {...post} status="Sample essay" />
        <ArticleCover number={post.number} caption={post.plateCaption}>
          {waves ? <OceanPlate /> : <MarkPlate detail />}
        </ArticleCover>
        <div className={styles.articleBody}>
          <p className={styles.opening}>{post.opening}</p>
          {post.sections.map((section, index) => (
            <ReadingSection
              key={section.title}
              index={index}
              title={section.title}
              marginNote={section.marginNote}
              aside={
                waves && index === 1 ? (
                  <figure className={styles.sectionPlate}>
                    <div className={styles.equation}>
                      <span>
                        h = ∑ Aᵢ sin θᵢ<small>Height, from six components</small>
                      </span>
                      <span>
                        n ∝ (−hₓ, 1, −h𝓏)<small>Direction, from the derivatives</small>
                      </span>
                    </div>
                    <figcaption>
                      The geometric field is shared. Fine normal ripples, lighting, and the wake
                      remain authored rendering choices.
                    </figcaption>
                  </figure>
                ) : null
              }
            >
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </ReadingSection>
          ))}
          <p className={styles.closing}>{post.closing}</p>
          <ArticleEnd next={next} />
        </div>
      </article>
    </main>
  );
}
