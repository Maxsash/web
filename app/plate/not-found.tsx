import type { Metadata } from "next";
import Link from "next/link";
import DriftPage from "@/components/drift/DriftPage";
import { DEFAULT_SEA_SEED_V2 } from "@/lib/sea/seed";

export const metadata: Metadata = { title: "That sea can't be drawn" };

export default function PlateNotFound() {
  return (
    <DriftPage
      scene="plate"
      kicker="Seed not recognised"
      title="That sea can't be"
      emphasis="drawn."
      actions={
        <>
          <Link prefetch={false} href={`/plate?seed=${DEFAULT_SEA_SEED_V2}&version=2`}>
            Draw the default sea
          </Link>
          <Link prefetch={false} href="/#sea-studio">
            Back to the sea studio
          </Link>
        </>
      }
    >
      A sea link needs eight letters and digits, 0–9 and a–f. Start from the default sea instead.
    </DriftPage>
  );
}
