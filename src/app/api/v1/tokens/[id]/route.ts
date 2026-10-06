import { NextRequest } from 'next/server';
import { ApiTokenRepository } from '@/server/repositories/tokens';
import { withTokenRoute, v1Preflight, v1Error } from '@/server/api';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Revokes a token. Revoked tokens stop working immediately. */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const tokenId = parseInt(id, 10);
  if (!Number.isFinite(tokenId) || tokenId <= 0) {
    return v1Error('invalid_id', 'Token ID must be a positive integer', 422);
  }
  return withTokenRoute(req, 'tokens:manage', null, async ({ userId }) => {
    const revoked = await ApiTokenRepository.revoke(tokenId, userId);
    if (!revoked) {
      return { status: 404, body: { error: { code: 'not_found', message: 'Token not found or already revoked' } } };
    }
    return { body: { data: { id: tokenId, revoked: true } } };
  });
}

export async function OPTIONS() {
  return v1Preflight();
}
