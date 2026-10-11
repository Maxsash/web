import type { ReactNode } from "react";
import Mark from "@/components/Mark";
import PageLink from "@/components/PageLink";
import StudioNav from "@/components/StudioNav";
import ShoreFooter from "@/components/shore/ShoreFooter";
import styles from "./PageShell.module.css";

export default function PageShell({ skip, children }: { skip: string; children: ReactNode }) {
  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#main">
        {skip}
      </a>
      <header className={styles.top}>
        <PageLink href="/" className={styles.brand}>
          <Mark />
          <span>Maxsash Studio</span>
        </PageLink>
        <StudioNav />
      </header>
      <main id="main">{children}</main>
      <ShoreFooter />
    </div>
  );
}
