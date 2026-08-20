import type { Metadata } from "next";
import "./globals.css";
import { MarketplaceProvider } from "@/components/marketplace-provider";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Zomax Marketplace",
  description: "Discover trusted sellers and quality products on Zomax.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <MarketplaceProvider>
          <SiteHeader />
          {children}
        </MarketplaceProvider>
      </body>
    </html>
  );
}
