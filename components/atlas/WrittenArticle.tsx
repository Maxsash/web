import { nextEntry, type WrittenPost } from "@/content/posts";
import { structurePost } from "@/lib/post-structure";
import { createSeaEdition } from "@/lib/sea/edition";
import { seaSeedForName } from "@/lib/sea/presets";
import { ArticleCover, ArticleHead, ArticleTop, NextArticle, ReadingSection } from "./ArticleParts";
import PostPlate from "./PostPlate";
import Prose, { InlineText } from "./Prose";
import styles from "./Atlas.module.css";

export default function WrittenArticle({ post }: { post: WrittenPost }) {
  const { opening, intro, sections, editorNotes } = structurePost(post.blocks);
  const status = post.draft ? "Draft" : "Note";
  const next = nextEntry(post.slug);
  return (
    <main id="atlas-content" className={styles.article}>
      <ArticleTop number={post.number} status={status} />
      <article>
        <ArticleHead {...post} status={status} />
        <ArticleCover number={post.number} caption={post.caption}>
          <PostPlate slug={post.slug} edition={createSeaEdition(seaSeedForName(post.slug), "2")} />
        </ArticleCover>
        <div className={styles.articleBody}>
          {opening?.type === "paragraph" ? (
            <p className={styles.opening}>
              <InlineText nodes={opening.children} />
            </p>
          ) : null}
          {intro.length ? (
            <div className={`${styles.readingCopy} ${styles.introCopy}`}>
              <Prose blocks={intro} />
            </div>
          ) : null}
          {sections.map((section, index) => (
            <ReadingSection
              key={index}
              index={index}
              title={<InlineText nodes={section.title} />}
              marginNote={section.marginNote ? <InlineText nodes={section.marginNote} /> : null}
            >
              <Prose blocks={section.blocks} />
            </ReadingSection>
          ))}
          {post.closing ? <p className={styles.closing}>{post.closing}</p> : null}
          {post.draft && editorNotes.length ? (
            <aside className={styles.draftNotes} aria-label="Notes for the editor">
              <span className={styles.overline}>Notes for the editor · drafts only</span>
              <div className={styles.readingCopy}>
                <Prose blocks={editorNotes} />
              </div>
            </aside>
          ) : null}
          <NextArticle slug={next.slug} title={next.title} />
        </div>
      </article>
    </main>
  );
}
