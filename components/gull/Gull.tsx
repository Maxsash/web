"use client";

import { useEffect, useRef } from "react";
import styles from "./Gull.module.css";
import { visit } from "./visit";

export default function Gull() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seatRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current,
      seat = seatRef.current;
    return canvas && seat ? visit(canvas, seat) : undefined;
  }, []);
  return (
    <>
      <canvas ref={canvasRef} className={styles.gull} aria-hidden="true" />
      <span ref={seatRef} className={styles.seat} aria-hidden="true" />
    </>
  );
}
