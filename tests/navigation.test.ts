import { describe, expect, it } from "vitest";
import { isRouteActive } from "../lib/navigation";

describe("isRouteActive", () => {
  it("matches the homepage only at the exact root", () => {
    expect(isRouteActive("/", "/")).toBe(true);
    expect(isRouteActive("/shop", "/")).toBe(false);
  });

  it("matches a route and its nested pages", () => {
    expect(isRouteActive("/seller", "/seller")).toBe(true);
    expect(isRouteActive("/seller/settings", "/seller")).toBe(true);
    expect(isRouteActive("/sellers", "/seller")).toBe(false);
  });

  it("rejects malformed or unrelated hrefs", () => {
    expect(isRouteActive("/shop", "shop")).toBe(false);
    expect(isRouteActive("/deals", "/shop")).toBe(false);
  });
});
