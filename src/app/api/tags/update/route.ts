import { NextRequest } from 'next/server';
import { z } from 'zod';
import { TagRepository } from '@/server/repositories/tags';
import { withAuthRoute, intParam } from '@/server/api';
import { successResponse, errorResponse } from '@/server/auth';

const colorSchema = z.union([z.string().regex(/^#[0-9a-fA-F]{3,8}$/), z.literal('')]).optional();

const updateSchema = z.object({
  title: z.string().trim().min(1, 'Tag title is required'),
  description: z.string().optional().default(''),
  parent: z.coerce.number().int().min(0).optional().default(0),
  color: colorSchema,
});

export async function PATCH(req: NextRequest) {
  return withAuthRoute(req, updateSchema, async ({ userId, body, searchParams }) => {
    const tagId = intParam(searchParams, 'tag-id');
    if (!tagId) {
      return errorResponse('Tag ID is required');
    }

    let parentId = body.parent;
    if (parentId !== 0) {
      // The parent must already exist and belong to the caller —
      // an UPDATE must not silently create tags as a side effect.
      const owned = await TagRepository.getTags(userId);
      if (!owned[parentId]) {
        return errorResponse('Parent tag not found', 422);
      }
    }

    if (tagId === parentId) {
      return errorResponse('Tag cannot be the parent of itself');
    }

    // Reject moves that would create a cycle (parent is a descendant of the tag)
    if (parentId !== 0 && (await TagRepository.isDescendantOrSelf(tagId, parentId, userId))) {
      return errorResponse('Tag cannot be moved under its own descendant');
    }

    await TagRepository.updateTag(tagId, body.title, body.description, parentId, userId, body.color);

    return successResponse('Tag updated successfully', {
      tag_id: tagId,
      parent_id: parentId,
      title: body.title,
      description: body.description,
      color: body.color,
    });
  });
}
