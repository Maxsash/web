import type { Metadata } from "next";
import Link from "next/link";
import DriftPage from "@/components/drift/DriftPage";

export const metadata: Metadata = { title: "Nothing on the horizon" };

export default function NotFound() {
  return (
    <DriftPage
      scene="horizon"
      kicker="Error 404"
      title="Nothing on the horizon."
      actions={
        <>
          <Link prefetch={false} href="/">
            Back to the studio
          </Link>
          <Link prefetch={false} href="/blog">
            Open the notebook
          </Link>
        </>
      }
    >
      There is no page at this address. Only driftwood.
    </DriftPage>
  );
}
