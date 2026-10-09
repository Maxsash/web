"use client";

import { useEffect, useSyncExternalStore } from "react";
import { soundStatus, subscribeSound, toggleSound, type SoundStatus } from "./sound";
import { holdWaves } from "./waves";

const LABELS: Record<SoundStatus, string> = {
  on: "Mute waves",
  off: "Play waves",
  unavailable: "Retry wave sound",
};

export function WaveSoundControl() {
  const status = useSyncExternalStore(subscribeSound, soundStatus, () => "off" as const);
  return (
    <button type="button" data-wave-sound onClick={toggleSound}>
      {LABELS[status]}
    </button>
  );
}

export function Waves() {
  useEffect(holdWaves, []);
  return null;
}
