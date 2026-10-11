import type { Project } from "@/content/projects";
import { formatIndex } from "@/lib/format";
import Kicker from "./Kicker";
import CaseStudyLink from "./CaseStudyLink";
import ProjectPlate from "./ProjectPlate";
import section from "./Section.module.css";
import styles from "./Work.module.css";

type Props = { project: Project; number: number; lead?: boolean };

export default function ProjectFeature({ project, number, lead = false }: Props) {
  const { headline, tagline } = project;
  const label = formatIndex(number);
  return (
    <article className={lead ? styles.feature : styles.entry} aria-label={project.title}>
      <ProjectPlate id={project.slug} visual={project.visuals[0]} label={label} />
      <div className={lead ? styles.description : undefined}>
        <Kicker className={styles.kicker}>{`${label} / ${project.kicker}`}</Kicker>
        <h3>{headline}</h3>
        {tagline && (
          <p className={styles.summary}>
            {tagline[0]}
            <br />
            {tagline[1]}
          </p>
        )}
        <p>{project.summary}</p>
        <p className={section.proof}>{project.proof}</p>
        <CaseStudyLink project={project} />
      </div>
    </article>
  );
}
