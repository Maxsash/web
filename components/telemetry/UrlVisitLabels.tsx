"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { readVisitLabels } from "./visit";
import { stopReplay } from "./replay";

export default function UrlVisitLabels() {
  const params = useSearchParams();
  useEffect(() => {
    if (!params.has("studio_visit") && !params.has("studio_intent")) return;
    stopReplay();
    readVisitLabels();
    const url = new URL(location.href);
    url.searchParams.delete("studio_visit");
    url.searchParams.delete("studio_intent");
    history.replaceState(history.state, "", url.pathname + url.search + url.hash);
  }, [params]);
  return null;
}
