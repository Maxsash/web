"use client";

import { toggleTheme } from "./theme";
import { useStudioTheme } from "./useStudioTheme";
import styles from "./ThemeControl.module.css";

export default function ThemeControl() {
  const night = useStudioTheme();
  return (
    <button
      className={styles.toggle}
      type="button"
      data-theme-toggle
      data-press="none"
      onClick={() => toggleTheme()}
    >
      <span aria-hidden="true">{night ? "☾" : "☀"}</span>
      <span>
        {night ? "Night sea" : "Day sea"}
        <span className="visually-hidden">{night ? ": switch to day" : ": switch to night"}</span>
      </span>
    </button>
  );
}
