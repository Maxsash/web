import Mark from "./Mark";
import { WAVE_BANDS, type WaveBandName } from "./wave-paths";
import styles from "./Sea.module.css";

/* The hero is a section through a shoreline: sky, two ranks of open water, the
 * boat, the near swell, then the beach the rest of the page sits on.
 *
 * Each band gets two nested elements on purpose.  The outer one heaves
 * vertically, the inner one drifts sideways, and because the two periods are
 * unrelated the pair never lines up the same way twice within a visit — a
 * single transform on one element would read as a sliding sheet.
 */

/* `foam` is the same body shifted up in user units: the band of foam colour
 * that peeks out above the water is exactly that offset thick, and it follows
 * the surface perfectly because it is the surface. */
function Band({ name, foam = 0 }: { name: WaveBandName; foam?: number }) {
  const band = WAVE_BANDS[name];
  const [, , width, height] = band.viewBox.split(" ").map(Number);
  return (
    <div className={`${styles.band} ${styles[name]}`}>
      <div className={styles.drift}>
        <svg
          viewBox={band.viewBox}
          preserveAspectRatio="none"
          style={{ height: `calc(var(--wave-span) * ${height / width})` }}
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
        >
          {foam ? (
            <path className={styles.foam} d={band.body} transform={`translate(0 ${-foam})`} />
          ) : null}
          <path className={styles.body} d={band.body} />
        </svg>
      </div>
    </div>
  );
}

export default function Sea() {
  return (
    <div className={styles.sea} aria-hidden="true">
      <div className={styles.sky} />
      <div className={styles.sun} />

      <Band name="far" />
      <Band name="mid" foam={5} />

      <div className={styles.boat}>
        <Mark className={styles.mark} />
      </div>

      <Band name="near" foam={7} />
      <Band name="shore" />
    </div>
  );
}
