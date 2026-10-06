import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ShareRepository } from '@/server/repositories/shares';
import { withAuthRoute } from '@/server/api';
import { jsonResponse } from '@/server/auth';

const importSchema = z.object({
  mode: z.enum(['merge', 'new']).optional().default('merge'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withAuthRoute(req, importSchema, async ({ userId, body }) => {
    const result = await ShareRepository.importSharedTag(id, userId, body.mode);
    if (!result) {
      return jsonResponse(
        { success: false, message: 'Shared category not found or access closed' },
        404
      );
    }

    return jsonResponse({
      success: true,
      message: result.isIdentical
        ? `Категорія вже існує та синхронізована!`
        : `Категорію та ${result.count} закладок імпортовано!`,
      tagId: result.tagId,
      count: result.count,
      isIdentical: result.isIdentical,
      alreadyExists: result.alreadyExists,
    });
  });
}
