"use client";

import { useEffect, useSyncExternalStore } from "react";

type Status = "ready" | "on" | "off" | "unavailable";
let status: Status = "ready";
let toggle: (() => void) | null = null;
const listeners = new Set<() => void>();
const publish = (next: Status) => { status = next; listeners.forEach(listener => listener()); };
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };

export function WaveSoundControl() {
  const current = useSyncExternalStore(subscribe, () => status, () => "ready" as Status);
  return <button type="button" data-wave-sound onClick={() => toggle?.()}>
    {current === "on" ? "Mute waves" : current === "unavailable" ? "Retry wave sound" : "Play waves"}
  </button>;
}

/** One controller for both header and footer controls. Audio unlock stays inside input handlers. */
export function WaveSoundController() {
  useEffect(() => {
    let audio: AudioContext | null = null, enabled = false, disposed = false;
    let muted = false;
    try { muted = localStorage.getItem("studio-wave-sound") === "off"; } catch {}
    publish(muted ? "off" : "ready");
    const events = new AbortController();
    const start = () => {
      if (!enabled || disposed || document.hidden) return;
      try {
        if (!audio) {
          audio = new AudioContext();
          const buffer = audio.createBuffer(1, audio.sampleRate * 3, audio.sampleRate), data = buffer.getChannelData(0);
          let pink = 0;
          for (let i = 0; i < data.length; i++) { pink = (pink + .02 * (Math.random() * 2 - 1)) / 1.02; data[i] = pink * 3.5; }
          const source = audio.createBufferSource(); source.buffer = buffer; source.loop = true;
          const filter = audio.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 1100;
          const gain = audio.createGain(); gain.gain.setValueAtTime(0, audio.currentTime); gain.gain.linearRampToValueAtTime(.028, audio.currentTime + .4);
          const swell = audio.createOscillator(); swell.frequency.value = .09;
          const depth = audio.createGain(); depth.gain.value = .024; swell.connect(depth); depth.connect(gain.gain);
          source.connect(filter); filter.connect(gain); gain.connect(audio.destination); source.start(); swell.start();
          audio.onstatechange = () => { if (enabled && !disposed && !document.hidden && audio?.state === "running") publish("on"); };
        }
        const current = audio;
        void current.resume().then(() => { if (!disposed && enabled && audio === current && current.state === "running") publish("on"); }).catch(() => { if (!disposed && enabled) publish("ready"); });
      } catch { publish("unavailable"); void audio?.close(); audio = null; }
    };
    toggle = () => {
      // Only these controls enable sound. General page interaction never creates audio.
      enabled = status !== "on";
      try { localStorage.setItem("studio-wave-sound", enabled ? "on" : "off"); } catch {}
      if (enabled) start();
      else { const current = audio; audio = null; void current?.close(); publish("off"); }
    };
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) void audio?.suspend().catch(() => {});
      else if (audio && enabled) start();
    }, { signal: events.signal });
    return () => { disposed = true; events.abort(); toggle = null; void audio?.close(); audio = null; publish("ready"); };
  }, []);
  return null;
}
