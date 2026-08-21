import type { ServiceResult } from "@/lib/services/contracts";

export type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

export async function serviceRequest<T>(url: string, options: RequestOptions = {}): Promise<ServiceResult<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: options.credentials ?? "include",
      headers: {
        Accept: "application/json",
        ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const payload = await response.json() as { error?: string; message?: string };
        message = payload.error || payload.message || message;
      } catch {}
      return { ok: false, error: message, code: String(response.status) };
    }

    if (response.status === 204) return { ok: true, data: null as T };
    return { ok: true, data: await response.json() as T };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Network request failed",
      code: "NETWORK_ERROR",
    };
  }
}
