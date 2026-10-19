import PageLink from "@/components/PageLink";
import type { Metadata } from "next";
import { sharingMetadata } from "@/lib/seo";
import Mark from "@/components/Mark";
import { studioChannels } from "@/content/site";
import StudioNav from "@/components/StudioNav";
import styles from "@/components/atlas/Atlas.module.css";

export const metadata: Metadata = {
  title: "Navigator's Notebook — an atlas of things made",
  description: "Studies in sea, ship, and mathematics from Maxsash Studio.",
  ...sharingMetadata(
    "Navigator’s Notebook | Maxsash Studio",
    "Studies in sea, ship, and mathematics from Maxsash Studio.",
    "/blog",
  ),
  robots: { index: true, follow: true },
};

export default function AtlasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.atlas}>
      <a className={styles.skip} href="#atlas-content">
        Skip to the notebook
      </a>
      <header className={styles.runningHead}>
        <PageLink href="/" className={styles.harbourLink}>
          <Mark /> <span>Maxsash Studio</span>
        </PageLink>
        <StudioNav />
      </header>
      {children}
      <footer className={styles.footer}>
        <div className={styles.footerTitle}>
          Sea. Ship. <em>Math.</em>
        </div>
        <p>A notebook for looking closer.</p>
        <ul className={styles.footerLinks} aria-label="Maxsash Studio">
          <li>
            <PageLink href="/privacy">Privacy & recordings</PageLink>
          </li>
          <li>
            <PageLink href="/">
              Return to the studio <span aria-hidden="true">↗</span>
            </PageLink>
          </li>
          {studioChannels.map((channel) => (
            <li key={channel.label}>
              <a href={channel.href}>
                {channel.label} <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}
