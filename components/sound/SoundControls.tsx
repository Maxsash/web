"use client";

import { useEffect, useSyncExternalStore } from "react";
import { respond } from "@/components/feedback/respond";
import {
  soundsChosen,
  subscribeSound,
  toggleSounds,
  toggleWaves,
  wavesStatus,
  type SoundStatus,
} from "./sound";
import { holdWaves } from "./waves";

const WAVE_LABELS: Record<SoundStatus, string> = {
  on: "Mute waves",
  off: "Play waves",
  unavailable: "Retry wave sound",
};

export function WaveSoundControl() {
  const status = useSyncExternalStore(subscribeSound, wavesStatus, () => "off" as const);
  return (
    <button type="button" data-wave-sound onClick={toggleWaves}>
      {WAVE_LABELS[status]}
    </button>
  );
}

export function MuteControl() {
  const on = useSyncExternalStore(subscribeSound, soundsChosen, () => true);
  return (
    <button
      type="button"
      data-sounds
      data-press="none"
      onClick={() => {
        toggleSounds();
        if (soundsChosen()) respond("press");
      }}
    >
      {on ? "Mute sounds" : "Unmute sounds"}
    </button>
  );
}

export function Waves() {
  useEffect(holdWaves, []);
  return null;
}
