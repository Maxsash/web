"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { PAGE_TURNS, choosePageTurn, synthesizePageTurn, turnsPage } from "@/lib/sound/page-turn";
import { playClip, soundsChosen } from "./sound";
import { duckWaves } from "./waves";

let previous = -1;

export function playPageTurn() {
  const { variant, rate, gain } = choosePageTurn(Math.random, previous);
  previous = variant;
  duckWaves();
  playClip(
    `page-turn-${variant}`,
    (sampleRate) => synthesizePageTurn(sampleRate, PAGE_TURNS[variant]),
    { rate, gain },
  );
}

export default function PageTurns() {
  const pathname = usePathname();
  const shown = useRef(pathname);
  useEffect(() => {
    shown.current = pathname;
  }, [pathname]);
  useEffect(() => {
    const turn = () => {
      if (turnsPage(shown.current, location.pathname) && soundsChosen()) playPageTurn();
    };
    addEventListener("popstate", turn);
    return () => removeEventListener("popstate", turn);
  }, []);
  return null;
}
