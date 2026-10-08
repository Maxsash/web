import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Mark from "@/components/Mark";
import Work from "@/components/Work";
import Elsewhere from "@/components/Elsewhere";
import { site } from "@/content/site";
import { sharingMetadata, studioStructuredData } from "@/lib/seo";
import { WaveSoundControl } from "@/components/shore/WaveSound";
import ShoreFooter from "@/components/shore/ShoreFooter";
import OceanScene from "@/components/observatory/OceanScene";
import OceanPlate from "@/components/atlas/OceanPlate";
import SeaStudio from "@/components/studio/SeaStudio";
import { notebook } from "@/content/notebook";
import {
  createSeaEdition,
  DEFAULT_SEA_SEED,
  normaliseSeaSeed,
  parseSeaVersion,
  pickVisitSea,
} from "@/lib/sea-edition";
import styles from "@/components/observatory/Observatory.module.css";

export const metadata: Metadata = {
  title: { absolute: "Maxsash Studio — Sea. Ship. Math." },
  description: site.description,
  ...sharingMetadata("Maxsash Studio — Sea. Ship. Math.", site.description, "/"),
};

type Query = { seed?: string | string[]; version?: string | string[] };

function resolveSea(query: Query) {
  if (query.seed === undefined) {
    if (query.version === undefined || query.version === "2")
      return { seed: pickVisitSea(), version: "2" as const };
    return query.version === "1" ? { seed: DEFAULT_SEA_SEED, version: "1" as const } : null;
  }
  if (typeof query.seed !== "string") return null;
  const seed = normaliseSeaSeed(query.seed);
  const version =
    query.version === undefined
      ? "1"
      : typeof query.version === "string"
        ? parseSeaVersion(query.version)
        : null;
  return seed && version ? { seed, version } : null;
}

export default async function Home({ searchParams }: { searchParams: Promise<Query> }) {
  const sea = resolveSea(await searchParams);
  if (!sea) notFound();
  const { seed, version } = sea;
  const edition = createSeaEdition(seed, version);
  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(studioStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      <a className={styles.skip} href="#work">
        Skip to the work
      </a>
      <main id="main">
        <section
          className={styles.story}
          data-observatory
          aria-label="From open water to its mathematical construction"
        >
          <div className={styles.stage}>
            <div className={styles.fallback} aria-hidden="true">
              <OceanPlate edition={edition} />
            </div>
            <div className={styles.shade} />
            <div className={styles.paperVeil} />
            <header className={styles.nav}>
              <Link prefetch={false} href="/" className={styles.brand}>
                <Mark />
                <span>Maxsash Studio</span>
              </Link>
              <nav aria-label="Studio">
                {site.nav.map((item) =>
                  item.href.startsWith("#") ? (
                    <a key={item.href} href={item.href}>
                      {item.label}
                    </a>
                  ) : (
                    <Link prefetch={false} key={item.href} href={item.href}>
                      {item.label}
                    </Link>
                  ),
                )}
              </nav>
              <div className={styles.sceneControls}>
                <WaveSoundControl />
              </div>
            </header>
            <OceanScene key={edition.seed} edition={edition} />
            <div className={styles.intro}>
              <p className={styles.eyebrow}>A place for things worth making</p>
              <h1>
                <span>Sea.</span>
                <span>Ship.</span>
                <span>
                  <em>Math.</em>
                </span>
              </h1>
              <p>
                Software, games, and experiments.
                <br />
                Built with curiosity. By Yash.
              </p>
            </div>
            <div className={styles.sceneMeta} aria-hidden="true">
              <span>A surface in motion.</span>
              <span>A structure underneath.</span>
              <span className={styles.edition}>Authored sea / {edition.seed}</span>
            </div>
            <div className={styles.middle}>
              <p className={styles.eyebrow}>02 / Beneath the impression</p>
              <h2>
                Wonder has <br />
                <em>a structure.</em>
              </h2>
              <p>
                The light gives way to lines. The same crest, the same ship, the same sea—seen
                through its mathematics.
              </p>
            </div>
            <div className={styles.technical} aria-hidden="true">
              <p>
                <b>01</b> / Six directional waves
              </p>
              <p>
                <b>02</b> / A hull on the same surface
              </p>
              <p>
                <b>03</b> / A drawing of the motion
              </p>
            </div>
            <div className={styles.end}>
              <h2>
                Look closer. <br />
                <em>Keep going.</em>
              </h2>
              <p>Every finished thing has a drawing underneath. This is where I keep mine.</p>
            </div>
            <div className={styles.chapterRail}>
              <a href="#work">
                <span aria-hidden="true">↓</span> <span>From a surface to a structure</span>
                <b>Keep exploring</b>
              </a>
            </div>
          </div>
        </section>

        <Work />

        <SeaStudio seed={seed} version={version} />

        <section id="notebook" className={styles.publication} aria-labelledby="notebook-title">
          <div className={styles.publicationTop}>
            <span>The navigator’s notebook</span>
            <span>Observations & constructions</span>
          </div>
          <div className={styles.publicationBody}>
            <div>
              <h2 id="notebook-title">
                For the <br />
                <em>curious mind.</em>
              </h2>
              <p>The drawings. The small discoveries. The arithmetic beneath the surface.</p>
              <Link prefetch={false} className={styles.textLink} href="/blog">
                Open the notebook <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <ul className={styles.entries} aria-label="From the notebook">
              {notebook.map((post) => (
                <li key={post.slug}>
                  <Link prefetch={false} href={`/blog/${post.slug}`}>
                    <span>
                      Field note {post.number} · {post.topic}
                    </span>
                    <strong>{post.title}</strong>
                    <span>Sample essay · {post.minutes} min read</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <Elsewhere />
      </main>
      <ShoreFooter seaModel={edition.version} />
    </div>
  );
}
