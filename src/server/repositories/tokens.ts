import { createHash, randomBytes } from 'crypto';
import { getD1Database } from '../db';

/**
 * Personal Access Tokens for the public REST API (/api/v1).
 *
 * Format: `st__` + 43 base64url chars (32 random bytes), e.g.
 *   st__Kj8f2mQ0x7vBnR4pLz9cWd3sYh6tG1uE5oAiM0bXNqC
 *
 * Only a SHA-256 hash of the token is stored — the plaintext is shown once
 * at creation time and never persisted.
 */

export const TOKEN_PREFIX = 'st__';

export const API_SCOPES = [
  'items:read',
  'items:write',
  'tags:read',
  'tags:write',
  'share:write',
  'tokens:manage',
] as const;

export type ApiScope = (typeof API_SCOPES)[number];

export interface ApiTokenRow {
  id: number;
  user_id: number;
  name: string;
  token_hash: string;
  token_prefix: string;
  scopes: string;
  last_used_at: string | null;
  created_at: string | null;
  revoked_at: string | null;
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function generateApiToken(): { token: string; tokenHash: string; tokenPrefix: string } {
  const bytes = randomBytes(32);
  // base64url: 32 bytes -> 43 chars, URL-safe
  const randomPart = bytes.toString('base64url');
  const token = `${TOKEN_PREFIX}${randomPart}`;
  return {
    token,
    tokenHash: hashToken(token),
    // Short display prefix, e.g. "st__Kj8f2mQ0…"
    tokenPrefix: `${TOKEN_PREFIX}${randomPart.slice(0, 8)}`,
  };
}

export function parseScopes(rawScopes: string): ApiScope[] {
  return rawScopes
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is ApiScope => (API_SCOPES as readonly string[]).includes(s));
}

export function validateScopeSelection(scopes: string[]): ApiScope[] | null {
  if (!Array.isArray(scopes) || scopes.length === 0) return null;
  const valid = scopes.filter((s): s is ApiScope => (API_SCOPES as readonly string[]).includes(s));
  return valid.length === scopes.length ? valid : null;
}

export function formatTokenMask(tokenPrefix: string): string {
  return `${tokenPrefix}••••••••`;
}

export class ApiTokenRepository {
  static async create(
    userId: number,
    name: string,
    scopes: ApiScope[],
    token: { tokenHash: string; tokenPrefix: string }
  ): Promise<number> {
    const db = getD1Database();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const res = await db
      .prepare(
        'INSERT INTO api_tokens (user_id, name, token_hash, token_prefix, scopes, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(userId, name, token.tokenHash, token.tokenPrefix, scopes.join(','), now)
      .run();
    return res.meta.last_row_id;
  }

  static async listByUser(userId: number, includeRevoked = false): Promise<ApiTokenRow[]> {
    const db = getD1Database();
    const res = await db
      .prepare(
        `SELECT id, user_id, name, token_prefix, scopes, last_used_at, created_at, revoked_at
         FROM api_tokens WHERE user_id = ? ${includeRevoked ? '' : 'AND revoked_at IS NULL'}
         ORDER BY id DESC`
      )
      .bind(userId)
      .all<ApiTokenRow>();
    return res.results || [];
  }

  /** Full row lookup by the token hash (includes revoked tokens for accurate 401s). */
  static async findByHash(tokenHash: string): Promise<ApiTokenRow | null> {
    const db = getD1Database();
    return await db
      .prepare('SELECT * FROM api_tokens WHERE token_hash = ?')
      .bind(tokenHash)
      .first<ApiTokenRow>();
  }

  static async revoke(id: number, userId: number): Promise<boolean> {
    const db = getD1Database();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const res = await db
      .prepare('UPDATE api_tokens SET revoked_at = ? WHERE id = ? AND user_id = ? AND revoked_at IS NULL')
      .bind(now, id, userId)
      .run();
    return res.meta.changes > 0;
  }

  private static async touchLastUsed(id: number) {
    const db = getD1Database();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await db.prepare('UPDATE api_tokens SET last_used_at = ? WHERE id = ?').bind(now, id).run();
  }

  /**
   * Resolves a plaintext bearer token into its row. Returns null when the
   * token is unknown or revoked. Updates last_used_at at most once per hour.
   */
  static async resolveBearer(bearerToken: string): Promise<ApiTokenRow | null> {
    if (!bearerToken.startsWith(TOKEN_PREFIX)) return null;
    const row = await this.findByHash(hashToken(bearerToken));
    if (!row || row.revoked_at) return null;

    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    if (!row.last_used_at || new Date(row.last_used_at + 'Z').getTime() < oneHourAgo) {
      await this.touchLastUsed(row.id).catch(() => {});
    }
    return row;
  }
}
