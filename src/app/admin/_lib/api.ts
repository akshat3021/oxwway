/**
 * Browser-side client for /api/*. Mirrors the server response contract:
 *   success { data, meta? }   failure { error: { code, message, details?, requestId } }
 */
export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FieldIssue {
  path: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly issues: FieldIssue[] = [],
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api<T = unknown>(
  path: string,
  init: { method?: string; json?: unknown; signal?: AbortSignal } = {},
): Promise<{ data: T; meta?: PageMeta }> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: init.method ?? (init.json !== undefined ? "POST" : "GET"),
      credentials: "same-origin",
      headers: init.json !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init.json !== undefined ? JSON.stringify(init.json) : undefined,
      signal: init.signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError(0, "NETWORK", "Cannot reach the server. Check your connection and try again.");
  }

  if (res.status === 204) return { data: undefined as T };

  const body = (await res.json().catch(() => null)) as
    | { data?: T; meta?: PageMeta; error?: { code: string; message: string; details?: FieldIssue[]; requestId?: string } }
    | null;

  if (!res.ok) {
    // Session ended (expired, revoked, deactivated): go sign in again.
    if (res.status === 401 && !path.startsWith("/api/auth/login") && typeof window !== "undefined") {
      window.location.assign("/admin/login?expired=1");
    }
    const e = body?.error;
    throw new ApiError(
      res.status,
      e?.code ?? "ERROR",
      e?.message ?? "Something went wrong. Please try again.",
      Array.isArray(e?.details) ? e.details : [],
      e?.requestId,
    );
  }
  return { data: body?.data as T, meta: body?.meta };
}

export const errorMessage = (err: unknown): string =>
  err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
