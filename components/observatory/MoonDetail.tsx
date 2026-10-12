"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { MoonSurfaceRequest } from "./moon-detail";
import { moonForIndiaDay } from "./moon-phase";
import styles from "./Observatory.module.css";

const SIZE = 512;
const MAP = "/moon-lroc-2k-near-side.jpg";

export default function MoonDetail({ day, onDrawn }: { day: number; onDrawn: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shownDay, setShownDay] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const drawn = useEffectEvent(onDrawn);

  useEffect(() => {
    const download = new AbortController();
    const worker = new Worker(new URL("./moon-detail.worker.ts", import.meta.url));
    const stop = () => {
      download.abort();
      worker.terminate();
    };
    worker.addEventListener(
      "message",
      ({ data }: MessageEvent<Uint8ClampedArray<ArrayBuffer> | null>) => {
        worker.terminate();
        const context = canvasRef.current?.getContext("2d");
        if (!data || !context) return setFailed(true);
        context.putImageData(new ImageData(data, SIZE, SIZE), 0, 0);
        setShownDay(day);
        drawn();
      },
    );
    worker.addEventListener("error", () => {
      stop();
      setFailed(true);
    });
    fetch(MAP, { signal: download.signal, priority: "low" })
      .then((response) => {
        if (!response.ok) throw new Error("Lunar map unavailable");
        return response.blob();
      })
      .then((map) => {
        const request: MoonSurfaceRequest = { map, phase: moonForIndiaDay(day), size: SIZE };
        worker.postMessage(request);
      })
      .catch(() => {
        if (download.signal.aborted) return;
        worker.terminate();
        setFailed(true);
      });
    return stop;
  }, [day]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.moonDetailDisc}
      width={SIZE}
      height={SIZE}
      data-moon-detail={shownDay !== null ? "shown" : failed ? "unavailable" : "loading"}
      data-moon-detail-day={shownDay ?? undefined}
      aria-hidden="true"
    />
  );
}
