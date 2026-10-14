"use client";

import { lazy, Suspense, useEffect } from "react";
import { track } from "@/components/telemetry/actions";

const DriftFrame = lazy(() => import("@/components/drift/DriftFrame"));

export default function PageError({ retry }: { retry: () => void }) {
  useEffect(() => track("experience_issue", { issue: "route-error" }), []);
  return (
    <Suspense>
      <DriftFrame
        scene="squall"
        telemetryError="route-error"
        kicker="Something broke"
        title="A rogue wave."
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
