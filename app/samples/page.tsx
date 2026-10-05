import Link from "next/link";
import type { Metadata } from "next";
import OceanPlate from "@/components/atlas/OceanPlate";
import styles from "@/components/review/Review.module.css";

export const metadata:Metadata={
  title:"The Living Atlas — foundation",
  description:"A sea that becomes its own drawing, and a notebook for the curious.",
  robots:{index:false,follow:false},
};

export default function Samples(){
  return <main className={`shell ${styles.gallery}`}>
    <Link prefetch={false} href="/">← Current website</Link>
    <div className={styles.intro}>
      <div><p className="eyebrow">Sea. Ship. Math. / Foundation 02</p><h1>The living <em>atlas.</em></h1><p className={styles.lede}>An ocean that reveals its own construction. A publication made of observations, drawings, and ideas. One world, seen in two ways.</p></div>
      <div><OceanPlate /></div>
    </div>
    <section className={styles.group}>
      <div className={styles.groupHead}><h2>The accepted foundation</h2><p>Homepage + publication</p></div>
      <div className={styles.cards}>
        <article className={styles.card}><p className="eyebrow">A / The studio</p><h3>From light to lines.</h3><p>A procedural sea and ship become a moving engineering drawing as you scroll. The surface, the ship’s attitude, and a printable field plate share six waves.</p><Link prefetch={false} href="/">Enter the Living Atlas ↗</Link></article>
        <article className={styles.card}><p className="eyebrow">B / The publication</p><h3>The navigator’s notebook.</h3><p>Oversized type, engraved plates, marginal notes, and two sample essays. An editorial identity of its own.</p><Link prefetch={false} href="/blog">Open the new notebook ↗</Link></article>
      </div>
      <p className={styles.footnote}>This direction is now the homepage and publication foundation. The studio’s project content, a deeper mathematical discovery, and optional phone tilt are next-stage work. The current scene works through ordinary scrolling.</p>
    </section>
    <section className={styles.group}>
      <div className={styles.groupHead}><h2>Look beneath the surface</h2><p>The same model, held still</p></div>
      <div className={styles.cards}>
        <article className={styles.card}><h3>The sea is a sum of small things.</h3><p>Six directional waves, a height field, and a different way to see the scene.</p><Link prefetch={false} href="/blog/three-waves-one-sea">Read the sample essay ↗</Link></article>
        <article className={styles.card}><h3>An integral under sail.</h3><p>The construction behind the studio mark, presented as an engraved folio.</p><Link prefetch={false} href="/blog/an-integral-under-sail">Read the sample essay ↗</Link></article>
      </div>
      <a className={styles.textLink} href="/api/sea-edition/print?seed=5ea5cafe&version=1" target="_blank" rel="noopener noreferrer">Open the reproducible field plate ↗</a>
    </section>
    <p className={styles.footnote}>The earlier Wind, Helm, and voyage experiments have been retired. The accepted foundation follows one coherent direction; the research and decision history remain in the repository documentation.</p>
  </main>;
}
