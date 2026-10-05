import Link from "next/link";
import type { Metadata } from "next";
import { sharingMetadata } from "@/lib/seo";
import Mark from "@/components/Mark";
import styles from "@/components/atlas/Atlas.module.css";

export const metadata: Metadata = {
  title: "Navigator's Notebook — an atlas of things made",
  description: "Studies in sea, ship, and mathematics. A new publication from Maxsash Studio.",
  ...sharingMetadata("Navigator’s Notebook | Maxsash Studio", "Sample studies in sea, ship, and mathematics from Maxsash Studio.", "/blog"),
  robots: { index: false, follow: true },
};

export default function AtlasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.atlas}>
      <a className={styles.skip} href="#atlas-content">Skip to the notebook</a>
      <header className={styles.runningHead}>
        <Link prefetch={false} href="/" className={styles.harbourLink}>
          <Mark /> <span>Maxsash Studio</span>
        </Link>
        <nav aria-label="Publication">
          <Link prefetch={false} href="/blog">The notebook</Link>
          <Link prefetch={false} href="/">The living atlas <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>
      {children}
      <footer className={styles.footer}>
        <div className={styles.footerTitle}>Sea. Ship. <em>Math.</em></div>
        <p>A notebook for looking closer.<br />Two sample articles, from Maxsash Studio.</p>
        <Link prefetch={false} href="/">Return to the water <span aria-hidden="true">↗</span></Link>
      </footer>
    </div>
  );
}
