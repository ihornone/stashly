import { NextRequest } from 'next/server';
import { withAuthRoute } from '@/server/api';
import { successResponse, errorResponse } from '@/server/auth';
import { TelegramRepository } from '@/server/repositories/telegram';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withAuthRoute(req, null, async ({ userId }) => {
    const status = await TelegramRepository.getTelegramStatus(userId);
    return successResponse('Telegram status retrieved', status);
  });
}

export async function POST(req: NextRequest) {
  return withAuthRoute(req, null, async ({ userId }) => {
    const linkData = await TelegramRepository.generateLinkToken(userId);
    return successResponse('Telegram link token generated', linkData);
  });
}

export async function DELETE(req: NextRequest) {
  return withAuthRoute(req, null, async ({ userId }) => {
    await TelegramRepository.unlinkTelegramAccount(userId);
    return successResponse('Telegram account unlinked');
  });
}
