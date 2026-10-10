"use client";

import { useEffect, useRef } from "react";
import styles from "./Gull.module.css";
import { visit } from "./visit";

export default function Gull() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    return canvas ? visit(canvas) : undefined;
  }, []);
  return <canvas ref={canvasRef} className={styles.gull} aria-hidden="true" />;
}
