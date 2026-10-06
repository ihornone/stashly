import { NextRequest } from 'next/server';
import { ApiTokenRepository } from '@/server/repositories/tokens';
import { withTokenRoute, v1Preflight } from '@/server/api';

/** Token introspection: lets integrations verify a token and its scopes. */
export async function GET(req: NextRequest) {
  return withTokenRoute(req, null, null, async ({ userId, tokenId, scopes }) => {
    const tokens = await ApiTokenRepository.listByUser(userId, true);
    const self = tokens.find((t) => t.id === tokenId) || null;
    return {
      body: {
        data: {
          token_id: tokenId,
          user_id: userId,
          scopes,
          name: self?.name ?? null,
          created_at: self?.created_at ?? null,
          last_used_at: self?.last_used_at ?? null,
        },
      },
    };
  });
}

export async function OPTIONS() {
  return v1Preflight();
}
