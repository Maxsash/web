"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import PageLink from "@/components/PageLink";
import { respond } from "@/components/feedback/respond";
import { MuteControl, WaveSoundControl, Waves } from "@/components/sound/SoundControls";
import ThemeControl from "@/components/observatory/ThemeControl";
import { profiles, site } from "@/content/site";
import { FootTrail } from "./footprints";
import { shorePalette } from "./palette";
import { paintSand } from "./sand";
import { drawSurf, drawWetSand, shorelineAt } from "./tide";
import styles from "./Shore.module.css";

const PIXEL_BUDGET = 420000;
const FRAME_INTERVAL_MS = 32;

export default function Shoreline({
  children,
  version,
  commit,
  seaModel,
}: {
  children: ReactNode;
  version: string;
  commit: string | null;
  seaModel: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pauseRef = useRef<(() => boolean) | null>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    const base = document.createElement("canvas"),
      grain = base.getContext("2d", { alpha: false });
    if (!grain) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false,
      stopped = false,
      frame = 0,
      last = 0,
      time = 0,
      width = 1,
      height = 1,
      night = false;
    const trail = new FootTrail();
    const events = new AbortController();
    const view = () => ({ width, height, time });
    const resize = () => {
      const bounds = canvas.getBoundingClientRect(),
        ratio = Math.min(1, Math.sqrt(PIXEL_BUDGET / Math.max(1, bounds.width * bounds.height)));
      width = Math.max(1, Math.round(bounds.width * ratio));
      height = Math.max(1, Math.round(bounds.height * ratio));
      canvas.width = base.width = width;
      canvas.height = base.height = height;
      night = document.documentElement.dataset.studioTheme === "night";
      paintSand(grain, shorePalette(night), width, height);
      canvas.dataset.shorePixels = String(width * height);
      trail.clear();
      draw();
    };
    const draw = () => {
      const palette = shorePalette(night);
      context.drawImage(base, 0, 0);
      drawWetSand(context, view(), palette);
      trail.fade(time, (x) => shorelineAt(view(), x));
      trail.draw(context, time, palette);
      drawSurf(context, view(), palette);
      canvas.dataset.shoreFrames = String(Number(canvas.dataset.shoreFrames ?? 0) + 1);
      canvas.dataset.shoreSteps = String(trail.steps.length);
    };
    const tick = (now: number) => {
      frame = 0;
      if (!visible || document.hidden || stopped || reduced.matches) return;
      if (now - last >= FRAME_INTERVAL_MS) {
        time += last ? Math.min((now - last) / 1000, 0.06) : 0;
        last = now;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const restart = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      draw();
      if (visible && !document.hidden && !stopped && !reduced.matches)
        frame = requestAnimationFrame(tick);
    };
    pauseRef.current = () => {
      stopped = !stopped;
      restart();
      return stopped;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      restart();
    });
    observer.observe(canvas);
    const size = new ResizeObserver(() => {
      resize();
      restart();
    });
    size.observe(canvas);
    window.addEventListener(
      "studio-theme",
      () => {
        resize();
        restart();
      },
      { signal: events.signal },
    );
    document.addEventListener("visibilitychange", restart, { signal: events.signal });
    reduced.addEventListener("change", restart, { signal: events.signal });
    canvas.parentElement?.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse" || reduced.matches || stopped) return;
        if (event.target instanceof Element && event.target.closest("a,button")) {
          trail.lift();
          return;
        }
        const bounds = canvas.getBoundingClientRect(),
          x = ((event.clientX - bounds.left) / bounds.width) * width,
          y = ((event.clientY - bounds.top) / bounds.height) * height;
        if (y <= shorelineAt(view(), x) + height * 0.07) trail.lift();
        else if (trail.track(x, y, time)) respond("step");
      },
      { passive: true, signal: events.signal },
    );
    canvas.parentElement?.addEventListener("pointerleave", () => trail.lift(), {
      signal: events.signal,
    });
    resize();
    return () => {
      cancelAnimationFrame(frame);
      events.abort();
      observer.disconnect();
      size.disconnect();
      pauseRef.current = null;
    };
  }, []);
  return (
    <footer className={styles.shore} data-shore aria-labelledby="shore-title">
      <Waves />
      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.tools}>
          <ThemeControl />
          <button
            type="button"
            data-shore-pause
            data-press="none"
            onClick={() => {
              const stilled = pauseRef.current?.() ?? false;
              respond(stilled ? "still" : "stir");
              setPaused(stilled);
            }}
          >
            {paused ? "Resume shoreline" : "Pause shoreline"}
          </button>
          <MuteControl />
          <WaveSoundControl />
        </div>
        <div className={styles.folio}>
          <div>
            <p className={styles.overline}>Landfall / Maxsash Studio</p>
            <h2 id="shore-title">
              Back to <br />
              the shore.
            </h2>
            <p className={styles.description}>
              A little sand, a little salt.
              <br />
              The work keeps finding its way here.
            </p>
            <ul className={styles.links} aria-label="Contact and profiles">
              <li>
                <a href={site.links.email}>{site.email}</a>
              </li>
              {profiles.map((profile) => (
                <li key={profile.label}>
                  <a href={profile.href}>{`${profile.label} ↗`}</a>
                </li>
              ))}
            </ul>
            <p className={styles.hint}>Move across the sand. The tide takes the tracks back.</p>
          </div>
          <section className={styles.activity} aria-labelledby="activity-title">
            <div className={styles.activityHead}>
              <div>
                <h3 id="activity-title">From the workbench</h3>
                <p>The log of this very site, as it is built.</p>
              </div>
              <a href={site.links.repo}>{site.repo} ↗</a>
            </div>
            {children}
          </section>
        </div>
        <div className={styles.colophon}>
          <PageLink href="/">Maxsash Studio ↗</PageLink>
          <span>
            Release v{version}
            {commit ? ` · ${commit}` : ""}
          </span>
          <span>Sea model v{seaModel} · WebGL2</span>
          <span>© {new Date().getFullYear()} Yash</span>
        </div>
      </div>
    </footer>
  );
}
