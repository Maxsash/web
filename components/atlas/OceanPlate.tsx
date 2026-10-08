import { createSeaEdition } from "@/lib/sea/edition";
import { DEFAULT_SEA_SEED_V2 } from "@/lib/sea/seed";
import type { SeaEdition } from "@/lib/sea/types";
import styles from "./Atlas.module.css";
import { surfaceLines } from "./surface";

export default function OceanPlate({
  variant = "cover",
  edition = createSeaEdition(DEFAULT_SEA_SEED_V2, "2"),
}: {
  variant?: "cover" | "section";
  edition?: SeaEdition;
}) {
  const { rows, columns, section } = surfaceLines(edition);
  return (
    <svg
      className={styles.oceanPlate}
      viewBox="0 0 800 500"
      role="img"
      aria-label={`An engraved perspective drawing of six waves adding to the sea, edition ${edition.seed}`}
    >
      <g className={styles.plateFrame}>
        <path d="M32 46h27M45 33v27M741 454h27M754 441v27M45 454H755" />
        <path d="M55 306 399 453 743 303M400 80V453" strokeDasharray="2 5" />
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
        <text x="745" y="437" textAnchor="end">
          t = 0 s
        </text>
        <text x="402" y="483" textAnchor="middle">
          {variant === "section"
            ? "ONE SECTION THROUGH THE FIELD"
            : "A SURFACE MADE OF RELATIONSHIPS"}
        </text>
      </g>
      <path d="M618 130h105M618 130l-46 52" className={styles.plateAccent} />
      <text
        x="724"
        y="120"
        textAnchor="end"
        className={`${styles.plateNotation} ${styles.plateRedNotation}`}
      >
        SIX SUPERPOSED WAVES
      </text>
    </svg>
  );
}
