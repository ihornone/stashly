import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ShareRepository } from '@/server/repositories/shares';
import { withAuthRoute } from '@/server/api';
import { jsonResponse } from '@/server/auth';

const shareSchema = z.object({
  tagId: z.coerce.number().int().positive(),
  action: z.enum(['enable', 'disable', 'regenerate']).optional(),
});

export async function POST(req: NextRequest) {
  return withAuthRoute(req, shareSchema, async ({ userId, body }) => {
    const { tagId, action } = body;

    if (action === 'disable') {
      await ShareRepository.disableTagShare(tagId, userId);
      return jsonResponse({ success: true, share_id: null, isShared: false });
    }

    if (action === 'regenerate') {
      const newShareId = await ShareRepository.regenerateTagShareId(tagId, userId);
      return jsonResponse({ success: true, share_id: newShareId, isShared: true });
    }

    if (action === 'enable') {
      const shareId = await ShareRepository.ensureTagShareId(tagId, userId);
      return jsonResponse({ success: true, share_id: shareId, isShared: !!shareId });
    }

    // Default ensure active share_id
    const shareId = await ShareRepository.ensureTagShareId(tagId, userId);
    return jsonResponse({ success: true, share_id: shareId, isShared: !!shareId });
  });
}
