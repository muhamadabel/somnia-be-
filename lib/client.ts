"use client";

// Thin client-side wrapper for the API contract envelope (docs/07).

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: Array<{ field?: string; message: string }>;
}

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;
  constructor(status: number, message: string, errors: Array<{ field?: string; message: string }> = []) {
    super(message);
    this.status = status;
    this.fieldErrors = {};
    for (const e of errors) if (e.field) this.fieldErrors[e.field] = e.message;
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit & { json?: unknown } = {}
): Promise<{ data: T; meta: Record<string, unknown>; message: string }> {
  const { json, ...init } = options;
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(json !== undefined ? { "content-type": "application/json" } : {}),
      ...init.headers,
    },
    body: json !== undefined ? JSON.stringify(json) : init.body,
  });
  let body: ApiEnvelope<T>;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError(res.status, "Unexpected server response. Please try again.");
  }
  if (!res.ok || !body.success) {
    throw new ApiError(res.status, body.message || "Request failed", body.errors ?? []);
  }
  return { data: body.data as T, meta: body.meta ?? {}, message: body.message };
}
