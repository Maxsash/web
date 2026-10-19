import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Contact from "@/components/Contact";
import JsonLd from "@/components/JsonLd";
import Kicker from "@/components/Kicker";
import PageLink from "@/components/PageLink";
import PageShell from "@/components/PageShell";
import ProjectPlate from "@/components/ProjectPlate";
import Prose from "@/components/Prose";
import { readCaseStudy } from "@/content/case-studies";
import {
  caseStudyPath,
  caseStudyTitle,
  projects,
  projectShareImage,
  searchDescription,
} from "@/content/projects";
import { formatIndex, sentenceCase } from "@/lib/format";
import { caseStudyStructuredData, sharingMetadata } from "@/lib/seo";
import section from "@/components/Section.module.css";
import styles from "../CaseStudy.module.css";

type Props = { params: Promise<{ slug: string }> };

const findProject = (slug: string) => projects.findIndex((project) => project.slug === slug);

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = projects[findProject((await params).slug)];
  if (!project) notFound();
  const title = caseStudyTitle(project);
  const description = searchDescription(project);
  return {
    title: { absolute: title },
    description,
    ...sharingMetadata(
      `${title} | Maxsash Studio`,
      description,
      caseStudyPath(project.slug),
      "article",
      projectShareImage(project),
    ),
  };
}

export default async function CaseStudy({ params }: Props) {
  const index = findProject((await params).slug);
  if (index < 0) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const label = formatIndex(index + 1);
  const { blocks, minutes } = readCaseStudy(project.slug);
  const facts = [
    ["For", sentenceCase(project.kicker)],
    ["Role", project.role],
    ...(project.period ? [["When", project.period]] : []),
    ...(project.duration ? [["Build time", project.duration]] : []),
    ["Built with", project.construction],
    ["Reading", `${minutes} min`],
  ];
  return (
    <PageShell skip="Skip to the case study">
      <JsonLd data={caseStudyStructuredData(project)} />
      <article className={styles.study} aria-labelledby="study-title">
        <header className={styles.head}>
          <div>
            <Kicker>{`Case study ${label} / ${project.title}`}</Kicker>
            <h1 id="study-title">{project.headline}</h1>
            <p className={styles.summary}>{project.summary}</p>
            <p className={section.proof}>{project.proof}</p>
          </div>
          <div>
            <dl className={section.facts}>
              {facts.map(([term, detail]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
            </dl>
            {project.demo && (
              <a className={section.link} href={project.demo.href}>
                {`${project.demo.label} ↗`}
              </a>
            )}
          </div>
        </header>
        <div className={styles.visuals}>
          {project.visuals.map((visual, order) => (
            <ProjectPlate
              key={visual.title}
              id={`${project.slug}-${order}`}
              visual={visual}
              label={label}
            />
          ))}
        </div>
        <div className={styles.prose}>
          <Prose blocks={blocks} />
        </div>
      </article>
      <nav className={styles.onward} aria-label="More work" data-telemetry-end>
        <PageLink href="/#work">← All work</PageLink>
        <PageLink href={caseStudyPath(next.slug)}>
          <span className={styles.nextLabel}>Next case study</span>
          {`${next.title} →`}
        </PageLink>
      </nav>
      <Contact />
    </PageShell>
  );
}
