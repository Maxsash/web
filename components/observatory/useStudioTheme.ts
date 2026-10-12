"use client";

import { useEffect, useSyncExternalStore } from "react";
import { followTheme, nightTheme, subscribeTheme } from "./theme";

const serverSnapshot = () => false;

export function useStudioTheme() {
  const night = useSyncExternalStore(subscribeTheme, nightTheme, serverSnapshot);
  useEffect(followTheme, []);
  return night;
}
