import type { Metadata } from "next";
import PageLink from "@/components/PageLink";
import DriftPage from "@/components/drift/DriftPage";

export const metadata: Metadata = { title: "This note was torn out" };

export default function NoteNotFound() {
  return (
    <DriftPage
      id="atlas-content"
      scene="notebook"
      kicker="Field note N° —"
      title="This note was torn out."
      actions={
        <>
          <PageLink prefetch={false} href="/blog">
            Open the notebook
          </PageLink>
          <PageLink prefetch={false} href="/">
            Back to the studio
          </PageLink>
        </>
      }
    >
      It may have moved, or it isn&apos;t published yet.
    </DriftPage>
  );
}
