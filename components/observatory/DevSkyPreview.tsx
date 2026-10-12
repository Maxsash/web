"use client";

import { useState } from "react";
import { indiaMoonDay, moonForIndiaDay } from "./moon-phase";
import { PHASES, previewDate, previewDay, previewPhaseDay } from "./phase-preview";
import { nightTheme, toggleTheme } from "./theme";
import styles from "./DevSkyPreview.module.css";

export function DevSkyPreview({ onDay }: { onDay: (day: number | null) => void }) {
  const [today] = useState(() => indiaMoonDay(Date.now()));
  const [day, setDay] = useState<number | null>(null);
  const selected = day ?? today;
  const moon = moonForIndiaDay(selected);
  const choose = (next: number | null) => {
    setDay(next);
    onDay(next);
    if (!nightTheme()) toggleTheme("control");
  };
  return (
    <details className={styles.preview} data-dev-sky-preview>
      <summary>Sky preview · dev</summary>
      <div className={styles.body}>
        <label htmlFor="dev-sky-date">Tikamgarh · 9 PM IST</label>
        <input
          id="dev-sky-date"
          type="date"
          min="1800-01-01"
          max="2050-12-31"
          value={previewDate(selected)}
          onChange={(event) => {
            const next = previewDay(event.target.value);
            if (next !== null) choose(next);
          }}
        />
        <div className={styles.phases} aria-label="Preview Moon phase">
          {PHASES.map(([label, cycle]) => (
            <button key={label} type="button" onClick={() => choose(previewPhaseDay(cycle))}>
              {label}
            </button>
          ))}
        </div>
        <p>
          {previewDate(selected)} · {Math.round(moon.illumination * 100)}% lit
        </p>
        <button type="button" onClick={() => choose(null)}>
          Live date
        </button>
      </div>
    </details>
  );
}
