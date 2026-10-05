import Icon from "./Icon";
import { projects, type Project } from "@/content/site";
import styles from "./Sections.module.css";

/* Cards carry their own links in a footer row rather than wrapping the whole
 * card in an anchor: a project usually has both a site and a repository, and
 * anchors cannot nest. */

function Card({ project, index }: { project: Project; index: number }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.counter}>{String(index + 1).padStart(2, "0")}</span>
        <span className={styles.status} data-status={project.status}>
          {project.status}
        </span>
      </div>

      <h3 className={styles.cardTitle}>{project.title}</h3>
      <p className={styles.cardBody}>{project.summary}</p>

      <ul className={styles.tags}>
        {project.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
        <li className={styles.year}>{project.year}</li>
      </ul>

      {project.href || project.repo || project.caseStudy ? (
        <div className={styles.cardLinks}>
          {project.href ? (
            <a href={project.href}>
              View demo
              <Icon name="arrow" size={16} />
            </a>
          ) : null}
          {project.caseStudy ? <a href={project.caseStudy}>Case study<Icon name="arrow" size={16} /></a> : null}
          {project.repo ? (
            <a href={project.repo}>
              <Icon name="github" size={16} />
              Source
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default function Work() {
  return (
    <section id="work" className={`shell ${styles.section}`}>
      <div className={styles.head}>
        <p className="eyebrow">Work</p>
        <h2 className={styles.heading}>Things built and launched</h2>
        <p className={styles.lede}>
          Applications, games and small tools, kept here whether they are
          finished or still on the stocks.
        </p>
      </div>

      <div className={styles.grid}>
        {projects.map((project, i) => (
          <Card key={project.slug} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
