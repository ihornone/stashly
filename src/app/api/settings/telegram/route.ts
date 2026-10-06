import { withAuthRoute } from '@/server/api';
import { successResponse, errorResponse } from '@/server/auth';
import { TelegramRepository } from '@/server/repositories/telegram';

export const dynamic = 'force-dynamic';

export async function GET() {
  return withAuthRoute(null, null, async ({ userId }) => {
    const status = await TelegramRepository.getTelegramStatus(userId);
    return successResponse('Telegram status retrieved', status);
  });
}

export async function POST() {
  return withAuthRoute(null, null, async ({ userId }) => {
    const linkData = await TelegramRepository.generateLinkToken(userId);
    return successResponse('Telegram link token generated', linkData);
  });
}

export async function DELETE() {
  return withAuthRoute(null, null, async ({ userId }) => {
    await TelegramRepository.unlinkTelegramAccount(userId);
    return successResponse('Telegram account unlinked');
  });
}
