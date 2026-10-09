"use client";

import type { ComponentProps, MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { playPageTurn } from "@/components/sound/PageTurns";
import { soundChosen, wake } from "@/components/sound/sound";
import { turnsPage } from "@/lib/sound/page-turn";

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);

export default function NotebookLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const entering = typeof props.href === "string" && turnsPage(pathname, props.href);
  return (
    <Link
      prefetch={false}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!entering || !isPlainClick(event) || !soundChosen()) return;
        wake();
        playPageTurn();
      }}
    />
  );
}
