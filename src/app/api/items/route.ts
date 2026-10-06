import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ItemRepository } from '@/server/repositories/items';
import { TelegramRepository } from '@/server/repositories/telegram';
import { withAuthRoute, intParam } from '@/server/api';
import { jsonResponse, successResponse, errorResponse } from '@/server/auth';
import { processInputTags } from '@/server/tagUtils';
import { logger } from '@/lib/logger';

const urlSchema = z
  .string()
  .trim()
  .min(1, 'URL is required')
  .transform((val) => (val.includes(':') ? val : `https://${val}`))
  .refine((val) => {
    try {
      const parsed = new URL(val);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Invalid URL');

const itemBodySchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  url: urlSchema,
  description: z.string().optional().default(''),
  comments: z.string().optional().default(''),
  image: z.string().optional().default(''),
  tags: z.array(z.union([z.number(), z.string()])).optional().default([]),
});

export async function GET(req: NextRequest) {
  return withAuthRoute(req, null, async ({ userId }) => {
    const items = await ItemRepository.getItems(userId);
    return jsonResponse(items);
  });
}

export async function POST(req: NextRequest) {
  return withAuthRoute(req, itemBodySchema, async ({ userId, body }) => {
    const tagIds = await processInputTags(body.tags, userId);
    const itemId = await ItemRepository.createItem(
      {
        title: body.title,
        description: body.description,
        url: body.url,
        comments: body.comments,
        image: body.image,
        tags: tagIds,
      },
      userId
    );

    // Asynchronously notify user on Telegram if linked
    TelegramRepository.notifyBookmarkCreated(
      userId,
      {
        id: itemId,
        title: body.title,
        url: body.url,
        description: body.description,
        comments: body.comments,
        tags: tagIds,
      },
      'з веб-сайту'
    ).catch((err) => {
      logger.warn({
        event: 'telegram_notify_bookmark_created_failed',
        error: err instanceof Error ? err.message : String(err),
        userId,
      });
    });

    return successResponse('Item created successfully', { item_id: itemId });
  });
}

export async function PATCH(req: NextRequest) {
  return withAuthRoute(req, itemBodySchema, async ({ userId, body, searchParams }) => {
    const itemId = intParam(searchParams, 'item-id');
    if (!itemId) {
      return errorResponse('Item ID is required');
    }

    const tagIds = await processInputTags(body.tags, userId);
    const updated = await ItemRepository.updateItem(
      {
        id: itemId,
        title: body.title,
        description: body.description,
        url: body.url,
        comments: body.comments,
        image: body.image,
        tags: tagIds,
      },
      userId
    );

    if (!updated) {
      return errorResponse('Item not found', 404);
    }

    return successResponse('Item updated successfully', { item_id: itemId });
  });
}
