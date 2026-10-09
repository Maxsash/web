"use client";

import { lazy, Suspense } from "react";
import { fontVariables } from "./fonts";
import "./globals.css";

const DriftFrame = lazy(() => import("@/components/drift/DriftFrame"));

export default function SiteError() {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <title>Caught in the storm | Maxsash Studio</title>
        <Suspense>
          <DriftFrame
            scene="storm"
            kicker="Everything stopped"
            title="Caught in the"
            emphasis="storm."
            actions={
              <button type="button" onClick={() => window.location.reload()}>
                Reload the page
              </button>
            }
          >
            The site couldn&apos;t start. Reload to try again.
          </DriftFrame>
        </Suspense>
      </body>
    </html>
  );
}
