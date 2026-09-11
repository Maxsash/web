import Mark from "./Mark";
import { site } from "@/content/site";
import styles from "./Wordmark.module.css";

/* The mark and the name locked together.  The mark's optical centre sits a
 * little below its bounding box, so the lockup aligns on the cap height of the
 * name rather than on the box. */

export default function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <a className={styles.lockup} href={href} aria-label={`${site.name} home`}>
      <Mark className={styles.mark} />
      <span className={styles.name}>
        Maxsash <span className={styles.studio}>Studio</span>
      </span>
    </a>
  );
}
