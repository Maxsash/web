import Compass from "@/components/Compass";
import NotebookLink from "@/components/NotebookLink";
import { latestNotes, noteMeta } from "@/content/posts";
import styles from "./observatory/Observatory.module.css";

const SHOWN = 3;

export default function NotebookSection() {
  return (
    <section id="notebook" className={styles.publication} aria-labelledby="notebook-title">
      <Compass />
      <div className={styles.publicationTop} data-arrive>
        <span>The navigator’s notebook</span>
        <span>Observations & constructions</span>
      </div>
      <div className={styles.publicationBody}>
        <div>
          <h2 id="notebook-title">
            Written <br />
            <em>as I build.</em>
          </h2>
          <p>
            What broke, what I measured and what I learned while building. With a few studies of the
            sea and the studio’s mark.
          </p>
          <NotebookLink className={styles.textLink} href="/blog">
            Open the notebook <span aria-hidden="true">↗</span>
          </NotebookLink>
        </div>
        <ul className={styles.entries} aria-label="From the notebook">
          {latestNotes(SHOWN).map((note) => (
            <li key={note.slug}>
              <NotebookLink href={`/blog/${note.slug}`}>
                <span>
                  Field note {note.number} · {note.topic}
                </span>
                <strong>{note.title}</strong>
                <span>{noteMeta(note.kind, note.minutes)}</span>
              </NotebookLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
