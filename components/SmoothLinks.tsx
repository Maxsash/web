"use client";

import { useEffect } from "react";

const RELEASE_MS = 1500;
let release = 0;

// Smoothness is switched on for one link's scroll only: a global `scroll-behavior: smooth`
// would also glide every Tab focus and find-in-page jump.
export function glideNextScroll() {
  const root = document.documentElement;
  const end = () => {
    clearTimeout(release);
    delete root.dataset.glide;
  };
  clearTimeout(release);
  root.dataset.glide = "";
  release = window.setTimeout(end, RELEASE_MS);
  document.addEventListener("scrollend", end, { once: true });
}

export default function SmoothLinks() {
  useEffect(() => {
    const glideToSection = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest('a[href^="#"]'))
        glideNextScroll();
    };
    document.addEventListener("click", glideToSection);
    return () => document.removeEventListener("click", glideToSection);
  }, []);
  return null;
}
