import type DatabaseType from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { logger } from '@/lib/logger';

/**
 * Cloudflare D1 Emulation Layer & Driver Interface
 * Compatible with standard Cloudflare D1Database API:
 * - db.prepare(query).bind(...args).all()
 * - db.prepare(query).bind(...args).first()
 * - db.prepare(query).bind(...args).run()
 * - db.exec(query)
 * - db.batch(statements)
 */

export interface D1Result<T = any> {
  results?: T[];
  success: boolean;
  meta?: any;
  error?: string;
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  all<T = any>(): Promise<D1Result<T>>;
  first<T = any>(colName?: string): Promise<T | null>;
  run(): Promise<{ success: boolean; meta: { last_row_id: number; changes: number } }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<{ count: number; duration: number }>;
  batch<T = any>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT NOT NULL,
    comments TEXT NOT NULL,
    image TEXT NOT NULL,
    created_at TEXT DEFAULT(NULL),
    updated_at TEXT DEFAULT(NULL)
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    color TEXT NOT NULL,
    parent INTEGER NOT NULL DEFAULT 0,
    pinned INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT(NULL),
    updated_at TEXT DEFAULT(NULL)
  );

  CREATE TABLE IF NOT EXISTS items_tags (
    item_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (item_id, tag_id)
  );

  CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    theme TEXT NOT NULL DEFAULT 'system',
    dark_theme TEXT NOT NULL DEFAULT 'dark',
    light_theme TEXT NOT NULL DEFAULT 'light',
    density TEXT NOT NULL DEFAULT 'comfortable',
    columns INTEGER NOT NULL DEFAULT 3,
    display_view TEXT NOT NULL DEFAULT 'grid',
    sort_by TEXT NOT NULL DEFAULT 'created_at',
    sort_order TEXT NOT NULL DEFAULT 'desc',
    group_by TEXT NOT NULL DEFAULT 'none',
    show_images INTEGER NOT NULL DEFAULT 1,
    show_descriptions INTEGER NOT NULL DEFAULT 1,
    show_tags INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT(NULL),
    updated_at TEXT DEFAULT(NULL)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    clerk_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TEXT DEFAULT(NULL),
    updated_at TEXT DEFAULT(NULL),
    telegram_chat_id TEXT,
    telegram_user_id TEXT,
    telegram_username TEXT,
    telegram_link_token TEXT,
    telegram_link_expires_at TEXT
  );

  CREATE TABLE IF NOT EXISTS tag_shares (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    share_id TEXT NOT NULL UNIQUE,
    tag_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT(NULL),
    expires_at TEXT DEFAULT(NULL)
  );

  CREATE TABLE IF NOT EXISTS api_tokens (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    token_prefix TEXT NOT NULL,
    scopes TEXT NOT NULL DEFAULT 'items:read,items:write,tags:read,tags:write',
    last_used_at TEXT DEFAULT(NULL),
    created_at TEXT DEFAULT(NULL)
  );

  CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
  CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
  CREATE INDEX IF NOT EXISTS idx_tags_parent ON tags(parent);
  CREATE INDEX IF NOT EXISTS idx_items_tags_tag_id ON items_tags(tag_id);
  CREATE INDEX IF NOT EXISTS idx_items_tags_item_id ON items_tags(item_id);
  CREATE INDEX IF NOT EXISTS idx_tag_shares_tag_id ON tag_shares(tag_id);
