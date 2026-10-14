import type { Metadata, Viewport } from "next";
import SmoothLinks from "@/components/SmoothLinks";
import ThemeColor from "@/components/ThemeColor";
import { applyInitialTheme } from "@/components/observatory/initial-theme";
import Feedback from "@/components/feedback/Feedback";
import PageTurns from "@/components/sound/PageTurns";
import { site } from "@/content/site";
import { siteOrigin, sharingMetadata } from "@/lib/seo";
import { fontVariables } from "./fonts";
import Telemetry from "@/components/telemetry/Telemetry";
import { telemetryConfig } from "@/lib/telemetry/config";
import { telemetryCatalog } from "@/lib/telemetry/catalog";
import "./globals.css";
import "./feedback.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: site.colors.paper },
    { media: "(prefers-color-scheme: dark)", color: site.colors.night },
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
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(${applyInitialTheme})()` }} />
      </head>
      <body>
        <Telemetry enabled={telemetryConfig().enabled} catalog={telemetryCatalog()}>
          {children}
          <PageTurns />
          <SmoothLinks />
          <ThemeColor />
          <Feedback />
        </Telemetry>
      </body>
    </html>
  );
}
