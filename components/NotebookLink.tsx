"use client";

import type { ComponentProps, MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { soundOptedIn } from "@/components/shore/WaveSound";
import { PAGE_TURNS, choosePageTurn, synthesizePageTurn } from "@/lib/page-turn";

let context: AudioContext | null = null;
const pageTurns: (AudioBuffer | undefined)[] = [];
let previous = -1;

function playPageTurn() {
  try {
    context ??= new AudioContext();
    const { variant, rate, gain } = choosePageTurn(Math.random, previous);
    previous = variant;
    if (!pageTurns[variant]) {
      const samples = synthesizePageTurn(context.sampleRate, PAGE_TURNS[variant]);
      pageTurns[variant] = context.createBuffer(1, samples.length, context.sampleRate);
      pageTurns[variant].copyToChannel(samples, 0);
    }
    const source = context.createBufferSource();
    source.buffer = pageTurns[variant];
    source.playbackRate.value = rate;
    const volume = context.createGain();
    volume.gain.value = gain;
    source.connect(volume);
    volume.connect(context.destination);
    void context.resume().then(() => source.start());
  } catch {}
}

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);

export default function NotebookLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const entering =
    typeof props.href === "string" && props.href.startsWith("/blog") && props.href !== pathname;
  return (
    <Link
      prefetch={false}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (entering && isPlainClick(event) && soundOptedIn()) playPageTurn();
      }}
    />
  );
}
