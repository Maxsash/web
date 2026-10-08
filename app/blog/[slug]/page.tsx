import type { Metadata } from "next";
import { formatIndex } from "@/lib/format";
import { sharingMetadata } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { notebook, findPost } from "@/content/notebook";
import OceanPlate from "@/components/atlas/OceanPlate";
import MarkPlate from "@/components/atlas/MarkPlate";
import styles from "@/components/atlas/Atlas.module.css";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return notebook.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = findPost((await params).slug);
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
  const post = findPost((await params).slug);
  if (!post) notFound();

  const waves = post.diagram === "waves";
  const other = notebook.find((item) => item.slug !== post.slug)!;
  const date = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${post.date}T00:00:00Z`));

  return (
    <main id="atlas-content" className={styles.article}>
      <div className={styles.articleTop}>
        <Link prefetch={false} href="/blog">
          ← Back to the notebook
        </Link>
        <span>Field note {post.number} / Sample essay</span>
      </div>
      <article>
        <header className={styles.articleHead}>
          <div>
            <p className={styles.overline}>{post.topic}</p>
            <h1>
              {post.title.slice(0, -post.titleEmphasis.length)}
              <em>{post.titleEmphasis}.</em>
            </h1>
          </div>
          <div className={styles.articleDeck}>
            <p>{post.summary}</p>
            <span className={styles.sampleLabel}>
              <time dateTime={post.date}>{date}</time> · Sample essay · {post.minutes} min read
            </span>
          </div>
        </header>
        <figure className={styles.articleCover}>
          <figcaption>
            <span className={styles.figureNumber}>{post.number.slice(-2)}</span>
            <span className={styles.figureCaptionText}>{post.plateCaption}</span>
          </figcaption>
          <div className={styles.articleCoverArt}>
            {waves ? <OceanPlate /> : <MarkPlate detail />}
          </div>
        </figure>
        <div className={styles.articleBody}>
          <p className={styles.opening}>{post.opening}</p>
          {post.sections.map((section, index) => (
            <section className={styles.readingSection} key={section.title}>
              <span className={styles.sectionNumber} aria-hidden="true">
                {formatIndex(index + 1)}
              </span>
              <div className={styles.readingCopy}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <p className={styles.marginNote}>{section.marginNote}</p>
              {waves && index === 1 ? (
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
              ) : null}
            </section>
          ))}
          <p className={styles.closing}>{post.closing}</p>
          <nav className={styles.nextArticle} aria-label="Next field note">
            <span className={styles.overline}>Keep looking</span>
            <Link prefetch={false} href={`/blog/${other.slug}`}>
              {other.title} ↗
            </Link>
          </nav>
        </div>
      </article>
    </main>
  );
}
