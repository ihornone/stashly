import { getD1Database } from '../db';
import { ItemRow, TagRow, generateShareId, safeDecodeURI } from './types';
import { TagRepository } from './tags';
import { ItemRepository } from './items';

export class ShareRepository {
  /** Enables sharing for an owned tag: generates (or reuses) its share ID. */
  static async ensureTagShareId(tagId: number, userId: number): Promise<string> {
    const db = getD1Database();
    const tag = await db
      .prepare('SELECT id, share_id, is_shared FROM tags WHERE id = ? AND user_id = ?')
      .bind(tagId, userId)
      .first<{ id: number; share_id?: string; is_shared?: number }>();
    if (!tag) return '';
    if (tag.is_shared && tag.share_id && tag.share_id.length === 10) return tag.share_id;
    const newShareId = tag.share_id && tag.share_id.length === 10 ? tag.share_id : generateShareId();
    await db
      .prepare('UPDATE tags SET share_id = ?, is_shared = 1 WHERE id = ? AND user_id = ?')
      .bind(newShareId, tagId, userId)
      .run();
    return newShareId;
  }

  static async regenerateTagShareId(tagId: number, userId: number): Promise<string> {
    const db = getD1Database();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newShareId = generateShareId();
    await db
      .prepare('UPDATE tags SET share_id = ?, is_shared = 1, updated_at = ? WHERE id = ? AND user_id = ?')
      .bind(newShareId, now, tagId, userId)
      .run();
    return newShareId;
  }

  static async disableTagShare(tagId: number, userId: number): Promise<boolean> {
    const db = getD1Database();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await db
      .prepare('UPDATE tags SET share_id = NULL, is_shared = 0, updated_at = ? WHERE id = ? AND user_id = ?')
      .bind(now, tagId, userId)
      .run();
    return true;
  }

  /**
   * Public share lookup. Resolves only tags explicitly marked as shared
   * (is_shared = 1) — either by share ID or, for backward compatibility with
   * previously published links, by numeric tag ID. Never returns tags that
   * the owner did not publish.
   */
  static async getSharedTagWithItems(identifier: string | number): Promise<{
    tag: TagRow;
    items: ItemRow[];
    allTags: Record<number, TagRow>;
  } | null> {
    const db = getD1Database();
    let tag: TagRow | null = null;

    const numId = Number(identifier);
    const isNumeric = identifier !== '' && !isNaN(numId);
    if (isNumeric) {
      // Legacy numeric links: only work for tags explicitly shared by their owner
      tag = await db
        .prepare('SELECT * FROM tags WHERE id = ? AND is_shared = 1')
        .bind(numId)
        .first<TagRow>();
    }
    if (!tag) {
      tag = await db
        .prepare('SELECT * FROM tags WHERE share_id = ? AND is_shared = 1')
        .bind(String(identifier))
        .first<TagRow>();
    }

    if (!tag) return null;

    const ownerUserId = tag.user_id || 0;
    if (!ownerUserId) return null;

    // Only the shared tag and its descendants are exposed — never the owner's other tags
    const allUserTags = await TagRepository.getTags(ownerUserId);
    const sharedTagIds: number[] = [tag.id];
    const visited = new Set<number>([tag.id]);
    const collectChildren = (parentId: number) => {
      for (const t of Object.values(allUserTags)) {
        if (t.parent === parentId && !visited.has(t.id)) {
          visited.add(t.id);
          sharedTagIds.push(t.id);
          collectChildren(t.id);
        }
      }
    };
    collectChildren(tag.id);

    const visibleTags: Record<number, TagRow> = {};
    for (const tagId of sharedTagIds) {
      if (allUserTags[tagId]) {
        visibleTags[tagId] = allUserTags[tagId];
      }
    }

    const placeholders = sharedTagIds.map(() => '?').join(',');
    const itemsRes = await db
      .prepare(
        `SELECT DISTINCT i.* FROM items i
         JOIN items_tags it ON i.id = it.item_id
         WHERE it.tag_id IN (${placeholders}) AND i.user_id = ?
         ORDER BY i.id DESC`
      )
      .bind(...sharedTagIds, ownerUserId)
      .all<ItemRow>();

    const itemsTags = await TagRepository.getItemsTags(ownerUserId);
    const items = (itemsRes.results || []).map((r) => ({
      ...r,
      url: safeDecodeURI(r.url || ''),
      image: safeDecodeURI(r.image || ''),
      tags: itemsTags[r.id] || [],
    }));

    return {
      tag: {
        ...tag,
        share_id: tag.share_id || '',
        pinned: Number(tag.pinned),
        parent: Number(tag.parent),
      },
      items,
      allTags: visibleTags,
    };
  }

