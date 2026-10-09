import { projects } from "@/content/projects";
import { site } from "@/content/site";
import ProjectFeature from "./ProjectFeature";
import section from "./Section.module.css";
import styles from "./Work.module.css";

export default function Work() {
  return (
    <section id="work" className={styles.section} aria-labelledby="work-heading">
      <header className={section.header}>
        <p className={section.kicker}>Work</p>
        <h2 id="work-heading">
          Ideas, made <br />
          <em>tangible.</em>
        </h2>
        <p className={section.lede}>
          Useful tools. Personal stories. Software made to carry something that matters.
        </p>
      </header>
      {projects.map((project, index) => (
        <ProjectFeature
          key={project.slug}
          project={project}
          number={index + 1}
          lead={index === 0}
        />
      ))}
      <div className={styles.footer}>
        <a href={site.links.portfolio}>More work, experience, and background in the Portfolio ↗</a>
      </div>
    </section>
  );
}
