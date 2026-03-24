import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export async function parseRequestBody<T>(
  req: Request,
  schema: z.ZodType<T>,
): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return {
      ok: false,
      response: Response.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false,
      response: Response.json(
        { error: z.prettifyError(parsed.error) },
        { status: 400 },
      ),
    };
  }
  return { ok: true, data: parsed.data };
}

/** App Router: JSON body + Zod; invalid body → 400. */
export function validateRequest<T>(
  schema: z.ZodType<T>,
  handler: (data: T, req: Request) => Response | Promise<Response>,
): (req: Request) => Promise<Response> {
  return async (req) => {
    const parsed = await parseRequestBody(req, schema);
    if (!parsed.ok) return parsed.response;
    return handler(parsed.data, req);
  };
}

type MethodHandlers = Partial<
  Record<"GET" | "POST" | "PUT" | "PATCH" | "DELETE", NextApiHandler>
>;

/** Pages Router: dispatch by HTTP method; unknown method → 405. */
export function pagesRouter(handlers: MethodHandlers): NextApiHandler {
  return (req, res) => {
    const method = req.method as keyof MethodHandlers;
    const handler = handlers[method];
    if (!handler) {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    return handler(req, res);
  };
}

/** Pages Router: require POST, parse JSON body with Zod; invalid → 400. */
export function validatePagesBody<T>(
  schema: z.ZodType<T>,
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    data: T,
  ) => void | Promise<void>,
): NextApiHandler {
  return async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: z.prettifyError(parsed.error) });
      return;
    }
    return handler(req, res, parsed.data);
  };
}

/** Pages Router: parse `req.query` with Zod; invalid → 400. Pair with `validatePagesMethod` when needed. */
export function validatePagesQuery<T>(
  schema: z.ZodType<T>,
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    data: T,
  ) => void | Promise<void>,
): NextApiHandler {
  return async (req, res) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: z.prettifyError(parsed.error) });
      return;
    }
    return handler(req, res, parsed.data);
  };
}

/** Pages Router: single allowed method or 405. */
export function validatePagesMethod(
  method: string,
  handler: NextApiHandler,
): NextApiHandler {
  return (req, res) => {
    if (req.method !== method) {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    return handler(req, res);
  };
}
