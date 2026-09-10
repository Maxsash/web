import Icon from "./Icon";
import { destinations } from "@/content/site";
import styles from "./Sections.module.css";

export default function Elsewhere() {
  return (
    <section id="elsewhere" className={`shell ${styles.section}`}>
      <div className={styles.head}>
        <p className="eyebrow">Elsewhere</p>
        <h2 className={styles.heading}>Every other port</h2>
        <p className={styles.lede}>
          The rest of it lives on other sites. This is the chart.
        </p>
      </div>

      <ul className={styles.ports}>
        {destinations.map((place) => (
          <li key={place.label}>
            <a
              className={styles.port}
              href={place.href}
              {...(place.external
                ? { target: "_blank", rel: "noreferrer noopener" }
                : {})}
            >
              <span className={styles.portIcon}>
                <Icon name={place.icon} size={20} />
              </span>
              <span className={styles.portLabel}>{place.label}</span>
              <span className={styles.portBlurb}>{place.blurb}</span>
              <Icon name="arrow" size={18} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
