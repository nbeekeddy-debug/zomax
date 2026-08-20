import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/account",
          "/cart",
          "/checkout",
          "/confirmation",
          "/forgot-password",
          "/login",
          "/orders",
          "/sell",
          "/seller",
          "/signup",
          "/wishlist",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
