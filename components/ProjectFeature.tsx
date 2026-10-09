import Image from "next/image";
import type { Project } from "@/content/projects";
import { formatIndex } from "@/lib/format";
import Kicker from "./Kicker";
import SystemPlate from "./SystemPlate";
import section from "./Section.module.css";
import styles from "./Work.module.css";

type Props = { project: Project; number: number; lead?: boolean };

export default function ProjectFeature({ project, number, lead = false }: Props) {
  const { headline, visual, plate, tagline, demo } = project;
  const label = formatIndex(number);
  const drawn = visual.kind === "drawing";
  const facts = [
    ["Role", project.role],
    ["Construction", project.construction],
  ];
  return (
    <article className={lead ? styles.feature : styles.entry} aria-label={project.title}>
      <figure className={lead || drawn ? styles.plate : styles.plainPlate} data-hover="slide">
        {plate && (
          <div className={styles.plateHead}>
            <span>{`${label} / ${plate.title}`}</span>
            <span>{plate.note}</span>
          </div>
        )}
        {drawn ? (
          <SystemPlate id={project.slug} drawing={visual.drawing} alt={visual.alt} />
        ) : (
          <>
            <Image
              src={visual.src}
              width={1200}
              height={750}
              sizes={visual.sizes}
              alt={visual.alt}
            />
            <figcaption className={styles.caption}>{visual.caption}</figcaption>
          </>
        )}
      </figure>
      <div className={lead ? styles.description : undefined}>
        <Kicker className={styles.kicker}>{`${label} / ${project.kicker}`}</Kicker>
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
        {lead ? (
          <dl className={section.facts}>
            {facts.map(([term, detail]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className={styles.meta}>{`${project.role} · ${project.construction}`}</p>
        )}
        <div className={styles.links}>
          {demo && <a className={section.link} href={demo.href}>{`${demo.label} ↗`}</a>}
          <a className={section.link} href={project.caseStudy}>
            Read the case study<span className="visually-hidden"> of {project.title}</span> ↗
          </a>
        </div>
      </div>
    </article>
  );
}
