import { TagRepository } from '@/server/repositories/tags';
import { getD1Database } from '@/server/db';

export function parseTagSegments(tagString: string): string[] {
  return tagString
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createTagsFromSegments(segments: string[], userId: number): Promise<number> {
  let parentId = 0;
  for (const seg of segments) {
    parentId = await TagRepository.createTag(seg, '', parentId, userId);
  }
  return parentId;
}

/**
 * Resolves user-provided tag input into tag IDs owned by `userId`:
 * numeric IDs are verified for ownership, string paths like "Work/Sub" are
 * created on demand. Foreign tag IDs are silently dropped.
 */
export async function processInputTags(rawTags: unknown[], userId: number): Promise<number[]> {
  if (!Array.isArray(rawTags)) return [];
  const tagIds: number[] = [];

  for (const tag of rawTags) {
    if (typeof tag === 'number' && Number.isFinite(tag)) {
      tagIds.push(tag);
    } else if (typeof tag === 'string') {
      const trimmed = tag.trim();
      if (!trimmed) continue;
      if (/^\d+$/.test(trimmed)) {
        tagIds.push(parseInt(trimmed, 10));
      } else {
        const segments = parseTagSegments(trimmed);
        if (segments.length > 0) {
          const createdId = await createTagsFromSegments(segments, userId);
          tagIds.push(createdId);
        }
      }
    }
  }

  const unique = Array.from(new Set(tagIds));
  if (unique.length === 0) return [];

  const placeholders = unique.map(() => '?').join(',');
  const owned = await getD1Database()
    .prepare(`SELECT id FROM tags WHERE id IN (${placeholders}) AND user_id = ?`)
    .bind(...unique, userId)
    .all<{ id: number }>();
  const ownedIds = new Set((owned.results || []).map((r) => r.id));
  return unique.filter((id) => ownedIds.has(id));
}
