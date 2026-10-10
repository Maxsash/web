import type { ReactNode } from "react";
import LazyDriftSea from "./LazyDriftSea";
import type { DriftSceneName } from "./scenes";
import { tornEdge } from "./torn-edge";
import styles from "./Drift.module.css";

const TEAR_SEED = 11;

export type DriftFrameProps = {
  scene: DriftSceneName;
  kicker: string;
  title: string;
  actions: ReactNode;
  children: ReactNode;
  id?: string;
  plate?: ReactNode;
  torn?: boolean;
};

function TornSheet() {
  const edge = tornEdge(TEAR_SEED);
  return (
    <div className={styles.sheet} aria-hidden="true">
      <div className={styles.fibre} style={{ clipPath: edge.fibre }} />
      <div className={styles.face} style={{ clipPath: edge.face }} />
    </div>
  );
}

export default function DriftFrame({
  scene,
  kicker,
  title,
  actions,
  children,
  id,
  plate,
  torn = false,
}: DriftFrameProps) {
  return (
    <main id={id} className={`${styles.page} ${styles[scene]}`}>
      <div className={styles.sea} data-rendering="fallback">
        {plate ? (
          <div className={styles.fallback} aria-hidden="true">
            {plate}
          </div>
        ) : null}
        <LazyDriftSea scene={scene} />
      </div>
      {torn ? <TornSheet /> : null}
      <div className={styles.copy}>
        <p className={styles.kicker}>{kicker}</p>
        <h1>{title}</h1>
        <p className={styles.body}>{children}</p>
        <div className={styles.actions}>{actions}</div>
      </div>
    </main>
  );
}