  static async checkSharedTagComparison(
    identifier: string | number,
    userId: number
  ): Promise<{
    isOwner: boolean;
    existingTagId: number | null;
    isIdentical: boolean;
    newItemsCount: number;
    existingItemsCount: number;
    totalSharedCount: number;
  } | null> {
    const sharedData = await this.getSharedTagWithItems(identifier);
    if (!sharedData) return null;

    const { tag, items } = sharedData;

    if (tag.user_id === userId) {
      return {
        isOwner: true,
        existingTagId: tag.id,
        isIdentical: true,
        newItemsCount: 0,
        existingItemsCount: items.length,
        totalSharedCount: items.length,
      };
    }

    const db = getD1Database();

    const existingTag = await db
      .prepare(
        'SELECT id FROM tags WHERE (LOWER(title) = LOWER(?) OR (is_shared = 1 AND share_id IS NOT NULL AND share_id = ?)) AND user_id = ?'
      )
      .bind(tag.title, tag.share_id || '', userId)
      .first<{ id: number }>();

    if (!existingTag) {
      return {
        isOwner: false,
        existingTagId: null,
        isIdentical: false,
        newItemsCount: items.length,
        existingItemsCount: 0,
        totalSharedCount: items.length,
      };
    }

    const userTagItemsRes = await db
      .prepare(
        `SELECT i.url FROM items i
         JOIN items_tags it ON i.id = it.item_id
         WHERE it.tag_id = ? AND i.user_id = ?`
      )
      .bind(existingTag.id, userId)
      .all<{ url: string }>();

    const userTagUrls = new Set((userTagItemsRes.results || []).map((r) => safeDecodeURI(r.url)));
    const newItems = items.filter((item) => !userTagUrls.has(item.url));

    return {
      isOwner: false,
      existingTagId: existingTag.id,
      isIdentical: newItems.length === 0,
      newItemsCount: newItems.length,
      existingItemsCount: userTagUrls.size,
      totalSharedCount: items.length,
    };
  }

  static async importSharedTag(
    identifier: string | number,
    userId: number,
    mode: 'merge' | 'new' = 'merge'
  ): Promise<{ tagId: number; count: number; alreadyExists: boolean; isIdentical: boolean } | null> {
    const sharedData = await this.getSharedTagWithItems(identifier);
    if (!sharedData) return null;

    const { tag, items } = sharedData;

    if (tag.user_id === userId) {
      return { tagId: tag.id, count: items.length, alreadyExists: true, isIdentical: true };
    }

    const db = getD1Database();
    let targetTagId: number;
    let alreadyExists = false;

    if (mode === 'merge') {
      const existingTag = await db
        .prepare(
          'SELECT id FROM tags WHERE (LOWER(title) = LOWER(?) OR (is_shared = 1 AND share_id IS NOT NULL AND share_id = ?)) AND user_id = ?'
        )
        .bind(tag.title, tag.share_id || '', userId)
        .first<{ id: number }>();

      if (existingTag) {
        targetTagId = existingTag.id;
        alreadyExists = true;
      } else {
        targetTagId = await TagRepository.createTag(tag.title, tag.description || '', 0, userId, tag.color);
      }
    } else {
      let newTitle = tag.title;
      const countExisting = await db
        .prepare('SELECT COUNT(*) as count FROM tags WHERE LOWER(title) LIKE LOWER(?) AND user_id = ?')
        .bind(`${tag.title}%`, userId)
        .first<{ count: number }>();
      if (countExisting && countExisting.count > 0) {
        newTitle = `${tag.title} (нова)`;
      }
      targetTagId = await TagRepository.createTag(newTitle, tag.description || '', 0, userId, tag.color);
    }

    const userTagItemsRes = await db
      .prepare(
        `SELECT i.id, i.url FROM items i
         JOIN items_tags it ON i.id = it.item_id
         WHERE it.tag_id = ? AND i.user_id = ?`
      )
      .bind(targetTagId, userId)
      .all<{ id: number; url: string }>();
    const userTagUrls = new Set((userTagItemsRes.results || []).map((r) => safeDecodeURI(r.url)));

    const allUserItemsRes = await db
      .prepare('SELECT id, url FROM items WHERE user_id = ?')
      .bind(userId)
      .all<{ id: number; url: string }>();
    const allUserItemsMap = new Map((allUserItemsRes.results || []).map((r) => [safeDecodeURI(r.url), r.id]));

    let count = 0;
    for (const item of items) {
      if (userTagUrls.has(item.url)) {
        continue;
      }

      if (allUserItemsMap.has(item.url)) {
        const existingItemId = allUserItemsMap.get(item.url)!;
        await TagRepository.attachItemsTags([existingItemId], [targetTagId], userId);
        count++;
      } else {
        await ItemRepository.createItem(
          {
            title: item.title,
            description: item.description || '',
            url: item.url,
            comments: item.comments || '',
            image: item.image || '',
            tags: [targetTagId],
          },
          userId
        );
        count++;
      }
    }

    return { tagId: targetTagId, count, alreadyExists, isIdentical: count === 0 && alreadyExists };
  }
}
