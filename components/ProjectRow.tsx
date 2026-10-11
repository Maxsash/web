import type { Project } from "@/content/projects";
import { formatIndex } from "@/lib/format";
import CaseStudyLink from "./CaseStudyLink";
import section from "./Section.module.css";
import styles from "./Work.module.css";

type Props = { project: Project; number: number };

export default function ProjectRow({ project, number }: Props) {
  return (
    <article className={styles.row} aria-label={project.title}>
      <span className={section.index}>{formatIndex(number)}</span>
      <div>
        <p className={styles.rowKicker}>{project.kicker}</p>
        <h3>{project.title}</h3>
      </div>
      <div>
        <p>{project.summary}</p>
        <p className={section.proof}>{project.proof}</p>
      </div>
      <CaseStudyLink project={project} />
    </article>
  );
}
