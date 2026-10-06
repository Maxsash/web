"use client";

import { useEffect } from "react";

/** Prints the plate. With `auto`, opens the print dialog once the page has settled. */
export default function PrintButton({ auto }: { auto: boolean }) {
  useEffect(() => {
    if (!auto) return;
    let cancelled = false;
    document.fonts.ready.then(() => { if (!cancelled) setTimeout(() => { if (!cancelled) window.print(); }, 250); });
    return () => { cancelled = true; };
  }, [auto]);
  return <button type="button" onClick={() => window.print()}>Print this plate</button>;
}
