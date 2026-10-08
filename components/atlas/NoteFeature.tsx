import type { ReactNode } from "react";
import NotebookLink from "@/components/NotebookLink";
import styles from "./Atlas.module.css";

type Props = {
  variant: "light" | "dark";
  id: string;
  overline: ReactNode;
  headline: ReactNode;
  blurb: string;
  href: string;
  linkLabel: string;
  meta: string;
  plate: ReactNode;
  plateCaption: [string, string];
  plateTop?: [string, string];
  decoration?: ReactNode;
};

export default function NoteFeature({
  variant,
  id,
  overline,
  headline,
  blurb,
  href,
  linkLabel,
  meta,
  plate,
  plateCaption,
  plateTop,
  decoration,
}: Props) {
  const dark = variant === "dark";
  const copy = (
    <div className={dark ? styles.darkCopy : styles.featureCopy}>
      <p className={styles.overline}>{overline}</p>
      {decoration}
      <h2 id={id}>{headline}</h2>
      <p>{blurb}</p>
      <NotebookLink className={styles.readLink} href={href}>
        {linkLabel} <span aria-hidden="true">↗</span>
      </NotebookLink>
      <span className={styles.sampleLabel}>{meta}</span>
    </div>
  );
  const art = (
    <>
      {plateTop ? (
        <div className={styles.plateTop}>
          <span>{plateTop[0]}</span>
          <span>{plateTop[1]}</span>
        </div>
      ) : null}
      {plate}
      <p className={styles.plateCaption}>
        <span>{plateCaption[0]}</span>
        <span>{plateCaption[1]}</span>
      </p>
    </>
  );
  return dark ? (
    <section className={styles.darkFeature} aria-labelledby={id}>
      {copy}
      <div className={styles.darkPlate}>{art}</div>
    </section>
  ) : (
    <section className={styles.feature} aria-labelledby={id}>
      <div className={styles.featurePlate}>{art}</div>
      {copy}
    </section>
  );
}
