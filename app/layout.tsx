import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { site } from "@/content/site";
import { siteOrigin, sharingMetadata } from "@/lib/seo";
import "./globals.css";

/* Fraunces carries the display voice: an old-style face with enough warmth for
   the nautical half of the brand.  SOFT and WONK are pinned low in globals.css
   so headings stay precise rather than whimsical. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/* Monospace does the mathematics: labels, counters, coordinates. */
const jetbrains = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#D8ECF7" },
    { media: "(prefers-color-scheme: dark)", color: "#10233B" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),

  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },

  description: site.description,

  ...sharingMetadata(`${site.name} — ${site.tagline}`, site.description, "/"),
  authors: [{ name: site.owner, url: site.links.portfolio }],

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
