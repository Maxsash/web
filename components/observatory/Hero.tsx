import Link from "next/link";
import OceanPlate from "@/components/atlas/OceanPlate";
import Mark from "@/components/Mark";
import NotebookLink from "@/components/NotebookLink";
import { WaveSoundControl } from "@/components/shore/WaveSound";
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
            The light gives way to lines. The same crest, the same ship, the same sea—seen through
            its mathematics.
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
  );
}
