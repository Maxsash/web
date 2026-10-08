import type { ReactNode } from "react";
import NotebookLink from "@/components/NotebookLink";
import { formatIndex } from "@/lib/format";
import styles from "./Atlas.module.css";

type HeadProps = {
  topic: string;
  title: string;
  emphasis: string;
  summary: string;
  date: string;
  status: string;
  minutes: number;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));

export function ArticleTop({ number, status }: { number: string; status: string }) {
  return (
    <div className={styles.articleTop}>
      <NotebookLink href="/blog">← Back to the notebook</NotebookLink>
      <span>
        Field note {number}
        {` / ${status}`}
      </span>
    </div>
  );
}

export function ArticleHead({ topic, title, emphasis, summary, date, status, minutes }: HeadProps) {
  const emphasised = emphasis && title.endsWith(emphasis);
  return (
    <header className={styles.articleHead}>
      <div>
        <p className={styles.overline}>{topic}</p>
        <h1>
          {emphasised ? title.slice(0, -emphasis.length) : title}
          {emphasised ? <em>{emphasis}.</em> : null}
        </h1>
      </div>
      <div className={styles.articleDeck}>
        <p>{summary}</p>
        <span className={styles.sampleLabel}>
          <time dateTime={date}>{formatDate(date)}</time>
          {` · ${status} · `}
          {minutes} min read
        </span>
      </div>
    </header>
  );
}

export function ArticleCover({
  number,
  caption,
  children,
}: {
  number: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className={styles.articleCover}>
      <figcaption>
        <span className={styles.figureNumber}>{number.slice(-2)}</span>
        <span className={styles.figureCaptionText}>{caption}</span>
      </figcaption>
      <div className={styles.articleCoverArt}>{children}</div>
    </figure>
  );
}

export function ReadingSection({
  index,
  title,
  marginNote,
  children,
  aside,
}: {
  index: number;
  title: ReactNode;
  marginNote?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className={styles.readingSection}>
      <span className={styles.sectionNumber} aria-hidden="true">
        {formatIndex(index + 1)}
      </span>
      <div className={styles.readingCopy}>
        <h2>{title}</h2>
        {children}
      </div>
      {marginNote ? <p className={styles.marginNote}>{marginNote}</p> : null}
      {aside}
    </section>
  );
}

export function NextArticle({ slug, title }: { slug: string; title: string }) {
  return (
    <nav className={styles.nextArticle} aria-label="Next field note">
      <span className={styles.overline}>Keep looking</span>
      <NotebookLink href={`/blog/${slug}`}>{title} ↗</NotebookLink>
    </nav>
  );
}
