import { describe, expect, it } from "vitest";
import { mergeCart, mergeWishlist, scopedStorageKey, storageScope, userIdentity } from "../lib/marketplace-storage";

describe("marketplace storage isolation", () => {
  it("keeps guests in a dedicated scope", () => {
    expect(storageScope(null)).toBe("guest");
    expect(scopedStorageKey("guest", "cart")).toBe("zomax:v2:guest:cart");
  });

  it("creates stable signed-in identities", () => {
    expect(userIdentity({ id: "user-123", email: "ignored@example.com" })).toBe("user-123");
    expect(storageScope({ email: "Person@Example.com" })).toBe("user:email%3Aperson%40example.com");
  });

  it("merges a guest cart without losing quantities", () => {
    expect(mergeCart([{ id: 101, qty: 1 }], [{ id: 101, qty: 2 }, { id: 102, qty: 1 }])).toEqual([
      { id: 101, qty: 3 },
      { id: 102, qty: 1 },
    ]);
  });

  it("deduplicates wishlist items during guest-to-user merge", () => {
    expect(mergeWishlist([101, 102], [102, 103])).toEqual([101, 102, 103]);
  });
});
