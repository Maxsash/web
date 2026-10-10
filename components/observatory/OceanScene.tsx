"use client";

import { useEffect, useRef, useState } from "react";
import { playCue, respond } from "@/components/feedback/respond";
import { soundsRunning } from "@/components/sound/sound";
import { createTicker } from "@/components/sound/ticker";
import { site } from "@/content/site";
import { FEEDBACK } from "@/lib/feedback/vocabulary";
import { ratchet } from "@/lib/sound/dial";
import type { SeaEdition } from "@/lib/sea/types";
import { clamp01 } from "./clamp";
import {
  FrameGovernor,
  LOW_QUALITY_RATIO,
  holdsFrame,
  qualityLabel,
  renderRatio,
  scheduleNextDraw,
} from "./frame-governor";
import { layerOpacities } from "./layer-opacity";
import { chapterFor, revealFor } from "./reveal-mapping";
import { easePace, paceTarget } from "./sea-pace";
import { STAGES, planMove, progressAt, stepStage, type StageMove } from "./stage-director";
import { beginGesture, swipeDirection, trackGesture, type TouchGesture } from "./touch-stages";
import styles from "./Observatory.module.css";

const INK_STEPS = 60;

export default function OceanScene({ edition }: { edition: SeaEdition }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pauseRef = useRef<(() => boolean) | null>(null);
  const stageRef = useRef<((direction: number) => void) | null>(null);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = canvas?.closest<HTMLElement>("[data-observatory]");
    const stage = canvas?.parentElement;
    if (!canvas || !scene || !stage) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const compact = matchMedia("(pointer: coarse)").matches || stage.clientWidth < 760;
    const staged = matchMedia("(pointer: coarse)").matches;
    let stageIndex = 0,
      stageProgress = 0,
      stageMove: StageMove | null = null;
    if (staged) scene.dataset.staged = "true";
    const events = new AbortController();
    let engine: Awaited<ReturnType<typeof import("./ocean-engine").createOceanEngine>> | undefined;
    let frame = 0,
      visible = true,
      stopped = false,
      disposed = false,
      presented = false,
      lastTime = 0,
      elapsed = 0;
    let start = 0,
      distance = 1,
      progress = 0,
      width = 1,
      height = 1,
      ratio = 1;
    let pointer: [number, number] = [0, 0],
      target: [number, number] = [0, 0];
    const governor = new FrameGovernor();
    let scrollDirty = true,
      lastScrollY = -1;
    let nextDraw = 0;
    let pace = 1,
      paceScrollY = window.scrollY,
      inked: number | null = null;
    const inkTick = createTicker((at) => playCue("nib", FEEDBACK.draw, at));
    const ink = (reveal: number) => {
      if (!soundsRunning()) {
        inked = null;
        return;
      }
      const step = ratchet(inked, reveal * INK_STEPS);
      inked = step.detent;
      inkTick(step.clicks);
    };
    const opacityGroups = [
      [styles.intro, styles.shade, styles.sceneMeta],
      [styles.end],
      [styles.paperVeil],
    ].map((classes) =>
      classes.flatMap((name) => Array.from(scene.querySelectorAll<HTMLElement>(`.${name}`))),
    );
    const lastOpacity = opacityGroups.map(() => -1);
    const updateScroll = () => {
      lastScrollY = window.scrollY;
      scrollDirty = false;
      progress = staged ? stageProgress : clamp01((lastScrollY - start) / distance);
      layerOpacities(progress).forEach((opacity, i) => {
        if (opacity === lastOpacity[i]) return;
        lastOpacity[i] = opacity;
        opacityGroups[i].forEach((element) => {
          element.style.opacity = String(opacity);
        });
      });
      const chapter = chapterFor(progress);
      if (scene.dataset.chapter !== chapter) scene.dataset.chapter = chapter;
    };
    const render = (now: number) => {
      frame = 0;
      if (disposed) return;
      if (stageMove) {
        const step = progressAt(stageMove, now, media.matches);
        stageProgress = step.progress;
        scrollDirty = true;
        if (step.finished) stageMove = null;
      }
      const active = visible && !document.hidden && !stopped && !media.matches;
      const scrollChanged = scrollDirty || window.scrollY !== lastScrollY;
      if (engine && active && !scrollChanged && holdsFrame(nextDraw, now)) {
        frame = requestAnimationFrame(render);
        return;
      }
      if (scrollChanged) updateScroll();
      if (!engine || !visible || document.hidden) {
        if (stageMove && visible && !document.hidden) frame = requestAnimationFrame(render);
        return;
      }
      const interval = lastTime ? (now - lastTime) / 1000 : 0;
      const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
      const travelled = Math.abs(window.scrollY - paceScrollY) / Math.max(1, height);
      paceScrollY = window.scrollY;
      const idle = Number(document.documentElement.dataset.idle ?? 0);
      pace = easePace(pace, paceTarget(idle, delta ? travelled / delta : 0), delta);
      if (active) elapsed += delta * pace;
      lastTime = active ? now : 0;
      const damping = 1 - Math.exp(-delta * 4);
      pointer = media.matches
        ? [0, 0]
        : [
            pointer[0] + (target[0] - pointer[0]) * damping,
            pointer[1] + (target[1] - pointer[1]) * damping,
          ];
      const reveal = revealFor(progress, { reducedMotion: media.matches, staged });
      ink(reveal);
      engine.draw(
        elapsed,
        reveal,
        pointer,
        document.documentElement.dataset.studioTheme === "night" ? 1 : 0,
      );
      nextDraw = scheduleNextDraw(nextDraw, now, { active, scrollChanged, low: governor.low });
      if (!presented) {
        presented = true;
        canvas.dataset.renderer = "webgl2";
        scene.dataset.rendering = "webgl2";
        setReady(true);
      }
      canvas.dataset.quality = qualityLabel({
        reducedMotion: media.matches,
        low: governor.low,
        compact,
      });
      if (active) {
        if (governor.observe(now, interval)) {
          ratio *= LOW_QUALITY_RATIO;
          engine.resize(width, height, ratio);
        }
        frame = requestAnimationFrame(render);
      } else if (stageMove) frame = requestAnimationFrame(render);
    };
    const requestFrame = () => {
      if (!frame && !disposed) frame = requestAnimationFrame(render);
    };
    const restart = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      nextDraw = 0;
      requestFrame();
    };
    const updateStageControls = () => {
      scene.dataset.stage = String(stageIndex);
      setActiveStage(stageIndex);
    };
    stageRef.current = (direction) => {
      if (!staged) return;
      if (direction > 0 && stageIndex === STAGES.length - 1) {
        document
          .getElementById(site.afterHero.id)
          ?.scrollIntoView({ behavior: media.matches ? "instant" : "smooth" });
        return;
      }
      window.scrollTo({ top: start, behavior: "instant" });
      const previousIndex = stageIndex;
      stageIndex = stepStage(stageIndex, direction);
      const move = planMove(previousIndex, stageIndex, stageProgress, performance.now());
      stageMove = media.matches ? null : move;
      if (media.matches) stageProgress = move.target;
      scrollDirty = true;
      updateStageControls();
      requestFrame();
    };
    if (staged) {
      updateStageControls();
      let touch: TouchGesture | null = null;
      scene.addEventListener(
        "touchstart",
        (event) => {
          if (
            window.scrollY > start + height / 2 ||
            event.touches.length !== 1 ||
            (event.target instanceof Element &&
              event.target.closest("a,button,input,textarea,select"))
          ) {
            touch = null;
            return;
          }
          const point = event.touches[0];
          touch = beginGesture(point.clientX, point.clientY);
        },
        { passive: true, signal: events.signal },
      );
      scene.addEventListener(
        "touchmove",
        (event) => {
          if (!touch || event.touches.length !== 1) {
            touch = null;
            return;
          }
          const { clientX, clientY } = event.touches[0];
          const wantsStage = trackGesture(touch, clientX, clientY, {
            index: stageIndex,
            count: STAGES.length,
          });
          if (wantsStage && event.cancelable) {
            event.preventDefault();
            touch.consumed = true;
          }
        },
        { passive: false, signal: events.signal },
      );
      scene.addEventListener(
        "touchend",
        () => {
          const direction = touch ? swipeDirection(touch) : 0;
          if (direction) {
            respond("swipe");
            stageRef.current?.(direction);
          }
          touch = null;
        },
        { passive: true, signal: events.signal },
      );
      scene.addEventListener(
        "touchcancel",
        () => {
          touch = null;
        },
        { passive: true, signal: events.signal },
      );
    }
    const resize = () => {
      const bounds = scene.getBoundingClientRect();
      start = bounds.top + scrollY;
      width = stage.clientWidth;
      height = stage.clientHeight;
      distance = Math.max(1, scene.offsetHeight - height);
      ratio = renderRatio({ devicePixelRatio, compact, width, height, low: governor.low });
      const origin = stage.getBoundingClientRect();
      const readCopy = (selector: string) => {
        const copy = { right: 0, bottom: 0 };
        const root = scene.querySelector(selector);
        if (root) {
          const text = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          const range = document.createRange();
          while (text.nextNode()) {
            range.selectNodeContents(text.currentNode);
            for (const rect of range.getClientRects()) {
              copy.right = Math.max(copy.right, rect.right - origin.left);
              copy.bottom = Math.max(copy.bottom, rect.bottom - origin.top);
            }
          }
        }
        return copy;
      };
      const readReserved = (names: string[]) =>
        names.flatMap((name) => {
          const element = scene.querySelector("." + name);
          if (!element) return [];
          const box = element.getBoundingClientRect();
          if (!box.width || !box.height) return [];
          return [
            {
              left: box.left - origin.left,
              right: box.right - origin.left,
              top: box.top - origin.top,
              bottom: box.bottom - origin.top,
            },
          ];
        });
      const controls = [styles.pause, styles.stageControls, styles.chapterRail];
      engine?.resize(width, height, ratio, {
        width,
        height,
        copy: readCopy("." + styles.intro),
        drawing: readCopy("." + styles.end),
        reserved: readReserved([...controls, styles.sceneMeta]),
        drawingReserved: readReserved(controls),
      });
      scrollDirty = true;
      requestFrame();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resizeObserver.observe(scene);
    for (const name of [styles.intro, styles.end]) {
      const copy = scene.querySelector("." + name);
      if (copy) resizeObserver.observe(copy);
    }
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      restart();
    });
    intersection.observe(scene);
    window.addEventListener(
      "scroll",
      () => {
        scrollDirty = true;
        requestFrame();
      },
      { passive: true, signal: events.signal },
    );
    scene.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse" || media.matches) return;
        target = [(event.clientX / width - 0.5) * 2, (event.clientY / height - 0.5) * 2];
      },
      { passive: true, signal: events.signal },
    );
    scene.addEventListener(
      "pointerdown",
      (event) => {
        if (!engine || stopped || media.matches) return;
        if (event.target instanceof Element && event.target.closest("a,button,input")) return;
        const bounds = canvas.getBoundingClientRect();
        const ndc: [number, number] = [
          ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
          1 - ((event.clientY - bounds.top) / bounds.height) * 2,
        ];
        if (engine.ripple(ndc, elapsed)) respond("drop");
      },
      { passive: true, signal: events.signal },
    );
    scene.addEventListener(
      "pointerleave",
      () => {
        target = [0, 0];
      },
      { signal: events.signal },
    );
    window.addEventListener(
      "studio-theme",
      () => {
        scrollDirty = true;
        requestFrame();
      },
      { signal: events.signal },
    );
    document.addEventListener("visibilitychange", restart, { signal: events.signal });
    media.addEventListener("change", restart, { signal: events.signal });
    canvas.addEventListener(
      "webglcontextlost",
      (event) => {
        event.preventDefault();
        cancelAnimationFrame(frame);
        frame = 0;
        engine?.dispose();
        engine = undefined;
        canvas.dataset.renderer = "fallback";
        scene.dataset.rendering = "fallback";
        setReady(false);
      },
      { signal: events.signal },
    );
    pauseRef.current = () => {
      stopped = !stopped;
      if (stopped) scene.dataset.still = "";
      else delete scene.dataset.still;
      restart();
      return stopped;
    };
    resize();
    import("./ocean-engine")
      .then(({ createOceanEngine }) => {
        if (disposed) return;
        try {
          engine = createOceanEngine(canvas, edition, compact);
          resize();
          cancelAnimationFrame(frame);
          frame = 0;
          render(performance.now());
        } catch (error) {
          canvas.dataset.renderer = "fallback";
          scene.dataset.rendering = "fallback";
          console.warn("The sea is using its static field plate.", error);
        }
      })
      .catch(() => {
        if (disposed) return;
        canvas.dataset.renderer = "fallback";
        scene.dataset.rendering = "fallback";
      });
    return () => {
      disposed = true;
      events.abort();
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      engine?.dispose();
      pauseRef.current = null;
      stageRef.current = null;
      delete scene.dataset.staged;
      delete scene.dataset.stage;
      delete scene.dataset.still;
    };
  }, [edition]);
  return (
    <>
      <canvas ref={canvasRef} className={styles.canvas} data-ocean aria-hidden="true" />
      <button
        className={styles.pause}
        type="button"
        data-hero-pause
        data-press="none"
        disabled={!ready}
        onClick={() => {
          const stilled = pauseRef.current?.() ?? false;
          respond(stilled ? "still" : "stir");
          setPaused(stilled);
        }}
      >
        <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>{" "}
        {paused ? "Resume the sea" : "Still the sea"}
      </button>
      <div className={styles.stageControls} data-stage-controls>
        <button
          type="button"
          data-stage-previous
          disabled={activeStage === 0}
          aria-label="Previous sea stage"
          onClick={() => stageRef.current?.(-1)}
        >
          ↓ Back
        </button>
        <span data-stage-label role="status" aria-live="polite" aria-atomic="true">
          {activeStage + 1} / {STAGES.length} · {STAGES[activeStage].label}
        </span>
        <button
          type="button"
          data-stage-next
          aria-label={`Next sea stage or view ${site.afterHero.label}`}
          onClick={() => stageRef.current?.(1)}
        >
          {activeStage === STAGES.length - 1 ? `View ${site.afterHero.label} ↓` : "Next ↑"}
        </button>
      </div>
    </>
  );
}
