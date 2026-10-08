import { Suspense } from "react";
import { version } from "@/package.json";
import GitHubActivity, { ActivityFallback } from "./GitHubActivity";
import Shoreline from "./Shoreline";

export default function ShoreFooter({ seaModel = "1" }: { seaModel?: string }) {
  const revision = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_BUILD_SHA;
  const commit = revision && /^[a-f0-9]{7,40}$/i.test(revision) ? revision.slice(0, 7) : null;
  return (
    <Shoreline version={version} commit={commit} seaModel={seaModel}>
      <Suspense fallback={<ActivityFallback loading />}>
        <GitHubActivity />
      </Suspense>
    </Shoreline>
  );
}
