import ArrowIcon from "@/components/ArrowIcon";
import { destinations, site } from "@/content/site";
import { formatIndex } from "@/lib/format";
import styles from "./Elsewhere.module.css";

export default function Elsewhere() {
  return (
    <section id="elsewhere" className={styles.section} aria-labelledby="elsewhere-heading">
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>Elsewhere / Ports of call</p>
          <h2 id="elsewhere-heading">
            The other <br />
            <em>ports.</em>
          </h2>
          <p className={styles.intro}>
            The work lives here. The background, the code, and the conversations have their own
            places.
          </p>
        </div>
        <svg className={styles.compass} viewBox="0 0 240 240" aria-hidden="true">
          <circle cx="120" cy="120" r="92" />
          <circle cx="120" cy="120" r="74" strokeDasharray="1 8" />
          <path d="M120 12v216M12 120h216M54 54l132 132M54 186 186 54" />
          <path className={styles.needle} d="m120 38 18 82-18 82-18-82Z" />
          <circle cx="120" cy="120" r="5" />
        </svg>
      </header>
      <section className={styles.routes} aria-labelledby="routes-title">
        <div className={styles.routeHead}>
          <h3 id="routes-title">Set a course</h3>
          <span>{formatIndex(destinations.length)} / Destinations</span>
        </div>
        <ul>
          {destinations.map((place, index) => (
            <li key={place.label}>
              <a
                className={styles.route}
                href={place.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.number}>{formatIndex(index + 1)}</span>
                <span className={styles.routeCopy}>
                  <span className={styles.routeTitle}>
                    {place.label}
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </span>
                  <span className={styles.blurb}>{place.blurb}</span>
                </span>
                <span className={styles.destination}>{place.scope}</span>
                <ArrowIcon size={24} />
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className={styles.contact} aria-labelledby="contact-title">
        <div>
          <p className={styles.overline}>An open line</p>
          <h3 id="contact-title">
            Something <br />
            <em>on your mind?</em>
          </h3>
          <p>A question, an idea, or a thing worth building together.</p>
        </div>
        <a href={site.links.email} className={styles.email}>
          {site.links.email.slice(7)}
          <span aria-hidden="true">↗</span>
        </a>
      </section>
    </section>
  );
}
