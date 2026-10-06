import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ItemRepository } from '@/server/repositories/items';
import { withAuthRoute } from '@/server/api';
import { successResponse } from '@/server/auth';

const refetchSchema = z.object({
  itemIds: z.array(z.coerce.number().int().positive()).min(1).max(50),
});

export async function POST(req: NextRequest) {
  return withAuthRoute(req, refetchSchema, async ({ userId, body }) => {
    await ItemRepository.refetchItemsMetadata(body.itemIds, userId);
    return successResponse('Metadata fetched and updated successfully');
  });
}
