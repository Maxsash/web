import Sea from "./Sea";
import Wordmark from "./Wordmark";
import Icon from "./Icon";
import { site } from "@/content/site";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <header className={styles.hero}>
      <Sea />

      <div className={`shell ${styles.bar}`}>
        <Wordmark />
        <nav className={styles.nav} aria-label="Sections">
          {site.nav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className={`shell ${styles.stage}`}>
        <div className={styles.copy}>
          <p className={`eyebrow ${styles.eyebrow}`}>{site.tagline}</p>

          <h1 className={styles.title}>
            Maxsash <span className={styles.labs}>Labs</span>
          </h1>

          <p className={styles.intro}>{site.intro}</p>

          <div className={styles.actions}>
            <a className={styles.primary} href="#work">
              See the work
              <Icon name="arrow" size={18} />
            </a>
            <a className={styles.secondary} href="#elsewhere">
              Everywhere else
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
