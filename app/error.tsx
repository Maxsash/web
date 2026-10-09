"use client";

import { lazy, Suspense } from "react";

const DriftFrame = lazy(() => import("@/components/drift/DriftFrame"));

export default function PageError({ retry }: { retry: () => void }) {
  return (
    <Suspense>
      <DriftFrame
        scene="squall"
        kicker="Something broke"
        title="A rogue"
        emphasis="wave."
        actions={
          <>
            <button type="button" onClick={() => retry()}>
              Try again
            </button>
            {/* After a crash, a full page load starts the studio from a clean state. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/">Back to the studio</a>
          </>
        }
      >
        This page failed to load. Try again; if it keeps happening, head back to the studio.
      </DriftFrame>
    </Suspense>
  );
}
