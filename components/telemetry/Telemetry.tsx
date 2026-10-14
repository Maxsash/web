"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { RouteCatalog } from "@/lib/telemetry/schema";
import { observeJourney } from "./journey";
import { preferenceSnapshot, serverPreference, subscribePreference } from "./preferences";

const Enabled = createContext(false);
export const useTelemetryEnabled = () => useContext(Enabled);
export const useAnalyticsPreference = () =>
  useSyncExternalStore(subscribePreference, preferenceSnapshot, serverPreference);

export default function Telemetry({
  enabled,
  catalog,
  children,
}: {
  enabled: boolean;
  catalog: RouteCatalog;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const preference = useAnalyticsPreference();
  const journey = useRef<ReturnType<typeof observeJourney> | null>(null);
  useEffect(() => {
    if (!enabled || preference !== "measure") return;
    const observer = observeJourney(catalog);
    journey.current = observer;
    observer.visit();
    return () => {
      observer.stop();
      journey.current = null;
    };
  }, [enabled, preference, catalog]);
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current !== pathname) journey.current?.visit();
    previousPath.current = pathname;
  }, [pathname]);
  return <Enabled value={enabled}>{children}</Enabled>;
}
