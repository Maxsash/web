import { expectations } from "@/content/contact";
import { site } from "@/content/site";
import { formatIndex } from "@/lib/format";
import CopyButton from "./CopyButton";
import Kicker from "./Kicker";
import styles from "./Contact.module.css";

export default function Contact() {
  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-heading">
      <div className={styles.panel}>
        <div className={styles.ask}>
          <div>
            <Kicker>Open to freelance work</Kicker>
            <h2 id="contact-heading" className={styles.title}>
              Something <br />
              to build?
            </h2>
            <p className={styles.note}>
              Write with the idea, who it is for and when you would like it live. A few lines are
              enough to start.
            </p>
          </div>
          <div className={styles.reach}>
            <a href={site.links.email} className={styles.email}>
              {site.email}
              <span aria-hidden="true">↗</span>
            </a>
            <CopyButton text={site.email} done="Address copied." className={styles.copy}>
              Copy address
            </CopyButton>
          </div>
        </div>
        <Kicker id="expectations">What to expect</Kicker>
        <ol className={styles.steps} aria-labelledby="expectations">
          {expectations.map((step, index) => (
            <li key={step.title}>
              <span className={styles.index}>{formatIndex(index + 1)}</span>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </li>
          ))}
        </ol>
        <p className={styles.aside}>
          Backend or real-time work on its own is welcome too: APIs, event-driven systems, a
          database that has slowed down.
        </p>
      </div>
    </section>
  );
}
