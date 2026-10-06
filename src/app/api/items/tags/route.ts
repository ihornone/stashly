import { NextRequest } from 'next/server';
import { z } from 'zod';
import { TagRepository } from '@/server/repositories/tags';
import { withAuthRoute } from '@/server/api';
import { successResponse, errorResponse } from '@/server/auth';

const syncSchema = z.object({
  itemIds: z.array(z.coerce.number().int().positive()).min(1).max(200),
  newSelectedTagsAll: z.array(z.coerce.number().int().positive()).optional(),
  newSelectedTagsSome: z.array(z.coerce.number().int().positive()).optional().default([]),
});

const attachSchema = z.object({
  itemIds: z.array(z.coerce.number().int().positive()).min(1).max(200),
  action: z.literal('attach'),
  attachTagIds: z.array(z.coerce.number().int().positive()).min(1).max(50),
});

export async function PATCH(req: NextRequest) {
  return withAuthRoute(req, z.union([attachSchema, syncSchema]), async ({ userId, body }) => {
    if ('action' in body) {
      await TagRepository.attachItemsTags(body.itemIds, body.attachTagIds, userId);
      return successResponse('Tags attached successfully');
    }

    if (body.newSelectedTagsAll === undefined) {
      return errorResponse('newSelectedTagsAll is required');
    }

    await TagRepository.syncItemsTags(body.itemIds, body.newSelectedTagsAll, body.newSelectedTagsSome, userId);
    return successResponse('Item tags updated successfully');
  });
}
