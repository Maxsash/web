import type { Metadata } from "next";
import PageLink from "@/components/PageLink";
import DriftPage from "@/components/drift/DriftPage";
import { DEFAULT_SEA_SEED_V2 } from "@/lib/sea/seed";

export const metadata: Metadata = { title: "That sea can't be drawn" };

export default function PlateNotFound() {
  return (
    <DriftPage
      scene="plate"
      telemetryError="not-found"
      kicker="Seed not recognised"
      title="That sea can't be drawn."
      actions={
        <>
          <PageLink href={`/plate?seed=${DEFAULT_SEA_SEED_V2}&version=2`}>
            Draw the default sea
          </PageLink>
          <PageLink href="/sea">Back to the sea studio</PageLink>
        </>
      }
    >
      A sea link needs eight letters and digits, 0–9 and a–f. Start from the default sea instead.
    </DriftPage>
  );
}
