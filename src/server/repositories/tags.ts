import { getD1Database, checkDatabaseExists, D1PreparedStatement } from '../db';
import { TagRow } from './types';

export interface ApiTagRow extends TagRow {
  fullPath: string;
  fullPathIDs: string;
}

export class TagRepository {
  static async getTags(userId: number): Promise<Record<number, TagRow>> {
    const exists = await checkDatabaseExists();
    if (!exists) return {};
    const db = getD1Database();
    const res = await db
      .prepare('SELECT * FROM tags WHERE user_id = ? ORDER BY title ASC')
      .bind(userId)
      .all<TagRow>();
    const rows = res.results || [];
    const result: Record<number, TagRow> = {};
    for (const row of rows) {
      result[row.id] = {
        ...row,
        share_id: row.share_id || '',
        pinned: Number(row.pinned),
        parent: Number(row.parent),
      };
    }
    return result;
  }

  static async getItemsTags(userId: number): Promise<Record<number, number[]>> {    const exists = await checkDatabaseExists();
    if (!exists) return {};
    const db = getD1Database();
    const res = await db
      .prepare(
        'SELECT it.item_id, it.tag_id FROM items_tags it JOIN items i ON i.id = it.item_id WHERE i.user_id = ? ORDER BY it.tag_id ASC'
      )
      .bind(userId)
      .all<{ item_id: number; tag_id: number }>();
    const rows = res.results || [];
    const map: Record<number, number[]> = {};
    for (const r of rows) {
      if (!map[r.item_id]) map[r.item_id] = [];
      map[r.item_id].push(r.tag_id);
    }
    return map;
  }

