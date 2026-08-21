import { afterEach, describe, expect, it, vi } from "vitest";
import { serviceRequest } from "../lib/services/http-client";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("serviceRequest", () => {
  it("returns typed JSON data for successful requests", async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ id: 7 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;

    await expect(serviceRequest<{ id: number }>("/api/example")).resolves.toEqual({
      ok: true,
      data: { id: 7 },
    });
  });

  it("normalizes API errors without throwing into the UI", async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;

    await expect(serviceRequest("/api/private")).resolves.toEqual({
      ok: false,
      error: "Unauthorized",
      code: "401",
    });
  });

  it("normalizes network failures", async () => {
    globalThis.fetch = vi.fn(async () => { throw new Error("offline"); }) as typeof fetch;

    await expect(serviceRequest("/api/example")).resolves.toEqual({
      ok: false,
      error: "offline",
      code: "NETWORK_ERROR",
    });
  });
});
