"use client";

import { useLinkStatus } from "next/link";
import { createPortal } from "react-dom";
import styles from "./NavigationStatus.module.css";

export default function NavigationStatus() {
  const { pending } = useLinkStatus();
  if (!pending) return null;

  return createPortal(
    <span className={styles.status} role="status" aria-live="polite" aria-atomic="true">
      <span className={styles.spinner} aria-hidden="true" />
      Opening page…
    </span>,
    document.body,
  );
}
