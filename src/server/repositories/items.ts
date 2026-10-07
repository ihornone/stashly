import { getD1Database, checkDatabaseExists } from '../db';
import { ItemRow, safeDecodeURI, safeEncodeURI } from './types';
import { TagRepository } from './tags';

export class ItemRepository {
  static async getItems(userId: number): Promise<ItemRow[]> {
    const exists = await checkDatabaseExists();
    if (!exists) return [];
    const db = getD1Database();
    const itemsTags = await TagRepository.getItemsTags(userId);
    const res = await db
      .prepare('SELECT * FROM items WHERE user_id = ? ORDER BY id DESC')
      .bind(userId)
      .all<ItemRow>();
    const rows = res.results || [];
    return rows.map((r) => ({
      ...r,
      url: safeDecodeURI(r.url || ''),
      image: safeDecodeURI(r.image || ''),
      tags: itemsTags[r.id] || [],
    }));
  }

  /**
   * Paginated, filtered item list for the public API.
   * `q` performs a substring search over title/description/url/comments,
   * `tagId` filters to items linked to that exact tag.
   */
  static async getItemsPage(
    userId: number,
    opts: { page?: number; perPage?: number; q?: string; tagId?: number } = {}
  ): Promise<{ items: ItemRow[]; total: number }> {
    const exists = await checkDatabaseExists();
    if (!exists) return { items: [], total: 0 };

    const page = Math.max(1, opts.page ?? 1);
    const perPage = Math.min(200, Math.max(1, opts.perPage ?? 50));
    const offset = (page - 1) * perPage;

    const where: string[] = ['i.user_id = ?'];
    const params: unknown[] = [userId];

    if (opts.q) {
      const like = `%${opts.q.replace(/[%_]/g, (c) => `\\${c}`)}%`;
      where.push(
        `(i.title LIKE ? ESCAPE '\\' OR i.description LIKE ? ESCAPE '\\' OR i.url LIKE ? ESCAPE '\\' OR i.comments LIKE ? ESCAPE '\\')`
      );
      params.push(like, like, like, like);
    }
    if (opts.tagId) {
      where.push(`i.id IN (SELECT item_id FROM items_tags WHERE tag_id = ?)`);
      params.push(opts.tagId);
    }

    const db = getD1Database();
    const whereSql = where.join(' AND ');

    const countRes = await db
      .prepare(`SELECT COUNT(*) as count FROM items i WHERE ${whereSql}`)
      .bind(...params)
      .first<{ count: number }>();
    const total = countRes?.count ?? 0;

    const itemsTags = await TagRepository.getItemsTags(userId);
    const res = await db
      .prepare(`SELECT i.* FROM items i WHERE ${whereSql} ORDER BY i.id DESC LIMIT ? OFFSET ?`)
      .bind(...params, perPage, offset)
      .all<ItemRow>();

    return {
      items: (res.results || []).map((r) => ({
        ...r,
        url: safeDecodeURI(r.url || ''),
        image: safeDecodeURI(r.image || ''),
        tags: itemsTags[r.id] || [],
      })),
      total,
    };
  }

  static async getItemById(id: number, userId: number): Promise<ItemRow | null> {
    const exists = await checkDatabaseExists();
    if (!exists) return null;
    const db = getD1Database();
    const row = await db
      .prepare('SELECT * FROM items WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .first<ItemRow>();
    if (!row) return null;
    const itemsTags = await TagRepository.getItemsTags(userId);
    return {
      ...row,
      url: safeDecodeURI(row.url || ''),
      image: safeDecodeURI(row.image || ''),
      tags: itemsTags[row.id] || [],
    };
  }

  static async createItem(
    item: {
      title: string;
      description: string;
      url: string;
      comments: string;
      image: string;
      tags: number[];
    },
    userId: number
  ): Promise<number> {
    const db = getD1Database();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const res = await db
      .prepare(
        'INSERT INTO items (user_id, title, description, url, comments, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        userId,
        item.title,
        item.description || '',
        safeEncodeURI(item.url),
        item.comments || '',
        safeEncodeURI(item.image || ''),
        now,
        now
      )
      .run();
    const itemId = res.meta.last_row_id;
    if (item.tags && item.tags.length > 0) {
      await TagRepository.attachItemsTags([itemId], item.tags, userId);
    }
    return itemId;
  }

  /**
   * Updates one owned item and replaces its tag links.
   * Returns false when the item does not exist or belongs to another user.
   */
  static async updateItem(
    item: {
      id: number;
      title: string;
      description: string;
      url: string;
      comments: string;
      image: string;
      tags: number[];
    },
    userId: number
  ): Promise<boolean> {
    const db = getD1Database();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const res = await db
      .prepare(
        'UPDATE items SET title = ?, description = ?, url = ?, comments = ?, image = ?, updated_at = ? WHERE id = ? AND user_id = ?'
      )
      .bind(
        item.title,
        item.description || '',
        safeEncodeURI(item.url),
        item.comments || '',
        safeEncodeURI(item.image || ''),
        now,
        item.id,
        userId
      )
      .run();

    if (res.meta.changes === 0) {
      return false;
    }

    if (item.tags !== undefined) {
      await TagRepository.setItemTags(item.tags, item.id, userId);
    }
    return true;
  }

  static async deleteItems(ids: number[], userId: number) {
    if (ids.length === 0) return false;
    const db = getD1Database();
    const placeholders = ids.map(() => '?').join(',');
    const res = await db
      .prepare(`DELETE FROM items WHERE id IN (${placeholders}) AND user_id = ?`)
      .bind(...ids, userId)
      .run();
    return res.meta.changes > 0;
  }

  static async updateItemsMetadata(
    title: string,
    description: string,
    image: string,
    itemIds: number[],
    userId: number
  ) {
    if (itemIds.length === 0) return false;
    const db = getD1Database();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const placeholders = itemIds.map(() => '?').join(',');
    await db
      .prepare(
        `UPDATE items SET title = ?, description = ?, image = ?, updated_at = ? WHERE id IN (${placeholders}) AND user_id = ?`
      )
      .bind(title, description, safeEncodeURI(image || ''), now, ...itemIds, userId)
      .run();
    return true;
  }

  /**
   * Re-scrapes metadata for the given owned items, preserving existing values
   * when a scrape yields nothing.
   */
  static async refetchItemsMetadata(ids: number[], userId: number): Promise<boolean> {
    if (ids.length === 0) return false;
    const { scrapeUrlMetadata } = await import('../scraper');
    const db = getD1Database();
    const placeholders = ids.map(() => '?').join(',');
    const itemsRes = await db
      .prepare(`SELECT * FROM items WHERE id IN (${placeholders}) AND user_id = ?`)
      .bind(...ids, userId)
      .all<ItemRow>();
    const items = itemsRes.results || [];
    for (const it of items) {
      const decodedUrl = safeDecodeURI(it.url);
      const meta = await scrapeUrlMetadata(decodedUrl);
      const updatedTitle = meta.title || it.title;
      const updatedDesc = meta.description || it.description;
      const updatedImg = meta.image || it.image;
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      await db
        .prepare(
          'UPDATE items SET title = ?, description = ?, image = ?, updated_at = ? WHERE id = ? AND user_id = ?'
        )
        .bind(updatedTitle, updatedDesc, safeEncodeURI(updatedImg || ''), now, it.id, userId)
        .run();
    }
    return true;
  }
}
