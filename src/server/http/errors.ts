import "server-only";

/**
 * Operational errors with a stable, machine-readable `code`.
 * Anything that is NOT an AppError is treated as a bug and returned to the
 * client as a generic 500 (details go to logs only).
 */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
    readonly headers?: Record<string, string>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new AppError(400, "BAD_REQUEST", message, details);
export const unauthorized = (message = "Authentication required") =>
  new AppError(401, "UNAUTHENTICATED", message);
export const forbidden = (message = "You do not have permission to do this") =>
  new AppError(403, "FORBIDDEN", message);
export const notFound = (message = "Resource not found") =>
  new AppError(404, "NOT_FOUND", message);
export const conflict = (message: string, details?: unknown) =>
  new AppError(409, "CONFLICT", message, details);
export const payloadTooLarge = (message = "Request body too large") =>
  new AppError(413, "PAYLOAD_TOO_LARGE", message);
export const unsupportedMediaType = () =>
  new AppError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json");
export const validationFailed = (details: unknown) =>
  new AppError(422, "VALIDATION_ERROR", "The request data is invalid", details);
export const tooManyRequests = (retryAfterSeconds: number) =>
  new AppError(429, "RATE_LIMITED", "Too many requests. Please try again later.", undefined, {
    "Retry-After": String(Math.max(1, Math.ceil(retryAfterSeconds))),
  });
