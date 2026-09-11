"use client";

import { useEffect, useRef } from "react";
import styles from "./Sea.module.css";

/** Follow the rendered water, including its CSS drift, heave and responsive
 * scaling. Keep React out of the animation loop and stop work offscreen. */
export default function SeaMotion() {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const scene = marker.current?.parentElement;
    const boat = scene?.querySelector<HTMLElement>(`.${styles.boat}`);
    const wave = scene?.querySelector<SVGSVGElement>(`.${styles.near} svg`);
    const hull = boat?.querySelector<SVGPathElement>("path:last-child");
    const mark = boat?.querySelector("svg");
    if (!scene || !boat || !wave || !hull || !mark) return;

    // Strip only the closing straight sides; sample the exact emitted surface.
    const surface = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const body = wave.querySelector("path:last-child")?.getAttribute("d");
    if (!body) return;
    surface.setAttribute("d", body.split("L")[0]);
    const length = surface.getTotalLength();
    const points = Array.from({ length: 2049 }, (_, i) =>
      surface.getPointAtLength((length * i) / 2048),
    );
    const heightAt = (x: number) => {
      let lo = 0;
      let hi = points.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (points[mid].x < x) lo = mid;
        else hi = mid;
      }
      const a = points[lo];
      const b = points[hi];
      const progress = Math.max(0, Math.min(1, (x - a.x) / (b.x - a.x)));
      return a.y + (b.y - a.y) * progress;
    };

    // Anchor at the middle of the keel, derived from the generated artwork.
    const box = hull.getBBox();
    const matrix = hull.closest("g")?.transform.baseVal.consolidate()?.matrix;
    if (!matrix) return;
    const local = new DOMPoint(box.x + box.width / 2, box.y).matrixTransform(matrix);
    const anchorX = local.x / mark.viewBox.baseVal.width;
    const anchorY = local.y / mark.viewBox.baseVal.height;
    boat.style.transformOrigin = `${anchorX * 100}% ${anchorY * 100}%`;

    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = true;
    const place = () => {
      const m = wave.getScreenCTM();
      if (!m) return;
      const sceneBounds = scene.getBoundingClientRect();
      const width = boat.offsetWidth;
      const x = sceneBounds.left + boat.offsetLeft + width * anchorX;
      const yAt = (screenX: number) => {
        const p = new DOMPoint(screenX, 0).matrixTransform(m.inverse());
        return new DOMPoint(p.x, heightAt(p.x)).matrixTransform(m).y;
      };
      const water = yAt(x);
      // Only a little pitch: the keel bridges small ripples rather than
      // following each sharp crest. Two percent immersion seats it in foam.
      const slope =
        (yAt(x + width * 0.22) - yAt(x - width * 0.22)) / (width * 0.44);
      const pitch = motion.matches
        ? 0
        : Math.max(-2.4, Math.min(2.4, (Math.atan(slope) * 180 * 0.45) / Math.PI));
      const floatY =
        water - sceneBounds.top - boat.offsetTop - width * anchorY + width * 0.02;
      boat.style.setProperty("--float-y", `${floatY}px`);
      boat.style.setProperty("--pitch", `${pitch}deg`);
      boat.dataset.floating = "true";
    };
    const tick = () => {
      place();
      if (visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(tick);
    };
    const restart = () => {
      cancelAnimationFrame(frame);
      tick();
    };
    const resize = new ResizeObserver(restart);
    resize.observe(scene);
    resize.observe(boat);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      restart();
    });
    intersection.observe(scene);
    motion.addEventListener("change", restart);
    document.addEventListener("visibilitychange", restart);
    restart();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      motion.removeEventListener("change", restart);
      document.removeEventListener("visibilitychange", restart);
      delete boat.dataset.floating;
      boat.style.removeProperty("--float-y");
      boat.style.removeProperty("--pitch");
      boat.style.removeProperty("transform-origin");
    };
  }, []);
  return <span ref={marker} hidden />;
}
