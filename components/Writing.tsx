import Icon from "./Icon";
import { notes, site } from "@/content/site";
import styles from "./Sections.module.css";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function Writing() {
  return (
    <section id="writing" className={`shell ${styles.section}`}>
      <div className={styles.head}>
        <p className="eyebrow">Writing</p>
        <h2 className={styles.heading}>Notes from the workbench</h2>
        <p className={styles.lede}>
          Longer thinking about the things above — what worked, what did not,
          and the arithmetic behind both.
        </p>
      </div>

      <ol className={styles.notes}>
        {notes.map((note) => (
          <li key={note.href + note.title}>
            <a className={styles.note} href={note.href}>
              <time className={styles.noteDate} dateTime={note.date}>
                {dateFormat.format(new Date(note.date))}
              </time>
              <span className={styles.noteTitle}>{note.title}</span>
              <span className={styles.noteBody}>{note.summary}</span>
              <Icon name="arrow" size={18} />
            </a>
          </li>
        ))}
      </ol>

      <a className={styles.more} href={site.links.blog}>
        <Icon name="writing" size={18} />
        All writing
      </a>
    </section>
  );
}
