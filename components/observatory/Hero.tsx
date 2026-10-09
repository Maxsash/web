import OceanPlate from "@/components/atlas/OceanPlate";
import Mark from "@/components/Mark";
import NotebookLink from "@/components/NotebookLink";
import PageLink from "@/components/PageLink";
import { WaveSoundControl } from "@/components/sound/WaveSound";
import { site } from "@/content/site";
import type { SeaEdition } from "@/lib/sea/types";
import OceanScene from "./OceanScene";
import styles from "./Observatory.module.css";

export default function Hero({ edition }: { edition: SeaEdition }) {
  return (
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
          <PageLink href="/" className={styles.brand}>
            <Mark />
            <span>Maxsash Studio</span>
          </PageLink>
          <nav aria-label="Studio">
            {site.nav.map((item) =>
              item.href.startsWith("#") ? (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ) : (
                <NotebookLink key={item.href} href={item.href}>
                  {item.label}
                </NotebookLink>
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
            Web apps, built end to end.
            <br />
            Open to freelance work. By Yash.
          </p>
        </div>
        <p className={styles.sceneMeta} aria-hidden="true">
          Authored sea / {edition.seed}
        </p>
        <div className={styles.end}>
          <h2>
            Look closer. <br />
            <em>Keep going.</em>
          </h2>
          <p>Every finished thing has a drawing underneath. This is where I keep mine.</p>
        </div>
        <div className={styles.chapterRail}>
          <a href={`#${site.afterHero.id}`}>
            <span aria-hidden="true">↓</span> View {site.afterHero.label}
          </a>
        </div>
      </div>
    </section>
  );
}
