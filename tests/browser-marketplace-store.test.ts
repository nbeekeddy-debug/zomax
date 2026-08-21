import { afterEach, describe, expect, it } from "vitest";
import { scopedStorageKey } from "../lib/marketplace-storage";
import {
  readBrowserValue,
  readPrivateSnapshot,
  removePrivateSnapshot,
  writeBrowserValue,
} from "../lib/services/browser-marketplace-store";

function installMemoryWindow() {
  const values = new Map<string, string>();
  const localStorage = {
    get length() { return values.size; },
    clear() { values.clear(); },
    getItem(key: string) { return values.get(key) ?? null; },
    key(index: number) { return Array.from(values.keys())[index] ?? null; },
    removeItem(key: string) { values.delete(key); },
    setItem(key: string, value: string) { values.set(key, value); },
  } satisfies Storage;

  Object.defineProperty(globalThis, "window", {
    value: { localStorage },
    configurable: true,
    writable: true,
  });

  return localStorage;
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

describe("browser marketplace store", () => {
  it("reads and writes JSON values safely", () => {
    installMemoryWindow();
    writeBrowserValue("example", { ok: true });
    expect(readBrowserValue("example", null)).toEqual({ ok: true });
  });

  it("uses legacy private values only when migration fallback is enabled", () => {
    const storage = installMemoryWindow();
    storage.setItem("zomax_cart", JSON.stringify([{ id: 101, qty: 2 }]));

    expect(readPrivateSnapshot("guest", false).cart).toEqual([]);
    expect(readPrivateSnapshot("guest", true).cart).toEqual([{ id: 101, qty: 2 }]);
  });

  it("prefers scoped data over legacy fallback", () => {
    const storage = installMemoryWindow();
    storage.setItem("zomax_cart", JSON.stringify([{ id: 101, qty: 1 }]));
    storage.setItem(scopedStorageKey("guest", "cart"), JSON.stringify([{ id: 102, qty: 3 }]));

    expect(readPrivateSnapshot("guest", true).cart).toEqual([{ id: 102, qty: 3 }]);
  });

  it("removes all private keys for one scope without touching another", () => {
    const storage = installMemoryWindow();
    storage.setItem(scopedStorageKey("user:a", "cart"), JSON.stringify([{ id: 1, qty: 1 }]));
    storage.setItem(scopedStorageKey("user:a", "account"), JSON.stringify({ name: "A" }));
    storage.setItem(scopedStorageKey("user:b", "cart"), JSON.stringify([{ id: 2, qty: 1 }]));

    removePrivateSnapshot("user:a");

    expect(storage.getItem(scopedStorageKey("user:a", "cart"))).toBeNull();
    expect(storage.getItem(scopedStorageKey("user:a", "account"))).toBeNull();
    expect(storage.getItem(scopedStorageKey("user:b", "cart"))).not.toBeNull();
  });
});
