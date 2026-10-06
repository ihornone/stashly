import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ItemRepository } from '@/server/repositories/items';
import { withTokenRoute, v1Preflight, v1Error } from '@/server/api';
import { processInputTags } from '@/server/tagUtils';

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

const patchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  url: urlSchema.optional(),
  description: z.string().optional(),
  comments: z.string().optional(),
  image: z.string().optional(),
  tags: z.array(z.union([z.number(), z.string()])).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function resolveId(context: RouteContext): Promise<number | null> {
  const { id } = await context.params;
  const numId = parseInt(id, 10);
  return Number.isFinite(numId) && numId > 0 ? numId : null;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const id = await resolveId(context);
  if (!id) {
    return v1Error('invalid_id', 'Item ID must be a positive integer', 422);
  }
  return withTokenRoute(req, 'items:read', null, async ({ userId }) => {
    const item = await ItemRepository.getItemById(id, userId);
    if (!item) {
      return { status: 404, body: { error: { code: 'not_found', message: 'Item not found' } } };
    }
    return { body: { data: item } };
  });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const id = await resolveId(context);
  if (!id) {
    return v1Error('invalid_id', 'Item ID must be a positive integer', 422);
  }
  return withTokenRoute(req, 'items:write', patchSchema, async ({ userId, body }) => {
    const existing = await ItemRepository.getItemById(id, userId);
    if (!existing) {
      return { status: 404, body: { error: { code: 'not_found', message: 'Item not found' } } };
    }

    const title = body.title ?? existing.title;
    const url = body.url ?? existing.url;
    const description = body.description ?? existing.description ?? '';
    const comments = body.comments ?? existing.comments ?? '';
    const image = body.image ?? existing.image ?? '';
    const tagIds = body.tags !== undefined ? await processInputTags(body.tags, userId) : existing.tags || [];

    const updated = await ItemRepository.updateItem(
      { id, title, url, description, comments, image, tags: tagIds },
      userId
    );
    if (!updated) {
      return { status: 404, body: { error: { code: 'not_found', message: 'Item not found' } } };
    }

    const item = await ItemRepository.getItemById(id, userId);
    return { body: { data: item } };
  });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const id = await resolveId(context);
  if (!id) {
    return v1Error('invalid_id', 'Item ID must be a positive integer', 422);
  }
  return withTokenRoute(req, 'items:write', null, async ({ userId }) => {
    const deleted = await ItemRepository.deleteItems([id], userId);
    if (!deleted) {
      return { status: 404, body: { error: { code: 'not_found', message: 'Item not found' } } };
    }
    return { body: { data: { id, deleted: true } } };
  });
}

export async function OPTIONS() {
  return v1Preflight();
}
