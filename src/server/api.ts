import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodType } from 'zod';
import { AuthError, errorResponse, getAuthenticatedUserId } from './auth';
import { ApiTokenRepository, parseScopes, TOKEN_PREFIX, type ApiScope } from './repositories/tokens';
import { checkPublicRateLimit } from './rateLimit';
import { logger } from '@/lib/logger';

export interface AuthedRouteContext<T> {
  userId: number;
  body: T;
  searchParams: URLSearchParams;
}

/**
 * Wraps an API route handler with:
 * - Clerk authentication (401 on failure);
 * - zod body validation (422 with field errors on failure), when a schema is given;
 * - uniform error classification: AuthError → 401, ZodError → 422,
 *   anything else is logged server-side and returned as a generic 500.
 */
export async function withAuthRoute<T = undefined>(
  req: NextRequest | null,
  schema: ZodType<T> | null,
  handler: (ctx: AuthedRouteContext<T>) => Promise<Response>
): Promise<Response> {
  try {
    const userId = await getAuthenticatedUserId();

    let body = undefined as T;
    if (schema && req) {
      let raw: unknown = {};
      try {
        raw = await req.json();
      } catch {
        raw = {};
      }
      body = schema.parse(raw);
    }

    return await handler({
      userId,
      body,
      searchParams: req ? new URL(req.url).searchParams : new URLSearchParams(),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse('Потрібна авторизація', 401);
    }
    if (err instanceof ZodError) {
      return errorResponse('Невірні дані запиту', 422, err.flatten().fieldErrors);
    }
    const errorMsg = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    logger.error({
      event: 'api_unhandled_route_error',
      error: errorMsg,
      stack: errorStack,
      path: req?.url,
    });
    return errorResponse(
      'Внутрішня помилка сервера',
      500,
      process.env.LOG_LEVEL === 'debug' ? { error: errorMsg, stack: errorStack } : undefined
    );
  }
}

/** Parses a positive integer ID from a query parameter, or null. */
export function intParam(searchParams: URLSearchParams, name: string): number | null {
  const raw = searchParams.get(name);
  if (raw === null) return null;
  const value = parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

// ---------------------------------------------------------------------------
// Public REST API v1 (/api/v1) — Personal Access Token auth
// ---------------------------------------------------------------------------

const V1_CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function withCors(res: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(V1_CORS_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

export function v1Preflight(): Response {
  return new NextResponse(null, { status: 204, headers: V1_CORS_HEADERS });
}

export function v1Error(code: string, message: string, status: number): Response {
  return withCors(NextResponse.json({ error: { code, message } }, { status }));
}

export interface V1Result {
  status?: number;
  body: unknown;
}

export interface TokenRouteContext<T> {
  userId: number;
  tokenId: number;
  scopes: ApiScope[];
  body: T;
  searchParams: URLSearchParams;
}

function extractBearer(req: NextRequest): string | null {
  const header = req.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();
  return token.startsWith(TOKEN_PREFIX) ? token : null;
}

/**
 * Wraps a /api/v1 route handler with:
 * - Bearer token auth (`st__…` PAT stored hashed in the DB);
 * - scope enforcement;
 * - zod body validation (422 with field errors);
 * - per-token rate limiting;
 * - uniform v1 error envelope `{ error: { code, message } }` and CORS headers.
 */
export async function withTokenRoute<T = undefined>(
  req: NextRequest,
  scope: ApiScope | null,
  schema: ZodType<T> | null,
  handler: (ctx: TokenRouteContext<T>) => Promise<V1Result>
): Promise<Response> {
  try {
    const bearer = extractBearer(req);
    if (!bearer) {
      return v1Error('unauthorized', 'Missing or malformed bearer token. Expected "Authorization: Bearer st__…"', 401);
    }

    const row = await ApiTokenRepository.resolveBearer(bearer);
    if (!row) {
      return v1Error('unauthorized', 'Invalid or revoked token', 401);
    }

    const rate = checkPublicRateLimit(`v1:${row.id}`, 120, 60_000);
    if (!rate.allowed) {
      return v1Error('rate_limited', 'Too many requests, try again later', 429);
    }

    const scopes = parseScopes(row.scopes);
    if (scope && !scopes.includes(scope)) {
      return v1Error('forbidden', `This token is missing the "${scope}" scope`, 403);
    }

    let body = undefined as T;
    if (schema) {
      let raw: unknown = {};
      try {
        raw = await req.json();
      } catch {
        raw = {};
      }
      body = schema.parse(raw);
    }

    const result = await handler({
      userId: row.user_id,
      tokenId: row.id,
      scopes,
      body,
      searchParams: new URL(req.url).searchParams,
    });
    return withCors(
      NextResponse.json(result.body ?? null, { status: result.status ?? 200 })
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return withCors(
        NextResponse.json(
          { error: { code: 'validation_error', message: 'Invalid request body', details: err.flatten().fieldErrors } },
          { status: 422 }
        )
      );
    }
    logger.error({
      event: 'api_v1_unhandled_route_error',
      error: err instanceof Error ? err.message : String(err),
      path: req.url,
    });
    return v1Error('internal_error', 'Internal server error', 500);
  }
}
