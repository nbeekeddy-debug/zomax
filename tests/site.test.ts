import { describe, expect, it } from "vitest";
import { absoluteUrl, siteUrl } from "../lib/site";

describe("site URL helpers", () => {
  it("normalizes the fallback production URL", () => {
    expect(siteUrl).toBe("https://zomax.vercel.app");
  });

  it("builds canonical absolute URLs from relative paths", () => {
    expect(absoluteUrl("/shop")).toBe("https://zomax.vercel.app/shop");
    expect(absoluteUrl("deals")).toBe("https://zomax.vercel.app/deals");
  });
});
