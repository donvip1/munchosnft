import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: "Munchos NFT | Robinhood Chain Native Web3 App",
    template: "%s | Munchos NFT"
  },
  description:
    "Munchos NFT is a mobile-first Web3 application for the Robinhood Chain ecosystem, launching with an exclusive waitlist and referral system.",
  keywords: [
    "Munchos NFT",
    "munchosnft",
    "munchonft",
    "Robinhood Chain",
    "NFT waitlist",
    "NFT fusion",
    "Web3 gaming"
  ],
  openGraph: {
    title: "Munchos NFT",
    description:
      "Join the exclusive Munchos NFT waitlist for a Robinhood Chain-native Web3 application.",
    url: siteConfig.siteUrl,
    siteName: "Munchos NFT",
    images: [
      {
        url: "/images/munchosnft.png",
        width: 1536,
        height: 1024,
        alt: "Munchos NFT"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Munchos NFT",
    description: "The Future of NFT Evolution Starts Here.",
    images: ["/images/munchosnft.png"],
    creator: "@munchonft"
  },
  icons: {
    icon: "/images/munchosnft.png",
    apple: "/images/munchosnft.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#090909",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
