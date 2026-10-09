import { FACE_RADIUS, MEDAL, legendArc, tickMarks } from "./medal";
import styles from "./Portrait.module.css";

const centre = MEDAL / 2;

export default function Bezel({ top, bottom }: { top: string; bottom: string }) {
  return (
    <svg className={styles.bezel} viewBox={`0 0 ${MEDAL} ${MEDAL}`} aria-hidden="true">
      <defs>
        <path id="medal-legend-top" d={legendArc(232, true)} />
        <path id="medal-legend-bottom" d={legendArc(244, false)} />
      </defs>
      <circle cx={centre} cy={centre} r={FACE_RADIUS + 6} />
      <g className={styles.card}>
        <path d={tickMarks(FACE_RADIUS + 10, FACE_RADIUS + 16, FACE_RADIUS + 23)} />
        <circle cx={centre} cy={centre} r={FACE_RADIUS + 27} strokeDasharray="1 8" />
      </g>
      <circle cx={centre} cy={centre} r={MEDAL / 2 - 4} />
      <text className={styles.legend}>
        <textPath href="#medal-legend-top" startOffset="50%" textAnchor="middle">
          {top.toUpperCase()}
        </textPath>
      </text>
      <text className={styles.legend}>
        <textPath href="#medal-legend-bottom" startOffset="50%" textAnchor="middle">
          {bottom.toUpperCase()}
        </textPath>
      </text>
    </svg>
  );
}
