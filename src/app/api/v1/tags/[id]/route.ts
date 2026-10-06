import { NextRequest } from 'next/server';
import { z } from 'zod';
import { TagRepository } from '@/server/repositories/tags';
import { withTokenRoute, v1Preflight, v1Error } from '@/server/api';

const patchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  parent: z.coerce.number().int().min(0).optional(),
  color: z.union([z.string().regex(/^#[0-9a-fA-F]{3,8}$/), z.literal('')]).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function resolveId(context: RouteContext): Promise<number | null> {
  const { id } = await context.params;
  const numId = parseInt(id, 10);
  return Number.isFinite(numId) && numId > 0 ? numId : null;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const id = await resolveId(context);
  if (!id) {
    return v1Error('invalid_id', 'Tag ID must be a positive integer', 422);
  }
  return withTokenRoute(req, 'tags:read', null, async ({ userId }) => {
    const tags = await TagRepository.getTagsArray(userId);
    const tag = tags.find((t) => t.id === id) || null;
    if (!tag) {
      return { status: 404, body: { error: { code: 'not_found', message: 'Tag not found' } } };
    }
    return { body: { data: tag } };
  });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const id = await resolveId(context);
  if (!id) {
    return v1Error('invalid_id', 'Tag ID must be a positive integer', 422);
  }
  return withTokenRoute(req, 'tags:write', patchSchema, async ({ userId, body }) => {
    const owned = await TagRepository.getTags(userId);
    if (!owned[id]) {
      return { status: 404, body: { error: { code: 'not_found', message: 'Tag not found' } } };
    }

    const existing = owned[id];
    const title = body.title ?? existing.title;
    const description = body.description ?? existing.description ?? '';
    const parentId = body.parent ?? existing.parent;
    const color = body.color;

    if (parentId !== 0) {
      if (!owned[parentId]) {
        return {
          status: 422,
          body: { error: { code: 'validation_error', message: 'Parent tag not found' } },
        };
      }
      if (id === parentId) {
        return {
          status: 422,
          body: { error: { code: 'validation_error', message: 'Tag cannot be the parent of itself' } },
        };
      }
      if (await TagRepository.isDescendantOrSelf(id, parentId, userId)) {
        return {
          status: 422,
          body: {
            error: { code: 'validation_error', message: 'Tag cannot be moved under its own descendant' },
          },
        };
      }
    }

    await TagRepository.updateTag(id, title, description, parentId, userId, color);
    const tags = await TagRepository.getTagsArray(userId);
    return { body: { data: tags.find((t) => t.id === id) || null } };
  });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const id = await resolveId(context);
  if (!id) {
    return v1Error('invalid_id', 'Tag ID must be a positive integer', 422);
  }
  return withTokenRoute(req, 'tags:write', null, async ({ userId, searchParams }) => {
    const deleteBookmarks = searchParams.get('delete_bookmarks') === 'true';
    await TagRepository.deleteTag(id, userId, deleteBookmarks);
    return { body: { data: { id, deleted: true } } };
  });
}

export async function OPTIONS() {
  return v1Preflight();
}
