import Wordmark from "./Wordmark";
import Icon from "./Icon";
import { site } from "@/content/site";
import styles from "./Sections.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.footerInner}`}>
        <Wordmark />

        <p className={styles.colophon}>
          The mark is an integral sign rigged as a mast: mathematics and the sea,
          which are the two things I keep coming back to.
        </p>

        <div className={styles.footerLinks}>
          <a href={site.links.github}>
            <Icon name="github" size={16} />
            GitHub
          </a>
          <a href={site.links.email}>
            <Icon name="mail" size={16} />
            Email
          </a>
        </div>

        <p className={styles.credit}>
          <span>&copy; {new Date().getFullYear()} {site.name}</span>
          <Icon name="sextant" size={16} />
        </p>
      </div>
    </footer>
  );
}
