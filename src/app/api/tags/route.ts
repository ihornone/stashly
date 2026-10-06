import { NextRequest } from 'next/server';
import { z } from 'zod';
import { TagRepository } from '@/server/repositories/tags';
import { withAuthRoute, intParam } from '@/server/api';
import { jsonResponse, successResponse, errorResponse } from '@/server/auth';
import { parseTagSegments, createTagsFromSegments } from '@/server/tagUtils';

export async function GET(req: NextRequest) {
  return withAuthRoute(req, null, async ({ userId }) => {
    const tags = await TagRepository.getTags(userId);
    return jsonResponse(tags);
  });
}

export async function POST(req: NextRequest) {
  return withAuthRoute(
    req,
    z.object({ title: z.string().trim().min(1, 'Tag title is required') }),
    async ({ userId, body }) => {
      const segments = parseTagSegments(body.title);
      const tagId = await createTagsFromSegments(segments, userId);
      return successResponse('Tag created successfully', { tag_id: tagId, title: body.title });
    }
  );
}

export async function DELETE(req: NextRequest) {
  return withAuthRoute(req, null, async ({ userId, searchParams }) => {
    const tagId = intParam(searchParams, 'id');
    if (!tagId) {
      return errorResponse('Tag ID is required');
    }
    const deleteBookmarks = searchParams.get('delete-bookmarks') === 'true';

    await TagRepository.deleteTag(tagId, userId, deleteBookmarks);
    return successResponse(
      deleteBookmarks ? 'Тег та всі його закладки успішно видалено' : 'Тег успішно видалено'
    );
  });
}
