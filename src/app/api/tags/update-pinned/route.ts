import { NextRequest } from 'next/server';
import { z } from 'zod';
import { TagRepository } from '@/server/repositories/tags';
import { withAuthRoute, intParam } from '@/server/api';
import { successResponse, errorResponse } from '@/server/auth';

const pinnedSchema = z.object({
  pinned: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  return withAuthRoute(req, pinnedSchema, async ({ userId, body, searchParams }) => {
    const tagId = intParam(searchParams, 'tag-id');
    if (!tagId) {
      return errorResponse('Tag ID is required');
    }

    await TagRepository.updateTagPinned(tagId, body.pinned, userId);
    return successResponse('Tag pinned status updated successfully', { tag_id: tagId, pinned: body.pinned });
  });
}
