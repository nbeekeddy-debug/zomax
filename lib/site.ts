const fallbackSiteUrl = "https://zomax.vercel.app";

function normalizeBaseUrl(value?: string) {
  const candidate = value?.trim() || fallbackSiteUrl;
  try {
    const url = new URL(candidate);
    return url.toString().replace(/\/$/, "");
  } catch {
    return fallbackSiteUrl;
  }
}

export const siteUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL);

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}
