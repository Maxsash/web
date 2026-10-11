import Image from "next/image";
import type { Visual } from "@/content/projects";
import SystemPlate from "./SystemPlate";
import styles from "./Work.module.css";

type Props = { id: string; visual: Visual; label: string };

export default function ProjectPlate({ id, visual, label }: Props) {
  return (
    <figure className={styles.plate} data-hover="slide">
      <div className={styles.plateHead}>
        <span>{`${label} / ${visual.title}`}</span>
        <span>{visual.note}</span>
      </div>
      {visual.kind === "drawing" ? (
        <SystemPlate id={id} drawing={visual.drawing} alt={visual.alt} />
      ) : (
        <>
          <Image
            src={visual.src}
            width={1200}
            height={750}
            sizes="(max-width: 64rem) 92vw, 60rem"
            alt={visual.alt}
          />
          <figcaption className={styles.caption}>{visual.caption}</figcaption>
        </>
      )}
    </figure>
  );
}
