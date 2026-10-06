import Image from "next/image";
import { projects, site } from "@/content/site";
import styles from "./Work.module.css";

export default function Work() {
  const [household,wedding]=projects;
  return <section id="work" className={styles.section} aria-labelledby="work-heading">
    <header className={styles.header}><p className={styles.kicker}>Work</p><h2 id="work-heading">Ideas, made <br /><em>tangible.</em></h2><p>Useful tools. Personal stories. Software made to carry something that matters.</p></header>
    <article className={styles.feature} aria-label={household.title}>
      <figure className={styles.plate}><div className={styles.plateHead}><span>01 / Household insights</span><span>Public demo · {household.year}</span></div><Image src="/images/work/household-insights-light.webp" width={1200} height={750} sizes="(max-width: 768px) 90vw, 52vw" alt="Household Hub public demo in light theme: expense Insights with upcoming household needs." /><figcaption className={styles.caption}>Invented household data. The private family app stays private.</figcaption></figure>
      <div className={styles.description}><p className={styles.kicker}>01 / Everyday operations</p><h3>Household <br /><em>Hub.</em></h3><p className={styles.summary}>A little less remembering.<br />A little more living.</p><p>{household.summary}</p><dl className={styles.facts}><div><dt>Form</dt><dd>Household web app</dd></div><div><dt>Construction</dt><dd>Next.js · Supabase · PostgreSQL</dd></div></dl><div className={styles.links}><a href={household.href}>Try the public demo ↗</a><a href={household.caseStudy}>Read the case study ↗</a></div></div>
    </article>
    <article className={styles.secondary} aria-label={wedding.title}><figure className={styles.weddingPlate}><Image src="/images/work/wedding-platform.webp" width={1200} height={750} sizes="(max-width: 768px) 90vw, 42vw" alt="Wedding platform demo cover with a floral background and placeholder Bride and Groom names." /><figcaption className={styles.caption}>Sample names and dates. Faces hidden in the public demo.</figcaption></figure><div><p className={styles.kicker}>02 / A personal archive</p><h3>A day, kept <br /><em>in chapters.</em></h3><p>{wedding.summary}</p><dl className={styles.facts}><div><dt>Form</dt><dd>Wedding photo platform</dd></div><div><dt>Construction</dt><dd>Next.js · Offline ML · Cloudflare R2</dd></div></dl><div className={styles.links}><a href={wedding.href}>Explore the public demo ↗</a><a href={wedding.caseStudy}>Read the case study ↗</a></div></div></article>
    <div className={styles.footer}><a href={site.links.portfolio}>More work, experience, and background in the Portfolio ↗</a></div>
  </section>;
}
