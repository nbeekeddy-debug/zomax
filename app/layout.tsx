import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MarketplaceProvider } from "@/components/marketplace-provider";
import { PwaRuntime } from "@/components/pwa-runtime";
import { SiteHeader } from "@/components/site-header";
import { MobileDock } from "@/components/mobile-dock";
import { AuthSessionBridge } from "@/components/auth-session-bridge";
import { RouteAnnouncer } from "@/components/route-announcer";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Zomax Marketplace",
    template: "%s | Zomax",
  },
  description: "Discover products, local sellers, deals and marketplace services across Zomax.",
  applicationName: "Zomax",
  category: "shopping",
  keywords: ["Zomax", "Nigeria marketplace", "online shopping", "local sellers", "deals", "seller marketplace"],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Zomax",
    title: "Zomax Marketplace",
    description: "Discover products, local sellers and deals across Zomax.",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "Zomax Marketplace",
    description: "Discover products, local sellers and deals across Zomax.",
  },
  appleWebApp: {
    capable: true,
    title: "Zomax",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#c94b0b",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG">
      <body>
        <a href="#zomax-page-content" className="z-skip-link">Skip to main content</a>
        <MarketplaceProvider>
          <PwaRuntime />
          <AuthSessionBridge />
          <RouteAnnouncer />
          <SiteHeader />
          <div id="zomax-page-content" tabIndex={-1} className="outline-none">
            {children}
          </div>
          <MobileDock />
        </MarketplaceProvider>
      </body>
    </html>
  );
}
