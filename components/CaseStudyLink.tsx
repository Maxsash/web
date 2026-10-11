import { caseStudyPath, type Project } from "@/content/projects";
import PageLink from "./PageLink";
import section from "./Section.module.css";

export default function CaseStudyLink({ project }: { project: Project }) {
  return (
    <PageLink className={section.link} href={caseStudyPath(project.slug)}>
      Read the case study<span className="visually-hidden"> of {project.title}</span>
      {" →"}
    </PageLink>
  );
}
