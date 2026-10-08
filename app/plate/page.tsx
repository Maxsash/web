import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createSeaEdition,
  DEFAULT_SEA_SEED_V2,
  describeSea,
  normaliseSeaSeed,
  parseSeaVersion,
  renderSeaPlate,
} from "@/lib/sea-edition";
import PrintButton from "./PrintButton";
import styles from "./Plate.module.css";

export const metadata: Metadata = {
  title: "Field plate",
  description: "A printable engraving of an authored sea from Maxsash Studio.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{
    seed?: string | string[];
    version?: string | string[];
    print?: string | string[];
  }>;
};

export default async function PlatePage({ searchParams }: Props) {
  const query = await searchParams;
  const seed =
    query.seed === undefined
      ? DEFAULT_SEA_SEED_V2
      : typeof query.seed === "string"
        ? normaliseSeaSeed(query.seed)
        : null;
  const version =
    query.version === undefined
      ? query.seed === undefined
        ? "2"
        : "1"
      : typeof query.version === "string"
        ? parseSeaVersion(query.version)
        : null;
  if (!seed || !version) notFound();
  const edition = createSeaEdition(seed, version);
  const words = edition.settings
    ? describeSea(edition.settings).sentence
    : "An earlier, version 1 sea";
  const encoded = `seed=${seed}&version=${version}`;
  return (
    <main className={styles.page}>
      <header className={styles.bar}>
        <div>
          <p className={styles.kicker}>Field plate · {seed}</p>
          <h1>
            Your sea, <em>kept.</em>
          </h1>
          <p>{words}. Printed from the exact waves you made, frozen at one moment.</p>
        </div>
        <div className={styles.actions}>
          <PrintButton auto={query.print === "1"} />
          <a href={`/api/sea-edition/print?${encoded}&download=1`} download>
            Save as SVG
          </a>
          <Link prefetch={false} href={`/?${encoded}`}>
            Sail this sea ↑
          </Link>
          <Link prefetch={false} href="/#sea-studio">
            Back to the sea studio
          </Link>
        </div>
      </header>
      <figure className={styles.sheet}>
        {/* Generated numeric geometry from a validated seed: no untrusted markup. */}
        <div dangerouslySetInnerHTML={{ __html: renderSeaPlate(edition) }} />
        <figcaption>
          For a clean print, choose landscape and switch off headers and footers in the print
          dialog.
        </figcaption>
      </figure>
    </main>
  );
}
