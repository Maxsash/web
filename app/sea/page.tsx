import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SeaStudio from "@/components/studio/SeaStudio";
import { sharingMetadata } from "@/lib/seo";
import { pickVisitSea } from "@/lib/sea/presets";
import { resolvePageSea, type PageSeaQuery } from "@/lib/sea/request";

const title = "Make your own sea";
const description =
  "The sea on maxsash.com is drawn from six waves and four settings. Change them, watch the drawing change, then print it, save it or sail it.";

export const metadata: Metadata = {
  title,
  description,
  ...sharingMetadata(`${title} | Maxsash Studio`, description, "/sea"),
};

export default async function SeaPage({ searchParams }: { searchParams: Promise<PageSeaQuery> }) {
  const sea = resolvePageSea(await searchParams, pickVisitSea);
  if (!sea) notFound();
  return (
    <PageShell skip="Skip to the sea studio">
      <SeaStudio seed={sea.seed} version={sea.version} />
    </PageShell>
  );
}
