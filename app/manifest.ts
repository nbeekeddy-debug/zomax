import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zomax Marketplace",
    short_name: "Zomax",
    description: "Discover products, local sellers, deals and marketplace services across Zomax.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8f4f0",
    theme_color: "#c94b0b",
    orientation: "portrait-primary",
    categories: ["shopping", "business"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Shop",
        short_name: "Shop",
        description: "Browse the Zomax marketplace",
        url: "/shop",
        icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
      },
      {
        name: "Deals",
        short_name: "Deals",
        description: "Open current Zomax deals",
        url: "/deals",
        icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
      },
      {
        name: "Seller Studio",
        short_name: "Sell",
        description: "Open seller tools",
        url: "/seller",
        icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
      },
    ],
  };
}
