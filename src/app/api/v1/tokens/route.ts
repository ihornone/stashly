import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiTokenRepository, API_SCOPES, generateApiToken, type ApiScope } from '@/server/repositories/tokens';
import { withTokenRoute, v1Preflight } from '@/server/api';

const createSchema = z.object({
  name: z.string().trim().min(1, 'Token name is required').max(100),
  scopes: z
    .array(z.enum(API_SCOPES))
    .min(1)
    .optional()
    .default(['items:read', 'tags:read']),
});

function toPublic(row: {
  id: number;
  name: string;
  token_prefix: string;
  scopes: string;
  last_used_at: string | null;
  created_at: string | null;
  revoked_at: string | null;
}) {
  return {
    id: row.id,
    name: row.name,
    prefix: row.token_prefix,
    scopes: row.scopes.split(',').filter(Boolean),
    last_used_at: row.last_used_at,
    created_at: row.created_at,
    revoked_at: row.revoked_at,
  };
}

export async function GET(req: NextRequest) {
  return withTokenRoute(req, 'tokens:manage', null, async ({ userId }) => {
    const tokens = await ApiTokenRepository.listByUser(userId, true);
    return { body: { data: tokens.map(toPublic), meta: { total: tokens.length } } };
  });
}

export async function POST(req: NextRequest) {
  return withTokenRoute(req, 'tokens:manage', createSchema, async ({ userId, body }) => {
    const generated = generateApiToken();
    const tokenId = await ApiTokenRepository.create(userId, body.name, body.scopes as ApiScope[], generated);
    return {
      status: 201,
      body: {
        data: {
          id: tokenId,
          name: body.name,
          prefix: generated.tokenPrefix,
          scopes: body.scopes,
          // The plaintext token is returned exactly once and never stored
          token: generated.token,
        },
      },
    };
  });
}

export async function OPTIONS() {
  return v1Preflight();
}
