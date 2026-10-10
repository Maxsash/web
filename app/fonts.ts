import { Montagu_Slab, Reddit_Mono, Rethink_Sans } from "next/font/google";

const display = Montagu_Slab({
  variable: "--typeface-display",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

const text = Rethink_Sans({
  variable: "--typeface-text",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const mono = Reddit_Mono({
  variable: "--typeface-mono",
  subsets: ["latin"],
  display: "swap",
});

export const fontVariables = `${display.variable} ${text.variable} ${mono.variable}`;
