import type { Metadata, Viewport } from "next";
import SmoothLinks from "@/components/SmoothLinks";
import Feedback from "@/components/feedback/Feedback";
import PageTurns from "@/components/sound/PageTurns";
import { site } from "@/content/site";
import { siteOrigin, sharingMetadata } from "@/lib/seo";
import { fontVariables } from "./fonts";
import "./globals.css";
import "./feedback.css";

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
    <html lang="en" className={fontVariables}>
      <body>
        {children}
        <PageTurns />
        <SmoothLinks />
        <Feedback />
      </body>
    </html>
  );
}
