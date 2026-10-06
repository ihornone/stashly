import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ItemRepository } from '@/server/repositories/items';
import { withAuthRoute } from '@/server/api';
import { successResponse } from '@/server/auth';

const deleteSchema = z.object({
  itemIds: z.array(z.coerce.number().int().positive()).min(1).max(200),
});

async function handleDelete(req: NextRequest) {
  return withAuthRoute(req, deleteSchema, async ({ userId, body }) => {
    await ItemRepository.deleteItems(body.itemIds, userId);
    return successResponse('Item(s) deleted successfully');
  });
}

export async function POST(req: NextRequest) {
  return handleDelete(req);
}

export async function DELETE(req: NextRequest) {
  return handleDelete(req);
}
