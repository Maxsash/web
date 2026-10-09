"use client";

import type { ComponentProps, MouseEvent } from "react";
import Link from "next/link";
import { glideNextScroll } from "@/components/SmoothLinks";

export const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);

// Focus moves to the page's first control so the next Tab starts at the top, as after a load.
function returnToTop(href: string) {
  if (location.hash) history.pushState(null, "", href);
  document
    .querySelector<HTMLElement>("a[href], button:not(:disabled)")
    ?.focus({ preventScroll: true });
  glideNextScroll();
  scrollTo({ top: 0 });
}

export default function PageLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      prefetch={false}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        const { href } = props;
        if (event.defaultPrevented || !isPlainClick(event)) return;
        if (href !== location.pathname + location.search) return;
        event.preventDefault();
        returnToTop(href);
      }}
    />
  );
}
