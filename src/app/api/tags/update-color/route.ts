import { NextRequest } from 'next/server';
import { z } from 'zod';
import { TagRepository } from '@/server/repositories/tags';
import { withAuthRoute, intParam } from '@/server/api';
import { successResponse, errorResponse } from '@/server/auth';

const colorSchema = z.object({
  color: z.union([z.string().regex(/^#[0-9a-fA-F]{3,8}$/), z.literal('')]),
});

export async function PATCH(req: NextRequest) {
  return withAuthRoute(req, colorSchema, async ({ userId, body, searchParams }) => {
    const tagId = intParam(searchParams, 'tag-id');
    if (!tagId) {
      return errorResponse('Tag ID is required');
    }

    await TagRepository.updateTagColor(tagId, body.color, userId);
    return successResponse('Tag color updated successfully', { tag_id: tagId, color: body.color });
  });
}
