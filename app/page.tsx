import type { Metadata } from "next";
import { notFound } from "next/navigation";
import About from "@/components/About";
import Contact from "@/components/Contact";
import JsonLd from "@/components/JsonLd";
import NotebookSection from "@/components/NotebookSection";
import Work from "@/components/Work";
import ScrollMark from "@/components/feedback/ScrollMark";
import Hero from "@/components/observatory/Hero";
import ShoreFooter from "@/components/shore/ShoreFooter";
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
      <JsonLd data={studioStructuredData} />
      <a className={styles.skip} href={`#${site.afterHero.id}`}>
        Skip to {site.afterHero.label}
      </a>
      <ScrollMark kind="depth" />
      <main id="main">
        <Hero edition={edition} />

        <Work />
        <About />
        <Contact />

        <NotebookSection />
      </main>
      <ShoreFooter seaModel={edition.version} />
    </div>
  );
}
