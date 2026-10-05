import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Mark from "@/components/Mark";
import Work from "@/components/Work";
import Elsewhere from "@/components/Elsewhere";
import { site } from "@/content/site";
import OceanScene from "@/components/observatory/OceanScene";
import OceanPlate from "@/components/atlas/OceanPlate";
import { createSeaEdition, DEFAULT_SEA_SEED, normaliseSeaSeed } from "@/lib/sea-edition";
import styles from "@/components/observatory/Observatory.module.css";

export const metadata: Metadata = {
  title: { absolute: "Maxsash Studio — Sea. Ship. Math." },
  description: site.description,
  alternates: { canonical: "/" },
};

export default async function Home({searchParams}: {searchParams:Promise<{seed?:string|string[]}>}) {
  const query=await searchParams;
  const seed=typeof query.seed==="string"?normaliseSeaSeed(query.seed):query.seed===undefined?DEFAULT_SEA_SEED:null;
  if(!seed)notFound();
  const edition=createSeaEdition(seed);
  const nextSeed=seed===DEFAULT_SEA_SEED?"27c4b901":DEFAULT_SEA_SEED;
  return (
    <main className={styles.page}>
      <a className={styles.skip} href="#work">Skip to the work</a>
      <section className={styles.story} data-observatory aria-label="From open water to its mathematical construction">
        <div className={styles.stage}>
          <div className={styles.fallback} aria-hidden="true"><OceanPlate edition={edition} /></div>
          <OceanScene key={edition.seed} edition={edition} />
          <div className={styles.shade} />
          <div className={styles.paperVeil} />
          <header className={styles.nav}>
            <Link prefetch={false} href="/" className={styles.brand}><Mark /><span>Maxsash Studio</span></Link>
            <nav aria-label="Studio">{site.nav.map(item=>item.href.startsWith("#")?<a key={item.href} href={item.href}>{item.label}</a>:<Link prefetch={false} key={item.href} href={item.href}>{item.label}</Link>)}</nav>
            <span className={styles.proof}>Software / Games / Experiments</span>
          </header>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>A place for things worth making</p>
            <h1><span>Sea.</span><span>Ship.</span><span><em>Math.</em></span></h1>
            <p>Software, games, and experiments.<br />Built with curiosity. By Yash.</p>
          </div>
          <div className={styles.sceneMeta} aria-hidden="true"><span>A surface in motion.</span><span>A structure underneath.</span><span className={styles.edition}>Authored sea / {edition.seed}</span></div>
          <div className={styles.middle}>
            <p className={styles.eyebrow}>02 / Beneath the impression</p>
            <h2>Wonder has<br /><em>a structure.</em></h2>
            <p>The light gives way to lines. The same crest, the same ship, the same sea—seen through its mathematics.</p>
          </div>
          <div className={styles.technical} aria-hidden="true"><p><b>01</b> / Six directional waves</p><p><b>02</b> / A hull on the same surface</p><p><b>03</b> / A drawing of the motion</p></div>
          <div className={styles.end}><h2>Look closer.<br /><em>Keep going.</em></h2><p>Every finished thing has a drawing underneath. This is where I keep mine.</p></div>
          <div className={styles.chapterRail}><a href="#work">↓ <span>From a surface to a structure</span><b>Keep exploring</b></a></div>
        </div>
      </section>

      <Work />

      <section id="inside" className={styles.threshold}>
        <div className={styles.thresholdTop}><span>01 / An edition of the sea</span><span>Authored study · {edition.seed.toUpperCase()}</span></div>
        <div className={styles.thresholdBody}>
          <div><h2>Even the sea<br />can leave<br /><em>a paper trail.</em></h2><p>The surface you just crossed begins with six waves and a seed. Its drawing keeps that identity: a small piece of this world, resolved into ink.</p><a className={styles.textLink} href={`/api/sea-edition/print?seed=${seed}&version=1`} target="_blank" rel="noopener noreferrer">Keep this field plate <span aria-hidden="true">↗</span></a></div>
          <figure className={styles.editionPlate}><OceanPlate edition={edition} /><figcaption><p><span>Field plate / {edition.seed}</span><span>Six waves · one sea</span></p></figcaption></figure>
        </div>
        <details className={styles.mechanism}>
          <summary>Inside the sea</summary>
          <div><div><p className={styles.equation}>h = ∑ Aᵢ sin(kᵢ · x − ωᵢt + φᵢ)</p><p>One height field supplies the surface, its slope, the ship’s attitude, and this engraved plate. Scrolling changes the way it is seen.</p></div><div><p>The scene is an authored mathematical study. Its lighting and wake are visual approximations; it is not a real ocean observation or a fluid simulation.</p><p><a href={`/api/sea-edition?seed=${seed}&version=1`} target="_blank" rel="noopener noreferrer">Read the edition’s six waves ↗</a></p><Link prefetch={false} className={styles.textLink} href={`/?seed=${nextSeed}`}>Visit another edition ↗</Link></div></div>
        </details>
      </section>

      <section id="writing" className={styles.publication}>
        <span id="the-notebook" className={styles.anchor} aria-hidden="true" />
        <div className={styles.publicationTop}><span>02 / The navigator’s notebook</span><span>Observations & constructions</span></div>
        <Link prefetch={false} href="/blog"><h2>For the<br /><em>curious mind.</em></h2><div><p>The drawings. The small discoveries. The arithmetic beneath the surface.</p><span className={styles.textLink}>Open the notebook <span aria-hidden="true">↗</span></span></div></Link>
      </section>
      <Elsewhere />

      <footer className={styles.footer}><Link prefetch={false} href="/">Maxsash Studio</Link><span>© {new Date().getFullYear()} · Sea. Ship. Math.</span><a href={site.links.email}>Start a conversation ↗</a></footer>
    </main>
  );
}
