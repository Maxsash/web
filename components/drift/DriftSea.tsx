"use client";

import { useEffect, useRef } from "react";
import { renderRatio } from "../observatory/frame-governor";
import type { DriftSceneName } from "./scenes";
import styles from "./Drift.module.css";

const LONGEST_STEP = 0.05;

export default function DriftSea({ scene }: { scene: DriftSceneName }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = canvas?.parentElement;
    if (!canvas || !frame) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    const compact = matchMedia("(pointer: coarse)").matches || frame.clientWidth < 760;
    const events = new AbortController();
    let engine: ReturnType<typeof import("./drift-engine").createDriftEngine> | undefined;
    let request = 0,
      last = 0,
      elapsed = 0,
      visible = true,
      disposed = false;
    const render = (now: number) => {
      request = 0;
      if (!engine || disposed) return;
      const moving = visible && !document.hidden && !still.matches;
      if (moving && last) elapsed += Math.min((now - last) / 1000, LONGEST_STEP);
      last = moving ? now : 0;
      engine.draw(elapsed);
      frame.dataset.rendering = "webgl2";
      if (moving) request = requestAnimationFrame(render);
    };
    const wake = () => {
      if (!request && !disposed) request = requestAnimationFrame(render);
    };
    const resize = () => {
      const width = frame.clientWidth,
        height = frame.clientHeight;
      engine?.resize(
        width,
        height,
        renderRatio({ devicePixelRatio, compact, width, height, low: false }),
      );
      wake();
    };
    const fallBack = () => {
      cancelAnimationFrame(request);
      request = 0;
      engine?.dispose();
      engine = undefined;
      frame.dataset.rendering = "fallback";
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(frame);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    intersection.observe(frame);
    document.addEventListener("visibilitychange", wake, { signal: events.signal });
    still.addEventListener("change", wake, { signal: events.signal });
    canvas.addEventListener(
      "webglcontextlost",
      (event) => {
        event.preventDefault();
        fallBack();
      },
      { signal: events.signal },
    );
    import("./drift-engine")
      .then(({ createDriftEngine }) => {
        if (disposed) return;
        engine = createDriftEngine(canvas, scene, compact);
        resize();
      })
      .catch((error) => {
        if (disposed) return;
        fallBack();
        console.warn("The sea is using its static field plate.", error);
      });
    return () => {
      disposed = true;
      events.abort();
      cancelAnimationFrame(request);
      resizeObserver.disconnect();
      intersection.disconnect();
      engine?.dispose();
    };
  }, [scene]);
  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
