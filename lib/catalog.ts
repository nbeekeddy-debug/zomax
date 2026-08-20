import { products as seedProducts, type Product } from "@/lib/products";

export type CatalogResult = {
  products: Product[];
  source: "api" | "seed";
  degraded: boolean;
};

function finiteNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeProduct(value: unknown): Product | null {
  if (!value || typeof value !== "object") return null;
  const product = value as Record<string, unknown>;
  const id = finiteNumber(product.id, NaN);
  const price = finiteNumber(product.price, NaN);

  if (!Number.isFinite(id) || !Number.isFinite(price) || typeof product.name !== "string") return null;

  return {
    id,
    name: product.name,
    category: typeof product.category === "string" ? product.category : "Other",
    price,
    oldPrice: product.oldPrice == null ? undefined : finiteNumber(product.oldPrice),
    rating: finiteNumber(product.rating),
    reviews: finiteNumber(product.reviews),
    seller: typeof product.seller === "string" ? product.seller : "Zomax seller",
    location: typeof product.location === "string" ? product.location : "Nigeria",
    image:
      typeof product.image === "string" && product.image
        ? product.image
        : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
    description: typeof product.description === "string" ? product.description : "",
    stock: Math.max(0, finiteNumber(product.stock)),
  };
}

export async function getCatalog(): Promise<CatalogResult> {
  const apiBase = process.env.ZOMAX_API_URL?.replace(/\/$/, "");
  if (!apiBase) return { products: seedProducts, source: "seed", degraded: false };

  try {
    const response = await fetch(`${apiBase}/api/products`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4500),
    });
    if (!response.ok) throw new Error(`Catalog API returned ${response.status}`);

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) throw new Error("Catalog API returned a non-array payload");

    const normalized = payload.map(normalizeProduct).filter((product): product is Product => product !== null);
    if (payload.length > 0 && normalized.length === 0) throw new Error("Catalog API returned no valid products");

    return { products: normalized, source: "api", degraded: false };
  } catch (error) {
    console.error("Zomax catalog API unavailable; using seed catalog", error);
    return { products: seedProducts, source: "seed", degraded: true };
  }
}

export async function getProductById(id: number) {
  const catalog = await getCatalog();
  return { product: catalog.products.find((item) => item.id === id) ?? null, catalog };
}
