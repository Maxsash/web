import { projects, type Project } from "@/content/projects";
import Kicker from "./Kicker";
import ProjectFeature from "./ProjectFeature";
import ProjectRow from "./ProjectRow";
import section from "./Section.module.css";
import styles from "./Work.module.css";

const [lead] = projects;
const others = (kind: Project["kind"]) =>
  projects.filter((project) => project !== lead && project.kind === kind);
const numberOf = (project: Project) => projects.indexOf(project) + 1;

export default function Work() {
  return (
    <section id="work" className={styles.section} aria-labelledby="work-heading">
      <header className={section.header}>
        <Kicker>Work</Kicker>
        <h2 id="work-heading">
          Ideas, made <br />
          tangible.
        </h2>
        <p className={section.lede}>
          I am a backend engineer first, so the client work is shown as the system underneath: a law
          practice found through search, a platform that took businesses off paper, and a security
          system that runs in real time. And two projects of my own.
        </p>
      </header>
      <Kicker className={styles.group}>For clients</Kicker>
      <ProjectFeature project={lead} number={1} lead />
      <div className={styles.grid}>
        {others("client").map((project) => (
          <ProjectFeature key={project.slug} project={project} number={numberOf(project)} />
        ))}
      </div>
      <Kicker className={styles.group}>Of my own</Kicker>
      <div className={styles.rows}>
        {others("personal").map((project) => (
          <ProjectRow key={project.slug} project={project} number={numberOf(project)} />
        ))}
      </div>
    </section>
  );
}
