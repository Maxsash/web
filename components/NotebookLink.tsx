"use client";

import type { ComponentProps } from "react";
import { usePathname } from "next/navigation";
import PageLink, { isPlainClick } from "@/components/PageLink";
import { playPageTurn } from "@/components/sound/PageTurns";
import { soundChosen, wake } from "@/components/sound/sound";
import { turnsPage } from "@/lib/sound/page-turn";

export default function NotebookLink({ onClick, ...props }: ComponentProps<typeof PageLink>) {
  const pathname = usePathname();
  const entering = typeof props.href === "string" && turnsPage(pathname, props.href);
  return (
    <PageLink
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
