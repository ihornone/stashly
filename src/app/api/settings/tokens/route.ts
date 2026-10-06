import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiTokenRepository, API_SCOPES, generateApiToken, type ApiScope } from '@/server/repositories/tokens';
import { withAuthRoute, intParam } from '@/server/api';
import { successResponse, errorResponse } from '@/server/auth';

/**
 * Session-authenticated token management (used by the in-app settings UI).
 * The public /api/v1/tokens endpoints mirror this with PAT auth.
 */

const createSchema = z.object({
  name: z.string().trim().min(1).max(100),
  scopes: z
    .array(z.enum(API_SCOPES))
    .min(1)
    .optional()
    .default(['items:read', 'tags:read']),
});

export async function GET(req: NextRequest) {
  return withAuthRoute(req, null, async ({ userId }) => {
    const tokens = await ApiTokenRepository.listByUser(userId, true);
    return successResponse('Tokens retrieved', {
      tokens: tokens.map((t) => ({
        id: t.id,
        name: t.name,
        prefix: t.token_prefix,
        scopes: t.scopes.split(',').filter(Boolean),
        last_used_at: t.last_used_at,
        created_at: t.created_at,
        revoked_at: t.revoked_at,
      })),
    });
  });
}

export async function POST(req: NextRequest) {
  return withAuthRoute(req, createSchema, async ({ userId, body }) => {
    const generated = generateApiToken();
    const tokenId = await ApiTokenRepository.create(userId, body.name, body.scopes as ApiScope[], generated);
    return successResponse('Token created', {
      id: tokenId,
      name: body.name,
      prefix: generated.tokenPrefix,
      scopes: body.scopes,
      // Plaintext is returned exactly once
      token: generated.token,
    });
  });
}

export async function DELETE(req: NextRequest) {
  return withAuthRoute(req, null, async ({ userId, searchParams }) => {
    const tokenId = intParam(searchParams, 'id');
    if (!tokenId) {
      return errorResponse('Token ID is required');
    }
    const revoked = await ApiTokenRepository.revoke(tokenId, userId);
    if (!revoked) {
      return errorResponse('Token not found or already revoked', 404);
    }
    return successResponse('Token revoked');
  });
}
