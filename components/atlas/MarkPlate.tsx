import Mark from "@/components/Mark";
import styles from "./Atlas.module.css";

/** Construction rails are annotations; the three filled master paths are unchanged. */
export default function MarkPlate({ detail = false }: { detail?: boolean }) {
  return (
    <div className={`${styles.markPlate} ${detail ? styles.markDetail : ""}`}>
      <svg className={styles.markRails} viewBox="0 0 660 630" aria-hidden="true">
        <circle cx="326" cy="302" r="214" />
        <circle cx="326" cy="302" r="180" strokeDasharray="2 7" />
        <path d="M50 302H602M326 30V585M108 540H563M174 470 554 397M365 61 290 540" />
        <path d="M126 92h25m-12-12v25M526 530h25m-12-12v25" />
        <path d="M386 138H580M242 430H72M495 465H595" strokeDasharray="3 5" />
        <circle cx="386" cy="138" r="5" />
        <circle cx="242" cy="430" r="5" />
        <circle cx="495" cy="465" r="5" />
      </svg>
      <Mark
        className={styles.masterMark}
        title="The original studio mark: an integral mast, a sail, and a hull"
      />
      <span className={styles.markTop}>I / spine</span>
      <span className={styles.markSide}>II / sail</span>
      <span className={styles.markBottom}>III / hull</span>
      <span className={styles.markScale}>Original master outlines</span>
    </div>
  );
}
