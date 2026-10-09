"use client";

import Image from "next/image";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { createSeaEdition } from "@/lib/sea/edition";
import { HOME_WATER } from "@/lib/sea/presets";
import { seedFromSettings } from "@/lib/sea/seed";
import Bezel from "./Bezel";
import { PLATE, SHADE_SIZE, engraveRows, shadeFromPixels } from "./engraving";
import { FACE_INSET } from "./medal";
import styles from "./Portrait.module.css";

const homeWater = createSeaEdition(seedFromSettings(HOME_WATER), "2");
const faceInset = { "--face-inset": FACE_INSET } as CSSProperties;

function readShade(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SHADE_SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(image, 0, 0, SHADE_SIZE, SHADE_SIZE);
  return shadeFromPixels(context.getImageData(0, 0, SHADE_SIZE, SHADE_SIZE).data, SHADE_SIZE);
}

type Props = {
  src: string;
  alt: string;
  size: number;
  sizes: string;
  legend: { top: string; bottom: string };
};

export default function Portrait({ src, alt, size, sizes, legend }: Props) {
  const image = useRef<HTMLImageElement>(null);
  const [rows, setRows] = useState<string[]>([]);

  const engrave = useCallback(() => {
    const loaded = image.current;
    if (!loaded?.complete || !loaded.naturalWidth) return;
    const shade = readShade(loaded);
    if (shade) setRows((current) => (current.length ? current : engraveRows(shade, homeWater)));
  }, []);

  useEffect(engrave, [engrave]);

  return (
    <div className={styles.medal} style={faceInset} data-engraved={rows.length > 0 || undefined}>
      <div className={styles.face}>
        <div className={styles.photo}>
          <Image
            ref={image}
            src={src}
            width={size}
            height={size}
            sizes={sizes}
            alt={alt}
            onLoad={engrave}
          />
        </div>
        {rows.length > 0 && (
          <svg
            className={styles.engraving}
            data-engraving
            viewBox={`0 0 ${PLATE} ${PLATE}`}
            aria-hidden="true"
          >
            {rows.map((outline, row) => (
              <path key={row} d={outline} />
            ))}
          </svg>
        )}
      </div>
      <Bezel {...legend} />
    </div>
  );
}
