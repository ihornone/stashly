import { NextRequest } from 'next/server';
import { ShareRepository } from '@/server/repositories/shares';
import { jsonResponse, errorResponse } from '@/server/auth';
import { getAuthenticatedUserId } from '@/server/auth';
import { checkPublicRateLimit } from '@/server/rateLimit';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const rate = checkPublicRateLimit(`share:${id}`);
  if (!rate.allowed) {
    return errorResponse('Too many requests', 429);
  }

  const data = await ShareRepository.getSharedTagWithItems(id);
  if (!data) {
    return errorResponse('Category not found', 404);
  }

  let comparison: unknown = null;
  try {
    const userId = await getAuthenticatedUserId();
    comparison = await ShareRepository.checkSharedTagComparison(id, userId);
  } catch {
    // Not authenticated — comparison stays null
  }

  return jsonResponse({
    tag: data.tag,
    items: data.items,
    allTags: data.allTags,
    count: data.items.length,
    comparison,
  });
}
