import { aboutFacts } from "@/content/about";
import { site } from "@/content/site";
import section from "./Section.module.css";
import styles from "./About.module.css";

export default function About() {
  const [first, last] = site.owner.split(" ");
  return (
    <section id="about" className={styles.section} aria-labelledby="about-heading">
      <header className={section.header}>
        <p className={section.kicker}>About</p>
        <h2 id="about-heading" className={styles.name}>
          {first} <br />
          <em>{last}.</em>
        </h2>
        <p className={section.lede}>
          A software engineer with more than five years in backend and real-time systems:
          event-driven services, APIs and the databases beneath them. Maxsash Studio is where I
          build whole products, from the drawing underneath to the finished thing. Working with me
          means talking to the person who writes the code.
        </p>
      </header>
      <div className={styles.details}>
        <dl className={section.facts}>
          {aboutFacts.map(({ term, detail }) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
        <a className={section.link} href={site.links.portfolio}>
          Experience and background in the portfolio ↗
        </a>
      </div>
    </section>
  );
}
