import { NextRequest } from 'next/server';
import { z } from 'zod';
import { TagRepository } from '@/server/repositories/tags';
import { withTokenRoute, v1Preflight } from '@/server/api';
import { parseTagSegments, createTagsFromSegments } from '@/server/tagUtils';

const createSchema = z.object({
  title: z.string().trim().min(1, 'Tag title is required'),
  description: z.string().optional().default(''),
  parent: z.coerce.number().int().min(0).optional().default(0),
  color: z.union([z.string().regex(/^#[0-9a-fA-F]{3,8}$/), z.literal('')]).optional().default(''),
});

export async function GET(req: NextRequest) {
  return withTokenRoute(req, 'tags:read', null, async ({ userId }) => {
    const tags = await TagRepository.getTagsArray(userId);
    return { body: { data: tags, meta: { total: tags.length } } };
  });
}

export async function POST(req: NextRequest) {
  return withTokenRoute(req, 'tags:write', createSchema, async ({ userId, body }) => {
    let parentId = body.parent;
    if (parentId !== 0) {
      const owned = await TagRepository.getTags(userId);
      if (!owned[parentId]) {
        return {
          status: 422,
          body: { error: { code: 'validation_error', message: 'Parent tag not found' } },
        };
      }
    }

    // Hierarchical titles like "Work/Sub" create the missing chain
    let tagId: number;
    if (body.parent === 0 && body.title.includes('/')) {
      tagId = await createTagsFromSegments(parseTagSegments(body.title), userId);
    } else {
      tagId = await TagRepository.createTag(body.title, body.description, parentId, userId, body.color || undefined);
    }

    const tags = await TagRepository.getTagsArray(userId);
    const created = tags.find((t) => t.id === tagId) || null;
    return { status: 201, body: { data: created } };
  });
}

export async function OPTIONS() {
  return v1Preflight();
}
