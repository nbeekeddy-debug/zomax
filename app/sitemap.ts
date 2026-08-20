import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/shop"), lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: absoluteUrl("/deals"), lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: absoluteUrl("/categories"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/sellers"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/help"), lastModified: now, changeFrequency: "monthly", priority: 0.45 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/product/${product.id}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...staticRoutes, ...productRoutes];
}
