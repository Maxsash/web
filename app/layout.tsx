import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#87C4FF",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.maxsash.com"),

  title: {
    default: "Maxsash",
    template: "%s | Maxsash",
  },

  description:
    "Maxsash is a software development studio specializing in crafting high-quality applications, games, and automation tools. We are dedicated to delivering innovative solutions that enhance productivity and provide engaging experiences for our users.",

  openGraph: {
    title: "Maxsash",
    description:
      "Maxsash is a software development studio specializing in crafting high-quality applications, games, and automation tools.",
    images: ["/images/cover-compressed.png"],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    images: ["/images/cover-compressed.png"],
  },

  robots: {
    index: false,
    follow: false,
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geistMono.variable}>
        {children}
      </body>
    </html>
  );
}