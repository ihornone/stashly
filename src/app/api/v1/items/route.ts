import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ItemRepository } from '@/server/repositories/items';
import { TelegramRepository } from '@/server/repositories/telegram';
import { withTokenRoute, v1Preflight } from '@/server/api';
import { processInputTags } from '@/server/tagUtils';
import { logger } from '@/lib/logger';

const urlSchema = z
  .string()
  .trim()
  .min(1)
  .transform((val) => (val.includes(':') ? val : `https://${val}`))
  .refine((val) => {
    try {
      const parsed = new URL(val);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Invalid URL');

const createSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  url: urlSchema,
  description: z.string().optional().default(''),
  comments: z.string().optional().default(''),
  image: z.string().optional().default(''),
  tags: z.array(z.union([z.number(), z.string()])).optional().default([]),
});

const listSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(200).optional().default(50),
  q: z.string().trim().max(200).optional(),
  tag_id: z.coerce.number().int().positive().optional(),
});

export async function GET(req: NextRequest) {
  return withTokenRoute(req, 'items:read', null, async ({ userId, searchParams }) => {
    const query = listSchema.parse(Object.fromEntries(searchParams.entries()));
    const { items, total } = await ItemRepository.getItemsPage(userId, {
      page: query.page,
      perPage: query.per_page,
      q: query.q,
      tagId: query.tag_id,
    });
    return {
      body: {
        data: items,
        meta: { page: query.page, per_page: query.per_page, total },
      },
    };
  });
}

export async function POST(req: NextRequest) {
  return withTokenRoute(req, 'items:write', createSchema, async ({ userId, body }) => {
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
      'через API / розширення'
    ).catch((err) => {
      logger.warn({
        event: 'telegram_notify_api_item_created_failed',
        error: err instanceof Error ? err.message : String(err),
        userId,
      });
    });

    return { status: 201, body: { data: { id: itemId, ...body, tags: tagIds } } };
  });
}

export async function OPTIONS() {
  return v1Preflight();
}
