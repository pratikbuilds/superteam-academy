import type { Context } from "hono";
import type { z } from "zod";

export async function parseJsonBody<T>(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return {};
  }
}

export function parseQuery<T extends z.ZodType>(
  c: Context,
  schema: T
): z.infer<T> {
  const query = c.req.query();
  return schema.parse(query) as z.infer<T>;
}
