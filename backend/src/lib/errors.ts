import type { Context } from "hono";
import type { AuthError } from "../auth";
import type { ProgramError } from "../program";

export function handleRouteError(
  c: Context,
  error: unknown,
  fallbackCode = "UNEXPECTED_ERROR",
  fallbackStatus = 500,
): Response {
  if (isAuthError(error)) {
    return c.json(
      { ok: false, error: error.code },
      error.status as 400 | 401 | 404 | 409 | 500,
    );
  }
  if (isProgramError(error)) {
    return c.json(
      { ok: false, error: error.code },
      error.status as 400 | 401 | 404 | 409 | 500,
    );
  }
  if (isErrorWithCodeAndStatus(error)) {
    return c.json(
      { ok: false, error: error.code },
      error.status as 400 | 401 | 404 | 409 | 500,
    );
  }
  return c.json(
    { ok: false, error: fallbackCode },
    fallbackStatus as 400 | 401 | 404 | 409 | 500,
  );
}

function isErrorWithCodeAndStatus(
  error: unknown,
): error is { code: string; status: number } {
  return (
    error instanceof Error &&
    "code" in error &&
    "status" in error &&
    typeof (error as { code: string; status: number }).code === "string" &&
    typeof (error as { code: string; status: number }).status === "number"
  );
}

function isAuthError(error: unknown): error is AuthError {
  return (
    error instanceof Error &&
    "code" in error &&
    "status" in error &&
    typeof (error as AuthError).code === "string" &&
    typeof (error as AuthError).status === "number"
  );
}

function isProgramError(error: unknown): error is ProgramError {
  return (
    error instanceof Error &&
    "code" in error &&
    "status" in error &&
    typeof (error as ProgramError).code === "string" &&
    typeof (error as ProgramError).status === "number"
  );
}
