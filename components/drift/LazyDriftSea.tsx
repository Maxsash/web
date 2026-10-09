"use client";

import { lazy, Suspense } from "react";
import type { DriftSceneName } from "./scenes";

const DriftSea = lazy(() => import("./DriftSea"));

export default function LazyDriftSea({ scene }: { scene: DriftSceneName }) {
  return (
    <Suspense>
      <DriftSea scene={scene} />
    </Suspense>
  );
}
