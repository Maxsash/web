import { projectSteps } from "@/content/services";
import { formatIndex } from "@/lib/format";
import section from "./Section.module.css";
import styles from "./Services.module.css";

export default function Services() {
  return (
    <section id="services" className={styles.section} aria-labelledby="services-heading">
      <header className={section.header}>
        <p className={section.kicker}>Services</p>
        <h2 id="services-heading">
          Web products, <br />
          <em>end to end.</em>
        </h2>
        <p className={section.lede}>
          One person from the first sketch to the deployed app: the screens, the backend, the
          database and the hosting, made to fit together.
        </p>
      </header>
      <p id="project-steps" className={section.kicker}>
        How a project goes
      </p>
      <ol className={styles.steps} aria-labelledby="project-steps">
        {projectSteps.map((step, index) => (
          <li key={step.title}>
            <span className={section.index}>{formatIndex(index + 1)}</span>
            <h3>{step.title}</h3>
            <p>{step.detail}</p>
          </li>
        ))}
      </ol>
      <div className={styles.footer}>
        <p>
          Backend or real-time work on its own is welcome too: APIs, event-driven systems, a
          database that has slowed down. It is what I have done for more than five years.
        </p>
        <a className={section.link} href="#contact">
          Start a project ↓
        </a>
      </div>
    </section>
  );
}
