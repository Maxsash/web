import Image from "next/image";
import type { Project } from "@/content/projects";
import { formatIndex } from "@/lib/format";
import styles from "./Work.module.css";

type Props = { project: Project; number: number; lead?: boolean };

export default function ProjectFeature({ project, number, lead = false }: Props) {
  const { headline, image, tagline } = project;
  const label = formatIndex(number);
  return (
    <article className={lead ? styles.feature : styles.secondary} aria-label={project.title}>
      <figure className={lead ? styles.plate : styles.plainPlate}>
        {project.plateTitle && (
          <div className={styles.plateHead}>
            <span>{`${label} / ${project.plateTitle}`}</span>
            <span>{`Public demo · ${project.year}`}</span>
          </div>
        )}
        <Image src={image.src} width={1200} height={750} sizes={image.sizes} alt={image.alt} />
        <figcaption className={styles.caption}>{image.caption}</figcaption>
      </figure>
      <div className={lead ? styles.description : undefined}>
        <p className={styles.kicker}>{`${label} / ${project.kicker}`}</p>
        <h3>
          {headline.lead} <br />
          <em>{headline.emphasis}</em>
        </h3>
        {tagline && (
          <p className={styles.summary}>
            {tagline[0]}
            <br />
            {tagline[1]}
          </p>
        )}
        <p>{project.summary}</p>
        <dl className={styles.facts}>
          <div>
            <dt>Form</dt>
            <dd>{project.form}</dd>
          </div>
          <div>
            <dt>Construction</dt>
            <dd>{project.construction}</dd>
          </div>
        </dl>
        <div className={styles.links}>
          <a href={project.href}>{`${project.demoLabel} ↗`}</a>
          <a href={project.caseStudy}>Read the case study ↗</a>
        </div>
      </div>
    </article>
  );
}
