import { getD1Database, checkDatabaseExists, seedInitialDataForUser } from '../db';
import { User } from './types';

export class UserRepository {
  static async getUserByClerkId(clerkId: string): Promise<User | null> {
    const exists = await checkDatabaseExists();
    if (!exists) return null;
    const db = getD1Database();
    return await db.prepare('SELECT * FROM users WHERE clerk_id = ?').bind(clerkId).first<User>();
  }

  static async createClerkUser(clerkId: string, username: string, email: string): Promise<User> {
    const db = getD1Database();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const res = await db
      .prepare(
        'INSERT INTO users (clerk_id, email, username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(clerkId, email || '', username, '', now, now)
      .run();
    const newUserId = res.meta.last_row_id;
    await seedInitialDataForUser(db, newUserId);
    return {
      id: newUserId,
      clerk_id: clerkId,
      email,
      username,
      password_hash: '',
      created_at: now,
      updated_at: now,
    };
  }

  static async updateUserPreferences(id: number, preferences: string) {
    const db = getD1Database();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await db
      .prepare('UPDATE users SET preferences = ?, updated_at = ? WHERE id = ?')
      .bind(preferences, now, id)
      .run();
  }
}
