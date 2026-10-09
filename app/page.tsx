import type { Metadata } from "next";
import { notFound } from "next/navigation";
import About from "@/components/About";
import Contact from "@/components/Contact";
import NotebookSection from "@/components/NotebookSection";
import Work from "@/components/Work";
import Hero from "@/components/observatory/Hero";
import ShoreFooter from "@/components/shore/ShoreFooter";
import SeaStudio from "@/components/studio/SeaStudio";
import { site } from "@/content/site";
import { sharingMetadata, studioStructuredData } from "@/lib/seo";
import { createSeaEdition } from "@/lib/sea/edition";
import { pickVisitSea } from "@/lib/sea/presets";
import { resolvePageSea, type PageSeaQuery } from "@/lib/sea/request";
import styles from "@/components/observatory/Observatory.module.css";

export const metadata: Metadata = {
  title: { absolute: "Maxsash Studio — Sea. Ship. Math." },
  description: site.description,
  ...sharingMetadata("Maxsash Studio — Sea. Ship. Math.", site.description, "/"),
};

export default async function Home({ searchParams }: { searchParams: Promise<PageSeaQuery> }) {
  const sea = resolvePageSea(await searchParams, pickVisitSea);
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
      <a className={styles.skip} href={`#${site.afterHero.id}`}>
        Skip to {site.afterHero.label}
      </a>
      <main id="main">
        <Hero edition={edition} />

        <Work />
        <About />
        <Contact />

        <NotebookSection />
        <SeaStudio seed={seed} version={version} />
      </main>
      <ShoreFooter seaModel={edition.version} />
    </div>
  );
}
