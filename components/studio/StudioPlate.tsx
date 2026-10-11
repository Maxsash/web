"use client";

import Image from "next/image";
import { useMemo, useSyncExternalStore } from "react";
import { renderSeaPlate } from "@/lib/sea/plate";
import type { SeaEdition } from "@/lib/sea/types";
import styles from "./SeaStudio.module.css";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export default function StudioPlate({
  edition,
  inked,
  label,
}: {
  edition: SeaEdition;
  inked: boolean;
  label: string;
}) {
  const live = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const plate = useMemo(() => (live ? renderSeaPlate(edition) : null), [edition, live]);
  const attributes = {
    className: styles.plateFrame,
    "data-inked": inked || undefined,
    role: "img",
    "aria-label": label,
  };
  if (plate) return <div {...attributes} dangerouslySetInnerHTML={{ __html: plate }} />;
  return (
    <div {...attributes}>
      <Image
        src={`/api/sea-edition/print?seed=${edition.seed}&version=${edition.version}`}
        alt=""
        width={1280}
        height={960}
        loading="lazy"
        unoptimized
      />
    </div>
  );
}
