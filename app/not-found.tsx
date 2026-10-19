import type { Metadata } from "next";
import PageLink from "@/components/PageLink";
import DriftPage from "@/components/drift/DriftPage";

export const metadata: Metadata = { title: "Nothing on the horizon" };

export default function NotFound() {
  return (
    <DriftPage
      scene="horizon"
      telemetryError="not-found"
      kicker="Error 404"
      title="Nothing on the horizon."
      actions={
        <>
          <PageLink href="/">Back to the studio</PageLink>
          <PageLink href="/blog">Open the notebook</PageLink>
        </>
      }
    >
      There is no page at this address. Only driftwood.
    </DriftPage>
  );
}
