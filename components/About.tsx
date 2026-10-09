import { aboutFacts } from "@/content/about";
import { destinations, site } from "@/content/site";
import Portrait from "./portrait/Portrait";
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
          A founding engineer with more than five years in backend and real-time systems. As a
          freelancer I have built a real-time intrusion detection platform, a multi-tenant SaaS
          platform and a law practice&apos;s website. Maxsash Studio is where I build whole
          products, from the drawing underneath to the finished thing. Working with me means talking
          to the person who writes the code.
        </p>
        <dl className={section.facts}>
          {aboutFacts.map(({ term, detail }) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
        <ul className={styles.profiles} aria-label="Profiles">
          {destinations.map((place) => (
            <li key={place.label}>
              <a className={section.link} href={place.href}>
                {`${place.label} ↗`}
              </a>
            </li>
          ))}
        </ul>
      </header>
      <figure className={styles.portrait}>
        <Portrait
          src={site.portrait}
          size={720}
          sizes="(max-width: 48rem) 60vw, 22vw"
          alt={`Portrait of ${site.owner}`}
          legend={{ top: `${site.owner} · ${site.title}`, bottom: site.home }}
        />
        <figcaption className={section.caption}>
          The drawing underneath: a photograph, engraved in the waves of Home water, the
          studio&apos;s own sea.
        </figcaption>
      </figure>
    </section>
  );
}
