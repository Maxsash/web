import { projects, type Project } from "@/content/projects";
import { site } from "@/content/site";
import Kicker from "./Kicker";
import ProjectFeature from "./ProjectFeature";
import section from "./Section.module.css";
import styles from "./Work.module.css";

const [lead] = projects;
const others = (kind: Project["kind"]) =>
  projects.filter((project) => project !== lead && project.kind === kind);

function ProjectGrid({ members }: { members: Project[] }) {
  return (
    <div className={styles.grid}>
      {members.map((project) => (
        <ProjectFeature
          key={project.slug}
          project={project}
          number={projects.indexOf(project) + 1}
        />
      ))}
    </div>
  );
}

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
          For clients: a law practice found through search, a security system that runs in real
          time, and a platform that took businesses off paper. And two projects of my own.
        </p>
      </header>
      <Kicker className={styles.group}>For clients</Kicker>
      <ProjectFeature project={lead} number={1} lead />
      <ProjectGrid members={others("client")} />
      <Kicker className={styles.group}>Of my own</Kicker>
      <ProjectGrid members={others("personal")} />
      <div className={styles.footer}>
        <a href={site.links.portfolio}>More work, experience, and background in the Portfolio ↗</a>
      </div>
    </section>
  );
}
