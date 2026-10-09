import type { Metadata } from "next";
import NoteFeature from "@/components/atlas/NoteFeature";
import { formatIndex } from "@/lib/format";
import { seaSeedForName } from "@/lib/sea/presets";
import OceanPlate from "@/components/atlas/OceanPlate";
import MarkPlate from "@/components/atlas/MarkPlate";
import PostPlate from "@/components/atlas/PostPlate";
import { findPost } from "@/content/notebook";
import { noteMeta, writtenKind, writtenPosts } from "@/content/posts";
import { createSeaEdition } from "@/lib/sea/edition";
import { DEFAULT_SEA_SEED_V2 } from "@/lib/sea/seed";
import styles from "@/components/atlas/Atlas.module.css";

const roman = (n: number) => ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n - 1];

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
};

export default function AtlasIndex() {
  const edition = createSeaEdition(DEFAULT_SEA_SEED_V2, "2");
  const posts = writtenPosts().toReversed();
  const waves = findPost("three-waves-one-sea")!;
  const integral = findPost("an-integral-under-sail")!;
  const total = 2 + posts.length;
  return (
    <main id="atlas-content" className={styles.index}>
      <section className={styles.masthead} aria-labelledby="atlas-title">
        <div className={styles.mastheadTop}>
          <p>Observations & constructions</p>
          <p>Sea, ship, mathematics</p>
        </div>
        <div className={styles.mastheadBody}>
          <h1 id="atlas-title">
            Navigator&apos;s <br />
            <span>Notebook</span>
            <i aria-hidden="true">.</i>
          </h1>
          <div className={styles.issue}>
            <span>
              The first
              <br />
              specimens
            </span>
            <b aria-hidden="true">
              N°<span>01</span>
            </b>
            <p>
              On the beauty
              <br />
              of how things work.
            </p>
          </div>
        </div>
      </section>

      {posts.map((post, index) => {
        const edition = createSeaEdition(seaSeedForName(post.slug), "2");
        const dark = (posts.length - index) % 2 === 1;
        const emphasised = post.emphasis && post.title.endsWith(post.emphasis);
        return (
          <NoteFeature
            key={post.slug}
            variant={dark ? "dark" : "light"}
            id={`note-${post.slug}`}
            overline={`Field note ${post.number} / ${post.topic}`}
            headline={
              emphasised ? (
                <>
                  {post.title.slice(0, -post.emphasis.length)}
                  <br />
                  <em>{post.emphasis}.</em>
                </>
              ) : (
                post.title
              )
            }
            blurb={post.summary}
            href={`/blog/${post.slug}`}
            linkLabel="Read the note"
            meta={noteMeta(writtenKind(post), post.minutes)}
            plateTop={
              dark
                ? undefined
                : [
                    `Plate ${roman(Number(post.number))} — ${post.title}`,
                    `${post.number.slice(-2)} / ${formatIndex(total)}`,
                  ]
            }
            plate={<PostPlate slug={post.slug} edition={edition} />}
            plateCaption={
              dark
                ? [`Plate ${roman(Number(post.number))} — ${post.title}`, `Edition ${edition.seed}`]
                : [post.topic, `Edition ${edition.seed} · t = 0`]
            }
          />
        );
      })}

      <NoteFeature
        variant="light"
        id="first-note"
        overline={
          <>
            <span className={styles.smallCross} aria-hidden="true">
              ✳
            </span>{" "}
            Field note {waves.number} / Waves & motion
          </>
        }
        headline={
          <>
            The sea is <br />a sum of <br /> <em>small things.</em>
          </>
        }
        blurb="A crest, a trough, a little disagreement. Follow the simple parts that make a surface feel wonderfully complicated."
        href="/blog/three-waves-one-sea"
        linkLabel="Read the wave study"
        meta={noteMeta("Sample essay", waves.minutes)}
        plateTop={[
          `Plate ${roman(Number(waves.number))} — The sum of a sea`,
          `${waves.number.slice(-2)} / ${formatIndex(total)}`,
        ]}
        plate={<OceanPlate variant="cover" edition={edition} />}
        plateCaption={["Six waves. One surface.", `Edition ${edition.seed} · t = 0`]}
      />

      <NoteFeature
        variant="dark"
        id="second-note"
        overline={`Field note ${integral.number} / Geometry & craft`}
        decoration={
          <span className={styles.largeIntegral} aria-hidden="true">
            ∫
          </span>
        }
        headline={
          <>
            A symbol. <br />A vessel. <br />
            <em>One line of thought.</em>
          </>
        }
        blurb="Where an integral becomes a mast, and the space between three shapes does the quiet work."
        href="/blog/an-integral-under-sail"
        linkLabel="Read the construction"
        meta={noteMeta("Sample essay", integral.minutes)}
        plate={<MarkPlate />}
        plateCaption={[
          `Plate ${roman(Number(integral.number))} — An integral under sail`,
          "Three filled outlines",
        ]}
      />

      <aside className={styles.editorsNote}>
        <span className={styles.overline}>A note on these pages</span>
        <p>
          Some things are better understood by taking them apart. This notebook is a place for that:
          the drawings, the questions, and the arithmetic beneath the surface.
        </p>
        <span className={styles.editorStamp}>
          Made to be
          <br />
          <em>looked into.</em>
        </span>
      </aside>
    </main>
  );
}
