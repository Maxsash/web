"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { listenForFirstGesture, subscribeSound } from "@/components/sound/sound";
import { listenForActions } from "./actions";
import Announcer from "./Announcer";
import { watchArrivals } from "./arrivals";
import { watchAbsence, watchConnection, watchIdle } from "./presence";
import { prepareCues } from "./respond";

export default function Feedback() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const lifetime = new AbortController();
    root.dataset.feedback = "";
    listenForFirstGesture();
    listenForActions(lifetime.signal);
    watchIdle(lifetime.signal);
    watchAbsence(lifetime.signal);
    watchConnection(lifetime.signal);
    const unsubscribe = subscribeSound(prepareCues);
    return () => {
      lifetime.abort();
      unsubscribe();
      delete root.dataset.feedback;
    };
  }, []);
  useEffect(() => {
    const page = new AbortController();
    watchArrivals(page.signal);
    return () => page.abort();
  }, [pathname]);
  return <Announcer />;
}
