import Link from "next/link";
import type { Metadata } from "next";
import OceanPlate from "@/components/atlas/OceanPlate";
import MarkPlate from "@/components/atlas/MarkPlate";
import { createSeaEdition, DEFAULT_SEA_SEED_V2 } from "@/lib/sea-edition";
import styles from "@/components/atlas/Atlas.module.css";

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
};

export default function AtlasIndex() {
  const edition = createSeaEdition(DEFAULT_SEA_SEED_V2, "2");
  return (
    <main id="atlas-content" className={styles.index}>
      <section className={styles.masthead} aria-labelledby="atlas-title">
        <div className={styles.mastheadTop}>
          <p>Observations & constructions</p>
          <p>Sea, ship, mathematics</p>
        </div>
        <div className={styles.mastheadBody}>
          <h1 id="atlas-title">Navigator&apos;s <br /><span>Notebook</span><i aria-hidden="true">.</i></h1>
          <div className={styles.issue}>
            <span>The first<br />specimens</span>
            <b aria-hidden="true">N°<span>01</span></b>
            <p>On the beauty<br />of how things work.</p>
          </div>
        </div>
      </section>

      <section className={styles.feature} aria-labelledby="first-note">
        <div className={styles.featurePlate}>
          <div className={styles.plateTop}><span>Plate I — The sum of a sea</span><span>01 / 02</span></div>
          <OceanPlate variant="cover" edition={edition} />
          <p className={styles.plateCaption}><span>Six waves. One surface.</span><span>Edition {edition.seed} · t = 0</span></p>
        </div>
        <div className={styles.featureCopy}>
          <p className={styles.overline}><span className={styles.smallCross} aria-hidden="true">✳</span> Field note 001 / Waves & motion</p>
          <h2 id="first-note">The sea is <br />a sum of <br /> <em>small things.</em></h2>
          <p>A crest, a trough, a little disagreement. Follow the simple parts that make a surface feel wonderfully complicated.</p>
          <Link prefetch={false} className={styles.readLink} href="/blog/three-waves-one-sea">Read the wave study <span aria-hidden="true">↗</span></Link>
          <span className={styles.sampleLabel}>Sample essay · 4 min read</span>
        </div>
      </section>

      <section className={styles.darkFeature} aria-labelledby="second-note">
        <div className={styles.darkCopy}>
          <p className={styles.overline}>Field note 002 / Geometry & craft</p>
          <span className={styles.largeIntegral} aria-hidden="true">∫</span>
          <h2 id="second-note">A symbol. <br />A vessel. <br /><em>One line of thought.</em></h2>
          <p>Where an integral becomes a mast, and the space between three shapes does the quiet work.</p>
          <Link prefetch={false} className={styles.readLink} href="/blog/an-integral-under-sail">Read the construction <span aria-hidden="true">↗</span></Link>
          <span className={styles.sampleLabel}>Sample essay · 4 min read</span>
        </div>
        <div className={styles.darkPlate}>
          <MarkPlate />
          <p className={styles.plateCaption}><span>Plate II — An integral under sail</span><span>Three filled outlines</span></p>
        </div>
      </section>

      <aside className={styles.editorsNote}>
        <span className={styles.overline}>A note on these pages</span>
        <p>Some things are better understood by taking them apart. This notebook is a place for that: the drawings, the questions, and the arithmetic beneath the surface.</p>
        <span className={styles.editorStamp}>Made to be<br /><em>looked into.</em></span>
      </aside>
    </main>
  );
}
