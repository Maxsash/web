"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const PAGE_STATE = ["data-studio-theme", "data-rendering", "data-chapter"];

const stuckAtTop = (element: Element) => {
  const { top, height } = element.getBoundingClientRect();
  const pinned = ["sticky", "fixed"].includes(getComputedStyle(element).position);
  return pinned && Math.abs(top) < 1 && height <= innerHeight + 1;
};

/** Safari 26+ ignores theme-color and tints its bars from a stuck element's background, else
 * the body's. Other browsers read theme-color, so it follows the same rule. */
function barColor() {
  const tint = document.querySelector("[data-bar-tint]");
  return tint && stuckAtTop(tint)
    ? getComputedStyle(tint).getPropertyValue("--bar-top").trim()
    : getComputedStyle(document.body).backgroundColor;
}

export default function ThemeColor() {
  const pathname = usePathname();
  useEffect(() => {
    const sync = () => {
      const color = barColor();
      for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'))
        if (meta.content !== color) meta.content = color;
    };
    const changes = new MutationObserver(sync);
    changes.observe(document.documentElement, { subtree: true, attributeFilter: PAGE_STATE });
    changes.observe(document.head, { childList: true });
    const position = new IntersectionObserver(sync, { threshold: 1 });
    const tint = document.querySelector("[data-bar-tint]");
    if (tint) position.observe(tint);
    sync();
    return () => {
      changes.disconnect();
      position.disconnect();
    };
  }, [pathname]);
  return null;
}
