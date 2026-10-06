import { NextRequest } from 'next/server';
import { z } from 'zod';
import { UserRepository } from '@/server/repositories/users';
import { withAuthRoute } from '@/server/api';
import { successResponse, errorResponse, getAuthenticatedUser } from '@/server/auth';

const preferencesSchema = z.object({
  includeNestedTagItems: z.boolean().optional(),
  displaySidebarTagItemCounts: z.boolean().optional(),
  accentColor: z.string().max(32).optional(),
});

function parsePrefs(raw: string | null | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function GET(req: NextRequest) {
  return withAuthRoute(req, null, async ({ userId }) => {
    const user = await getAuthenticatedUser();
    return successResponse('Preferences retrieved successfully.', {
      preferences: parsePrefs(user?.preferences),
    });
  });
}

export async function POST(req: NextRequest) {
  return withAuthRoute(req, preferencesSchema, async ({ userId, body }) => {
    const user = await getAuthenticatedUser();
    if (!user) {
      return successResponse('Preferences updated successfully.', { preferences: body });
    }

    const updatedPrefs = { ...parsePrefs(user.preferences), ...body };
    await UserRepository.updateUserPreferences(userId, JSON.stringify(updatedPrefs));

    return successResponse('Preferences updated successfully.', { preferences: updatedPrefs });
  });
}