`;

const MIGRATIONS = [
  'ALTER TABLE items ADD COLUMN is_favorite INTEGER NOT NULL DEFAULT 0;',
  'ALTER TABLE items ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0;',
  'ALTER TABLE items ADD COLUMN is_broken INTEGER NOT NULL DEFAULT 0;',
  'ALTER TABLE items ADD COLUMN click_count INTEGER NOT NULL DEFAULT 0;',
  'ALTER TABLE items ADD COLUMN item_type TEXT NOT NULL DEFAULT "link";',
  'ALTER TABLE items ADD COLUMN favicon TEXT DEFAULT NULL;',
  'ALTER TABLE users ADD COLUMN telegram_chat_id TEXT;',
  'ALTER TABLE users ADD COLUMN telegram_user_id TEXT;',
  'ALTER TABLE users ADD COLUMN telegram_username TEXT;',
  'ALTER TABLE users ADD COLUMN telegram_link_token TEXT;',
  'ALTER TABLE users ADD COLUMN telegram_link_expires_at TEXT;',
  'CREATE INDEX IF NOT EXISTS idx_items_type ON items(item_type);',
  'CREATE INDEX IF NOT EXISTS idx_items_favorite ON items(is_favorite);',
  'CREATE INDEX IF NOT EXISTS idx_items_archived ON items(is_archived);',
  'CREATE INDEX IF NOT EXISTS idx_items_broken ON items(is_broken);',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_telegram_chat_id ON users(telegram_chat_id);',
  'CREATE INDEX IF NOT EXISTS idx_users_telegram_token ON users(telegram_link_token);',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_api_tokens_hash ON api_tokens(token_hash);',
  'CREATE INDEX IF NOT EXISTS idx_api_tokens_user_id ON api_tokens(user_id);',
];

export class LocalD1Database implements D1Database {
  private sqlite: DatabaseType.Database;

  constructor(dbPath: string) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    this.sqlite = new Database(dbPath);
    this.sqlite.pragma('journal_mode = WAL');
    this.sqlite.pragma('foreign_keys = ON');

    this.sqlite.exec(SCHEMA_SQL);

    const runSafe = (sql: string) => {
      try {
        this.sqlite.exec(sql);
      } catch {
        // Column/index already exists — expected on every boot after the first
      }
    };
    for (const migration of MIGRATIONS) {
      runSafe(migration);
    }
  }

  prepare(query: string): D1PreparedStatement {
    return new LocalD1PreparedStatement(this.sqlite, query);
  }

  async exec(query: string): Promise<{ count: number; duration: number }> {
    const start = Date.now();
    this.sqlite.exec(query);
    return { count: 1, duration: Date.now() - start };
  }

  async batch<T = any>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    const results: D1Result<T>[] = [];
    const runBatch = this.sqlite.transaction(() => {
      for (const stmt of statements) {
        const localStmt = stmt as LocalD1PreparedStatement;
        const res = localStmt.executeInternal();
        if (!res.success) {
          throw new Error(res.error || 'Batch statement failed');
        }
        results.push(res);
      }
    });
    runBatch();
    return results;
  }
}

class LocalD1PreparedStatement implements D1PreparedStatement {
  private values: any[] = [];

  constructor(private db: DatabaseType.Database, private sql: string) {}

  bind(...values: any[]): D1PreparedStatement {
    const clone = new LocalD1PreparedStatement(this.db, this.sql);
    clone.values = values;
    return clone;
  }

  private executeQuery(): { rows?: any[]; info?: { lastInsertRowid: number | bigint; changes: number } } {
    const stmt = this.db.prepare(this.sql);
    const isRead = /^(SELECT|PRAGMA)/i.test(this.sql.trim());
    if (isRead) {
      return { rows: stmt.all(...this.values) };
    }
    return { info: stmt.run(...this.values) as { lastInsertRowid: number | bigint; changes: number } };
  }

  executeInternal(): D1Result {
    try {
      const { rows, info } = this.executeQuery();
      if (rows) {
        return { success: true, results: rows };
      }
      return {
        success: true,
        meta: { last_row_id: Number(info!.lastInsertRowid), changes: info!.changes },
      };
    } catch (err: any) {
      logger.error({ event: 'db_query_failed', sql: this.sql.trim().slice(0, 120), error: err.message });
      return { success: false, error: err.message };
    }
  }

  async all<T = any>(): Promise<D1Result<T>> {
    try {
      const stmt = this.db.prepare(this.sql);
      const rows = stmt.all(...this.values) as T[];
      return { success: true, results: rows };
    } catch (err: any) {
      logger.error({ event: 'db_query_failed', sql: this.sql.trim().slice(0, 120), error: err.message });
      return { success: false, error: err.message, results: [] };
    }
  }

  async first<T = any>(colName?: string): Promise<T | null> {
    try {
      const stmt = this.db.prepare(this.sql);
      const row = stmt.get(...this.values) as any;
      if (!row) return null;
      if (colName) return row[colName] ?? null;
      return row as T;
    } catch (err: any) {
      logger.error({ event: 'db_query_failed', sql: this.sql.trim().slice(0, 120), error: err.message });
      return null;
    }
  }

  async run(): Promise<{ success: boolean; meta: { last_row_id: number; changes: number } }> {
    const stmt = this.db.prepare(this.sql);
    const info = stmt.run(...this.values);
    return {
      success: true,
      meta: {
        last_row_id: Number(info.lastInsertRowid),
        changes: info.changes,
      },
    };
  }
}

let d1Instance: D1Database | null = null;

export function getStorageDir(): string {
  const dir = path.join(process.cwd(), 'storage');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getImageStorageDir(): string {
  const dir = path.join(getStorageDir(), 'images');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getWorkerD1(): D1Database | null {
  try {
    const cfGlobal = (globalThis as any)[Symbol.for('__cloudflare-context__')];
    if (cfGlobal?.env?.DB) {
      return cfGlobal.env.DB as D1Database;
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const ctx = getCloudflareContext();
    if (ctx?.env?.DB) {
      return ctx.env.DB as D1Database;
    }
  } catch (err: any) {
    logger.warn({ event: 'get_worker_d1_not_in_context', error: err?.message });
  }
  return null;
}

export function getD1Database(): D1Database {
  const workerDb = getWorkerD1();
  if (workerDb) {
    return workerDb;
  }

  if (!d1Instance) {
    const dbPath = path.join(getStorageDir(), 'database.sqlite');
    d1Instance = new LocalD1Database(dbPath);
  }
  return d1Instance;
}

export async function checkDatabaseExists(): Promise<boolean> {
  try {
    const db = getD1Database();
    const row = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='items'").first();
    return !!row;
  } catch {
    return false;
  }
}

export async function seedInitialDataForUser(db: D1Database, userId: number) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Check if docs tag already exists for this user
  const existingDocs = await db
    .prepare('SELECT id FROM tags WHERE title = ? AND user_id = ?')
    .bind('Documentation', userId)
    .first();
  if (existingDocs) return;

  const docsRes = await db
    .prepare(
      'INSERT INTO tags (user_id, title, description, color, parent, pinned, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(userId, 'Documentation', 'Documentation and Guides', '#155EEF', 0, 1, now, now)
    .run();
  const docsId = docsRes.meta.last_row_id;

  const gettingStartedRes = await db
    .prepare(
      'INSERT INTO tags (user_id, title, description, color, parent, pinned, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(userId, 'Getting Started', 'Getting Started with Stashly', '#155EEF', docsId, 1, now, now)
    .run();
  const gettingStartedId = gettingStartedRes.meta.last_row_id;

  const guidesRes = await db
    .prepare(
      'INSERT INTO tags (user_id, title, description, color, parent, pinned, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(userId, 'Guides', 'Stashly Feature Guides', '#155EEF', docsId, 0, now, now)
    .run();
  const guidesId = guidesRes.meta.last_row_id;

  const seedItems = [
    {
      url: '/docs/getting-started/installing-as-a-pwa-app',
      title: 'Installing as a PWA app',
      description: 'Install Stashly on iOS, Android, macOS or Windows for a lightning-fast, native app experience.',
      image: '/favicons/icon-512x512.png',
      tagId: gettingStartedId,
    },
    {
      url: '/docs/getting-started/using-browser-bookmarklet',
      title: 'Using browser bookmarklet',
      description: 'Save any web page to your Stashly collection in one click from Chrome, Safari, Firefox, Edge or Arc.',
      image: '/favicons/icon-512x512.png',
      tagId: gettingStartedId,
    },
    {
      url: '/docs/getting-started/saving-with-apple-shortcut',
      title: 'Saving with Apple shortcut',
      description: 'Save links to Stashly directly from the iOS Share Sheet and macOS Services menu.',
      image: '/favicons/icon-512x512.png',
      tagId: gettingStartedId,
    },
    {
      url: '/docs/guides/adding-and-editing-bookmarks',
      title: 'Adding and editing bookmarks',
      description: 'Learn how to add, organise, tag, edit, and bulk-manage your bookmarks in Stashly.',
      image: '/favicons/icon-512x512.png',
      tagId: guidesId,
    },
  ];

  for (const item of seedItems) {
    const res = await db
      .prepare(
        'INSERT INTO items (user_id, title, description, url, comments, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(userId, item.title, item.description, item.url, '', item.image, now, now)
      .run();
    const itemId = res.meta.last_row_id;

    await db
      .prepare('INSERT INTO items_tags (item_id, tag_id) VALUES (?, ?)')
      .bind(itemId, item.tagId)
      .run();
  }
}
