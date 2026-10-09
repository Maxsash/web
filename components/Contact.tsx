import { site } from "@/content/site";
import styles from "./Contact.module.css";
import section from "./Section.module.css";

export default function Contact() {
  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-heading">
      <div className={styles.panel}>
        <div>
          <p className={section.kicker}>Open to freelance work</p>
          <h2 id="contact-heading" className={styles.title}>
            Something <br />
            <em>to build?</em>
          </h2>
          <p className={styles.note}>
            Write with the idea, who it is for and when you would like it live. A few lines are
            enough to start.
          </p>
        </div>
        <a href={site.links.email} className={styles.email}>
          {site.links.email.slice(7)}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
