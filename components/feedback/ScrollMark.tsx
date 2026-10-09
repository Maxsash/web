import styles from "./Feedback.module.css";

export default function ScrollMark({ kind }: { kind: "depth" | "ribbon" }) {
  return <div className={styles[kind]} aria-hidden="true" data-scroll-mark />;
}
