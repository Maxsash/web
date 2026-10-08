import NotebookLink from "@/components/NotebookLink";
import { notebook } from "@/content/notebook";
import styles from "./observatory/Observatory.module.css";

export default function NotebookSection() {
  return (
    <section id="notebook" className={styles.publication} aria-labelledby="notebook-title">
      <div className={styles.publicationTop}>
        <span>The navigator’s notebook</span>
        <span>Observations & constructions</span>
      </div>
      <div className={styles.publicationBody}>
        <div>
          <h2 id="notebook-title">
            For the <br />
            <em>curious mind.</em>
          </h2>
          <p>The drawings. The small discoveries. The arithmetic beneath the surface.</p>
          <NotebookLink className={styles.textLink} href="/blog">
            Open the notebook <span aria-hidden="true">↗</span>
          </NotebookLink>
        </div>
        <ul className={styles.entries} aria-label="From the notebook">
          {notebook.map((post) => (
            <li key={post.slug}>
              <NotebookLink href={`/blog/${post.slug}`}>
                <span>
                  Field note {post.number} · {post.topic}
                </span>
                <strong>{post.title}</strong>
                <span>Sample essay · {post.minutes} min read</span>
              </NotebookLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
