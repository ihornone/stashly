import { NextRequest } from 'next/server';
import { ItemRepository } from '@/server/repositories/items';
import { TagRepository } from '@/server/repositories/tags';
import { errorResponse, getAuthenticatedUserId, successResponse } from '@/server/auth';
import { JSDOM } from 'jsdom';
import { parse } from 'csv-parse/sync';
import { scrapeUrlMetadata } from '@/server/scraper';
import { logger } from '@/lib/logger';

/**
 * Creates tag hierarchy from a folder path array e.g. ["Bookmarks Bar", "Development", "Frontend"]
 */
async function getOrCreateTagHierarchy(folders: string[], userId: number): Promise<number | null> {
  let parentId = 0;
  for (const folder of folders) {
    if (!folder.trim()) continue;
    parentId = await TagRepository.createTag(folder.trim(), '', parentId, userId);
  }
  return parentId > 0 ? parentId : null;
}

/**
 * Best-effort background metadata scraping for imported bookmarks.
 * Preserves existing values when a scrape returns nothing.
 */
async function triggerBackgroundMetadataScraping(
  items: Array<{ id: number; url: string; title: string }>,
  userId: number
) {
  for (const item of items) {
    if (!item.url || !item.url.startsWith('http')) continue;
    try {
      const meta = await scrapeUrlMetadata(item.url);
      if (meta) {
        await ItemRepository.updateItemsMetadata(
          meta.title || item.title,
          meta.description || '',
          meta.image || '',
          [item.id],
          userId
        );
      }
    } catch (err) {
      logger.warn({
        event: 'auto_scrape_failed',
        url: item.url,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    const formData = await req.formData();
    const file = (formData.get('bookmark-file-html') || formData.get('file')) as File | null;
    const importFormat = (formData.get('format') as string) || 'auto'; // 'auto' | 'html' | 'json' | 'csv'
    const importSourceName = (formData.get('import-source-name') as string) || 'Browser';

    if (!file) {
      return errorResponse('Файл для імпорту обов’язковий');
    }

    const MAX_IMPORT_BYTES = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_IMPORT_BYTES) {
      return errorResponse('Файл занадто великий (максимум 10 МБ)');
    }

    const content = await file.text();
    const fileName = file.name.toLowerCase();

    const createdItems: Array<{ id: number; url: string; title: string }> = [];

    // Detect format if auto
    const isJson =
      importFormat === 'json' ||
      (importFormat === 'auto' &&
        (fileName.endsWith('.json') || content.trim().startsWith('{') || content.trim().startsWith('[')));
    const isCsv = importFormat === 'csv' || (importFormat === 'auto' && fileName.endsWith('.csv'));

    if (isJson) {
      // 1. JSON Import (Stashly / Raindrop / standard JSON backup)
      let parsedData: any;
      try {
        parsedData = JSON.parse(content);
      } catch (e: any) {
        return errorResponse('Невірний формат JSON: ' + e.message);
      }

      const itemsList = Array.isArray(parsedData)
        ? parsedData
        : Array.isArray(parsedData.items)
          ? parsedData.items
          : Array.isArray(parsedData.bookmarks)
            ? parsedData.bookmarks
            : [];

      // If tags dictionary exists in JSON (stashly backup), restore tags
      const tagIdMap: Record<string | number, number> = {};
      if (parsedData.tags && typeof parsedData.tags === 'object') {
        for (const key of Object.keys(parsedData.tags)) {
          const t = parsedData.tags[key];
          if (t && t.title) {
            const newTagId = await TagRepository.createTag(t.title, t.description || '', 0, userId);
            if (t.color) await TagRepository.updateTagColor(newTagId, t.color, userId);
            tagIdMap[t.id || key] = newTagId;
          }
        }
      }

      for (const item of itemsList) {
        const url = item.url || item.link;
        if (!url || typeof url !== 'string' || !url.startsWith('http')) continue;

        const title = (item.title || url).trim();

        const itemTags: number[] = [];
        if (Array.isArray(item.tags)) {
          for (const t of item.tags) {
            if (typeof t === 'number' && tagIdMap[t]) {
              itemTags.push(tagIdMap[t]);
            } else if (typeof t === 'string' && t.trim()) {
              itemTags.push(await TagRepository.createTag(t.trim(), '', 0, userId));
            } else if (t && typeof t === 'object' && t.title) {
              itemTags.push(await TagRepository.createTag(t.title, '', 0, userId));
            }
          }
        }

        const itemId = await ItemRepository.createItem(
          {
            title,
            description: '',
            url,
            comments: '',
            image: '',
            tags: Array.from(new Set(itemTags)),
          },
          userId
        );

        createdItems.push({ id: itemId, url, title });
      }
    } else if (isCsv) {
      // 2. CSV Import (Raindrop CSV, Browser CSV, etc.)
      const records: any[] = parse(content, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
        trim: true,
      });

      const rootTagId = await TagRepository.createTag(`Імпорт CSV (${importSourceName})`, '', 0, userId);

      for (const row of records) {
        const url = row.url || row.URL || row.link || row.Link || row.address || row.Address;
        if (!url || typeof url !== 'string' || !url.startsWith('http')) continue;

        const title = (row.title || row.Title || row.name || row.Name || url).trim();
        const itemTags: number[] = [rootTagId];

        const folder = row.folder || row.Folder || row.category || row.Category;
        if (folder && typeof folder === 'string') {
          const folderParts = folder.split('/').map((s: string) => s.trim()).filter(Boolean);
          const folderTagId = await getOrCreateTagHierarchy(folderParts, userId);
          if (folderTagId) itemTags.push(folderTagId);
        }

        const tagsStr = row.tags || row.Tags;
        if (tagsStr && typeof tagsStr === 'string') {
          const splitTags = tagsStr.split(/[,|;]/).map((t: string) => t.trim()).filter(Boolean);
          for (const t of splitTags) {
            itemTags.push(await TagRepository.createTag(t, '', 0, userId));
          }
        }

        const itemId = await ItemRepository.createItem(
          {
            title,
            description: '',
            url,
            comments: '',
            image: '',
            tags: Array.from(new Set(itemTags)),
          },
          userId
        );

        createdItems.push({ id: itemId, url, title });
      }
    } else {
      // 3. HTML / Netscape Bookmarks format (Chrome, Firefox, Safari, Edge, Raindrop HTML export)
      let extractedBookmarks: Array<{
        url: string;
        title: string;
        tags: string[];
        folders: string[];
      }> = [];

      const folderStack: string[] = [];
      const tagRegex =
        /<(H3|h3)[^>]*>(.*?)<\/(H3|h3)>|<(DL|dl)\b[^>]*>|<\/(DL|dl)>|<(A|a)\s+([^>]+)>(.*?)<\/(A|a)>/gis;

      let pendingFolderName: string | null = null;
      let match: RegExpExecArray | null;

      while ((match = tagRegex.exec(content)) !== null) {
        if (match[1]) {
          pendingFolderName = match[2].replace(/<[^>]+>/g, '').trim();
          continue;
        }

        if (match[4]) {
          if (pendingFolderName) {
            folderStack.push(pendingFolderName);
            pendingFolderName = null;
          }
          continue;
        }

        if (match[5]) {
          if (folderStack.length > 0) {
            folderStack.pop();
          }
          continue;
        }

        if (match[6]) {
          const attrsStr = match[7];
          const linkTitle = match[8].replace(/<[^>]+>/g, '').trim();

          const hrefMatch = attrsStr.match(/href=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
          const url = hrefMatch ? hrefMatch[1] || hrefMatch[2] || hrefMatch[3] : '';
          if (!url || !url.startsWith('http')) continue;

          const tagsMatch = attrsStr.match(/tags=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
          const tagsAttr = tagsMatch ? tagsMatch[1] || tagsMatch[2] || tagsMatch[3] : '';
          const tags = tagsAttr ? tagsAttr.split(',').map((t) => t.trim()).filter(Boolean) : [];

          const bookmark = {
            url,
            title: linkTitle || url,
            tags,
            folders: [...folderStack],
          };

          extractedBookmarks.push(bookmark);
        }
      }

      if (extractedBookmarks.length === 0) {
        const dom = new JSDOM(content);
        const doc = dom.window.document;
        const links = Array.from(doc.querySelectorAll('a'));

        for (const link of links) {
          const url = link.getAttribute('href');
          if (!url || !url.startsWith('http')) continue;

          const title = (link.textContent || url).trim();
          const tagsAttr = link.getAttribute('tags') || link.getAttribute('TAGS') || '';
          const tags = tagsAttr ? tagsAttr.split(',').map((t) => t.trim()).filter(Boolean) : [];

          extractedBookmarks.push({
            url,
            title,
            tags,
            folders: [],
          });
        }
      }

      const defaultTagId = await TagRepository.createTag(`Імпорт з ${importSourceName}`, '', 0, userId);

      for (const bm of extractedBookmarks) {
        const tagIds = [defaultTagId];

        for (const tagTitle of bm.tags) {
          tagIds.push(await TagRepository.createTag(tagTitle, '', 0, userId));
        }

        if (bm.folders.length > 0) {
          const folderTagId = await getOrCreateTagHierarchy(bm.folders, userId);
          if (folderTagId) tagIds.push(folderTagId);
        }

        const itemId = await ItemRepository.createItem(
          {
            title: bm.title,
            description: '',
            url: bm.url,
            comments: '',
            image: '',
            tags: Array.from(new Set(tagIds)),
          },
          userId
        );

        createdItems.push({ id: itemId, url: bm.url, title: bm.title });
      }
    }

    if (createdItems.length > 0) {
      triggerBackgroundMetadataScraping(createdItems, userId).catch((err) =>
        logger.error({
          event: 'import_autoscrape_failed',
          error: err instanceof Error ? err.message : String(err),
          userId,
        })
      );
    }

    return successResponse(`Успішно імпортовано ${createdItems.length} закладок. Триває автозавантаження фото та описів.`);
  } catch (err: any) {
    logger.error({
      event: 'import_bookmarks_failed',
      error: err instanceof Error ? err.message : String(err),
    });
    return errorResponse(err.message || 'Не вдалося імпортувати закладки');
  }
}
