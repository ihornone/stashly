import { NextResponse } from 'next/server';
import { User } from './repositories/types';
import { UserRepository } from './repositories/users';
import { auth, currentUser } from '@clerk/nextjs/server';
import { AuthenticationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export class AuthError extends AuthenticationError {
  constructor(message = 'Потрібна авторизація') {
    super(message);
    this.name = 'AuthError';
  }
}

export function jsonResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export function successResponse(message: string, data: any = {}, status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(message: string, status = 400, details?: any) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

/**
 * Retrieves the authenticated user from Clerk.
 * If this is the user's first time signing in/registering,
 * it automatically creates the user row in the database
 * and seeds initial documentation categories and cards in SQLite DB.
 * Returns null if not authenticated.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return null;
    }

    let user = await UserRepository.getUserByClerkId(clerkId);
    if (!user) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress || '';
      const username =
        clerkUser?.username ||
        clerkUser?.firstName ||
        email.split('@')[0] ||
        `user_${clerkId.slice(-6)}`;
      user = await UserRepository.createClerkUser(clerkId, username, email);
    }
    return user;
  } catch (err) {
    logger.error({ event: 'auth_failed', error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

export async function getAuthenticatedUserId(): Promise<number> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new AuthError();
  }
  return user.id;
}