  /**
   * Returns true if `candidateId` is `rootId` itself or one of its descendants.
   * Guarded against cycles via a visited set.
   */
  static async isDescendantOrSelf(rootId: number, candidateId: number, userId: number): Promise<boolean> {
    const allTags = await this.getTags(userId);
    const visited = new Set<number>([rootId]);
    const stack = [rootId];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === candidateId) return true;
      for (const t of Object.values(allTags)) {
        if (t.parent === current && !visited.has(t.id)) {
          visited.add(t.id);
          stack.push(t.id);
        }
      }
    }
    return false;
  }

  /** Flat tag array with computed hierarchy paths — friendlier for API consumers. */
  static async getTagsArray(userId: number): Promise<ApiTagRow[]> {
    const tagsMap = await this.getTags(userId);
    const computePath = (tag: TagRow): { fullPath: string; fullPathIDs: string } => {
      let fullPath = '';
      let fullPathIDs = '';
      if (tag.parent !== 0) {
        const parentTag = tagsMap[tag.parent];
        if (parentTag) {
          const parentPath = computePath(parentTag);
          fullPath += parentPath.fullPath + '/';
          fullPathIDs += parentPath.fullPathIDs + '/';
        }
      }
      fullPath += tag.title.replaceAll('/', '\\/');
      fullPathIDs += String(tag.id);
      return { fullPath, fullPathIDs };
    };

    const result: ApiTagRow[] = [];
    for (const tag of Object.values(tagsMap)) {
      // Cycle guard: an ill-formed hierarchy must not hang the walk
      const visited = new Set<number>([tag.id]);
      let current = tag;
      let safe = true;
      while (current.parent !== 0) {
        const parentTag = tagsMap[current.parent];
        if (!parentTag || visited.has(parentTag.id)) {
          safe = false;
          break;
        }
        visited.add(parentTag.id);
        current = parentTag;
      }
      if (!safe) continue;
      const { fullPath, fullPathIDs } = computePath(tag);
      result.push({ ...tag, fullPath, fullPathIDs });
    }
    result.sort((a, b) => a.fullPath.localeCompare(b.fullPath));
    return result;
  }

  static async createTag(
    title: string,
    description: string = '',
    parent: number = 0,
    userId: number,
    color?: string
  ): Promise<number> {
    const db = getD1Database();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const existing = await db
      .prepare('SELECT id FROM tags WHERE LOWER(title) = LOWER(?) AND parent = ? AND user_id = ?')
      .bind(title, parent, userId)
      .first<{ id: number }>();

    if (existing) {
      if (color !== undefined && color !== '') {
        await this.updateTagColor(existing.id, color, userId);
      }
      return existing.id;
    }

    let initialColor = color || '';
    if (!initialColor && parent !== 0) {
      const allTags = await this.getTags(userId);
      const visited = new Set<number>([parent]);
      let curr = allTags[parent];
      while (curr && curr.parent !== 0 && allTags[curr.parent] && !visited.has(curr.parent)) {
        visited.add(curr.parent);
        curr = allTags[curr.parent];
      }
      if (curr) initialColor = curr.color || '';
    }

    const res = await db
      .prepare(
        'INSERT INTO tags (user_id, title, description, color, parent, pinned, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(userId, title, description, initialColor, parent, 0, now, now)
      .run();
    return res.meta.last_row_id;
  }

  static async updateTag(
    id: number,
    title: string,
    description: string,
    parent: number,
    userId: number,
    color?: string
  ) {
    const db = getD1Database();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (color !== undefined && color !== '') {
      await db
        .prepare(
          'UPDATE tags SET title = ?, description = ?, parent = ?, color = ?, updated_at = ? WHERE id = ? AND user_id = ?'
        )
        .bind(title, description, parent, color, now, id, userId)
        .run();
    } else {
      await db
        .prepare(
          'UPDATE tags SET title = ?, description = ?, parent = ?, updated_at = ? WHERE id = ? AND user_id = ?'
        )
        .bind(title, description, parent, now, id, userId)
        .run();
    }
  }

  static async updateTagColor(id: number, color: string, userId: number) {
    const db = getD1Database();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await db
      .prepare('UPDATE tags SET color = ?, updated_at = ? WHERE id = ? AND user_id = ?')
      .bind(color, now, id, userId)
      .run();
  }

  static async updateTagPinned(id: number, pinned: boolean, userId: number) {
    const db = getD1Database();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await db
      .prepare('UPDATE tags SET pinned = ?, updated_at = ? WHERE id = ? AND user_id = ?')
      .bind(pinned ? 1 : 0, now, id, userId)
      .run();
  }

  static async deleteTag(id: number, userId: number, deleteBookmarks: boolean = false) {
    const db = getD1Database();
    const allTags = await this.getTags(userId);
    const tagIdsToDelete: number[] = [id];
    const visited = new Set<number>([id]);
    const collectChildren = (parentId: number) => {
      for (const t of Object.values(allTags)) {
        if (t.parent === parentId && !visited.has(t.id)) {
          visited.add(t.id);
          tagIdsToDelete.push(t.id);
          collectChildren(t.id);
        }
      }
    };
    collectChildren(id);
    const placeholders = tagIdsToDelete.map(() => '?').join(',');

    if (deleteBookmarks) {
      const itemsRes = await db
        .prepare(
          `SELECT DISTINCT it.item_id FROM items_tags it JOIN items i ON i.id = it.item_id
           WHERE it.tag_id IN (${placeholders}) AND i.user_id = ?`
        )
        .bind(...tagIdsToDelete, userId)
        .all<{ item_id: number }>();
      const itemIds = (itemsRes.results || []).map((r) => r.item_id);
      if (itemIds.length > 0) {
        const itemPlaceholders = itemIds.map(() => '?').join(',');
        await db
          .prepare(`DELETE FROM items WHERE id IN (${itemPlaceholders}) AND user_id = ?`)
          .bind(...itemIds, userId)
          .run();
      }
    }

    await db
      .prepare(`DELETE FROM tags WHERE id IN (${placeholders}) AND user_id = ?`)
      .bind(...tagIdsToDelete, userId)
      .run();
  }

  /**
   * Attaches tags to items. Only IDs owned by `userId` are used — foreign or
   * nonexistent item/tag IDs are silently skipped, so one user can never
   * modify another user's data.
   */
  static async attachItemsTags(itemIds: number[], tagIds: number[], userId: number) {
    if (itemIds.length === 0 || tagIds.length === 0) return;
    const db = getD1Database();

    const itemPlaceholders = itemIds.map(() => '?').join(',');
    const ownedItemsRes = await db
      .prepare(`SELECT id FROM items WHERE id IN (${itemPlaceholders}) AND user_id = ?`)
      .bind(...itemIds, userId)
      .all<{ id: number }>();
    const ownedItemIds = (ownedItemsRes.results || []).map((r) => r.id);
    if (ownedItemIds.length === 0) return;

    const tagPlaceholders = tagIds.map(() => '?').join(',');
    const ownedTagsRes = await db
      .prepare(`SELECT id FROM tags WHERE id IN (${tagPlaceholders}) AND user_id = ?`)
      .bind(...tagIds, userId)
      .all<{ id: number }>();
    const ownedTagIds = (ownedTagsRes.results || []).map((r) => r.id);
    if (ownedTagIds.length === 0) return;

    const stmts: D1PreparedStatement[] = [];
    for (const itemId of ownedItemIds) {
      for (const tagId of ownedTagIds) {
        stmts.push(db.prepare('INSERT OR IGNORE INTO items_tags (item_id, tag_id) VALUES (?, ?)').bind(itemId, tagId));
      }
    }
    await db.batch(stmts);
  }

  /** Replaces all tag links of one owned item with `tagIds`. */
  static async setItemTags(tagIds: number[], itemId: number, userId: number): Promise<boolean> {
    const db = getD1Database();

    const ownedItem = await db
      .prepare('SELECT id FROM items WHERE id = ? AND user_id = ?')
      .bind(itemId, userId)
      .first<{ id: number }>();
    if (!ownedItem) return false;

    let ownedTagIds: number[] = [];
    if (tagIds.length > 0) {
      const tagPlaceholders = tagIds.map(() => '?').join(',');
      const ownedTagsRes = await db
        .prepare(`SELECT id FROM tags WHERE id IN (${tagPlaceholders}) AND user_id = ?`)
        .bind(...tagIds, userId)
        .all<{ id: number }>();
      ownedTagIds = (ownedTagsRes.results || []).map((r) => r.id);
    }

    const stmts: D1PreparedStatement[] = [db.prepare('DELETE FROM items_tags WHERE item_id = ?').bind(itemId)];
    for (const tagId of ownedTagIds) {
      stmts.push(db.prepare('INSERT OR IGNORE INTO items_tags (item_id, tag_id) VALUES (?, ?)').bind(itemId, tagId));
    }
    await db.batch(stmts);
    return true;
  }

  /**
   * Bulk tag update for several owned items:
   * - `tagIdsAll` is attached to every item;
   * - tags not in `tagIdsAll` ∪ `tagIdsSome` are removed from all items.
   */
  static async syncItemsTags(
    itemIds: number[],
    tagIdsAll: number[],
    tagIdsSome: number[] = [],
    userId: number
  ): Promise<boolean> {
    if (itemIds.length === 0) return true;
    if (itemIds.length === 1) {
      return await this.setItemTags(tagIdsAll, itemIds[0], userId);
    }
    await this.attachItemsTags(itemIds, tagIdsAll, userId);
    if (tagIdsAll.length === 0 && tagIdsSome.length === 0) {
      // Nothing should remain on any of the items
      await this.removeAllTagsFromItems(itemIds, userId);
      return true;
    }

    const db = getD1Database();
    const itemPlaceholders = itemIds.map(() => '?').join(',');
    const currentTagsRes = await db
      .prepare(
        `SELECT DISTINCT it.tag_id FROM items_tags it JOIN items i ON i.id = it.item_id
         WHERE it.item_id IN (${itemPlaceholders}) AND i.user_id = ?`
      )
      .bind(...itemIds, userId)
      .all();
    const currentTagIds: number[] = (currentTagsRes.results || []).map((r: any) => Number(r.tag_id));
    const keepTagIds = new Set([...tagIdsAll, ...tagIdsSome]);
    const tagsToRemove = currentTagIds.filter((tId) => !keepTagIds.has(tId));
    if (tagsToRemove.length > 0) {
      const tagPlaceholders = tagsToRemove.map(() => '?').join(',');
      await db
        .prepare(
          `DELETE FROM items_tags WHERE item_id IN (SELECT id FROM items WHERE id IN (${itemPlaceholders}) AND user_id = ?)
           AND tag_id IN (${tagPlaceholders})`
        )
        .bind(userId, ...tagsToRemove)
        .run();
    }
    return true;
  }

  private static async removeAllTagsFromItems(itemIds: number[], userId: number) {
    const db = getD1Database();
    const itemPlaceholders = itemIds.map(() => '?').join(',');
    await db
      .prepare(
        `DELETE FROM items_tags WHERE item_id IN (SELECT id FROM items WHERE id IN (${itemPlaceholders}) AND user_id = ?)`
      )
      .bind(userId)
      .run();
  }
}
