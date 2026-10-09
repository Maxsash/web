"use client";

import { useSyncExternalStore } from "react";
import { currentNotice, subscribeNotice } from "./announce";
import styles from "./Feedback.module.css";

export default function Announcer() {
  const notice = useSyncExternalStore(subscribeNotice, currentNotice, () => "");
  return (
    <p className={styles.notice} role="status" data-feedback-notice>
      {notice}
    </p>
  );
}
