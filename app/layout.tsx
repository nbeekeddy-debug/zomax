import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MarketplaceProvider } from "@/components/marketplace-provider";
import { PwaRuntime } from "@/components/pwa-runtime";
import { SiteHeader } from "@/components/site-header";
import { MobileDock } from "@/components/mobile-dock";
import { AuthSessionBridge } from "@/components/auth-session-bridge";

export const metadata: Metadata = {
  title: {
    default: "Zomax Marketplace",
    template: "%s | Zomax",
  },
  description: "Discover trusted sellers and quality products on Zomax.",
  applicationName: "Zomax",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "Zomax",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <MarketplaceProvider>
          <PwaRuntime />
          <AuthSessionBridge />
          <SiteHeader />
          {children}
          <MobileDock />
        </MarketplaceProvider>
      </body>
    </html>
  );
}
