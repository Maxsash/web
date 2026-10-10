import { aboutFacts } from "@/content/about";
import { profiles, site } from "@/content/site";
import Kicker from "./Kicker";
import Portrait from "./portrait/Portrait";
import section from "./Section.module.css";
import styles from "./About.module.css";

export default function About() {
  const [first, last] = site.owner.split(" ");
  return (
    <section id="about" className={styles.section} aria-labelledby="about-heading">
      <header className={section.header}>
        <Kicker>About</Kicker>
        <h2 id="about-heading" className={styles.name}>
          {first} <br />
          {last}.
        </h2>
        <p className={section.lede}>
          A founding engineer with more than five years in backend and real-time systems. I have led
          whole systems from the first plan to the deployed product; Maxsash Studio is where I build
          them now, from the drawing underneath to the finished thing. Working with me means talking
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
          {profiles.map((profile) => (
            <li key={profile.label}>
              <a className={section.link} href={profile.href}>
                {`${profile.label} ↗`}
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
