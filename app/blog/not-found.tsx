import type { Metadata } from "next";
import Link from "next/link";
import DriftPage from "@/components/drift/DriftPage";

export const metadata: Metadata = { title: "This note was torn out" };

export default function NoteNotFound() {
  return (
    <DriftPage
      id="atlas-content"
      scene="notebook"
      kicker="Field note N° —"
      title="This note was"
      emphasis="torn out."
      actions={
        <>
          <Link prefetch={false} href="/blog">
            Open the notebook
          </Link>
          <Link prefetch={false} href="/">
            Back to the studio
          </Link>
        </>
      }
    >
      It may have moved, or it isn&apos;t published yet.
    </DriftPage>
  );
}
