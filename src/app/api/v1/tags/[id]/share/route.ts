import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ShareRepository } from '@/server/repositories/shares';
import { TagRepository } from '@/server/repositories/tags';
import { withTokenRoute, v1Preflight, v1Error } from '@/server/api';

const shareActionSchema = z.object({
  action: z.enum(['enable', 'regenerate']).optional().default('enable'),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function resolveId(context: RouteContext): Promise<number | null> {
  const { id } = await context.params;
  const numId = parseInt(id, 10);
  return Number.isFinite(numId) && numId > 0 ? numId : null;
}

/** Current share status of a tag. */
export async function GET(req: NextRequest, context: RouteContext) {
  const id = await resolveId(context);
  if (!id) {
    return v1Error('invalid_id', 'Tag ID must be a positive integer', 422);
  }
  return withTokenRoute(req, 'share:write', null, async ({ userId }) => {
    const owned = await TagRepository.getTags(userId);
    const tag = owned[id];
    if (!tag) {
      return { status: 404, body: { error: { code: 'not_found', message: 'Tag not found' } } };
    }
    const shared = !!(tag.is_shared ?? (tag.share_id && tag.share_id.length === 10));
    return {
      body: {
        data: {
          tag_id: id,
          shared,
          share_id: shared ? tag.share_id : null,
          url: shared && tag.share_id ? `/share/${tag.share_id}` : null,
        },
      },
    };
  });
}

/** Opens (or regenerates) the public share link for a tag. */
export async function POST(req: NextRequest, context: RouteContext) {
  const id = await resolveId(context);
  if (!id) {
    return v1Error('invalid_id', 'Tag ID must be a positive integer', 422);
  }
  return withTokenRoute(req, 'share:write', shareActionSchema, async ({ userId, body }) => {
    const owned = await TagRepository.getTags(userId);
    if (!owned[id]) {
      return { status: 404, body: { error: { code: 'not_found', message: 'Tag not found' } } };
    }

    const shareId =
      body.action === 'regenerate'
        ? await ShareRepository.regenerateTagShareId(id, userId)
        : await ShareRepository.ensureTagShareId(id, userId);

    return {
      status: 201,
      body: {
        data: {
          tag_id: id,
          shared: !!shareId,
          share_id: shareId,
          url: shareId ? `/share/${shareId}` : null,
        },
      },
    };
  });
}

/** Closes the public share link for a tag. */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const id = await resolveId(context);
  if (!id) {
    return v1Error('invalid_id', 'Tag ID must be a positive integer', 422);
  }
  return withTokenRoute(req, 'share:write', null, async ({ userId }) => {
    const owned = await TagRepository.getTags(userId);
    if (!owned[id]) {
      return { status: 404, body: { error: { code: 'not_found', message: 'Tag not found' } } };
    }
    await ShareRepository.disableTagShare(id, userId);
    return { body: { data: { tag_id: id, shared: false, share_id: null, url: null } } };
  });
}

export async function OPTIONS() {
  return v1Preflight();
}
