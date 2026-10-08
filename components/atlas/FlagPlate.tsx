import type { SeaEdition } from "@/lib/sea/types";
import styles from "./Atlas.module.css";
import { surfaceLines } from "./surface";

const SWELL = 2.6;
const calmAcross = (across: number) => SWELL * Math.min(1, Math.max(0, 0.5 - across / 1.5));

export default function FlagPlate({ edition }: { edition: SeaEdition }) {
  const { rows, columns, section } = surfaceLines(edition, calmAcross);
  return (
    <svg
      className={styles.oceanPlate}
      viewBox="0 0 800 500"
      role="img"
      aria-label="An engraved perspective drawing of a sea that is rough on the left and goes flat on the right, split by a dashed line marked as the flag"
    >
      <g className={styles.plateFrame}>
        <path d="M32 46h27M45 33v27M741 454h27M754 441v27M45 454H755" />
        <path d="M400 80V453" strokeDasharray="2 5" />
      </g>
      <g className={styles.surfaceLines}>
        {rows.map((points, i) => (
          <polyline
            key={`r${i}`}
            points={points}
            className={i % 10 === 0 ? styles.surfaceMajor : undefined}
          />
        ))}
        {columns.map((points, i) => (
          <polyline key={`c${i}`} points={points} className={styles.surfaceCross} />
        ))}
      </g>
      <polyline points={section} className={styles.plateAccent} />
      <g className={styles.plateNotation}>
        <text x="59" y="51">
          h(x,z,t)
        </text>
        <text x="270" y="437" textAnchor="middle">
          WITH A GPU
        </text>
        <text x="530" y="437" textAnchor="middle">
          WITHOUT ONE
        </text>
        <text x="402" y="483" textAnchor="middle">
          A SEA THAT GIVES UP GRACEFULLY
        </text>
      </g>
      <path d="M400 96h112" className={styles.plateAccent} />
      <text x="516" y="99" className={`${styles.plateNotation} ${styles.plateRedNotation}`}>
        failIfMajorPerformanceCaveat
      </text>
    </svg>
  );
}
