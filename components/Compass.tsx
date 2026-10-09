"use client";

import { type CSSProperties, useRef } from "react";
import { useDialSound } from "@/components/sound/useDialSound";
import styles from "./observatory/Observatory.module.css";

const TURN = 60;
const turning = { "--turn": `${TURN}deg` } as CSSProperties;

export default function Compass() {
  const dial = useRef<SVGSVGElement>(null);
  useDialSound(dial, TURN);
  return (
    <svg
      ref={dial}
      className={styles.compass}
      style={turning}
      viewBox="0 0 240 240"
      aria-hidden="true"
      data-voyage
    >
      <circle cx="120" cy="120" r="92" />
      <circle cx="120" cy="120" r="74" strokeDasharray="1 8" />
      <path d="M120 12v216M12 120h216M54 54l132 132M54 186 186 54" />
      <path className={styles.needle} d="m120 38 18 82-18 82-18-82Z" />
      <circle cx="120" cy="120" r="5" />
    </svg>
  );
}
