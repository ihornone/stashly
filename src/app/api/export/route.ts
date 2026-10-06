import { NextRequest } from 'next/server';
import { ItemRepository } from '@/server/repositories/items';
import { TagRepository } from '@/server/repositories/tags';
import { withAuthRoute } from '@/server/api';
import { errorResponse } from '@/server/auth';

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlText(value: string): string {
  return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let val = String(value);
  // Neutralize CSV formula injection (=, +, -, @) for spreadsheet apps
  if (/^[=+\-@\t\r]/.test(val)) {
    val = `'${val}`;
  }
  return `"${val.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  return withAuthRoute(req, null, async ({ userId, searchParams }) => {
    const format = searchParams.get('format') || 'html';

    if (!['json', 'csv', 'html'].includes(format)) {
      return errorResponse('Unsupported export format', 422);
    }

    const items = await ItemRepository.getItems(userId);
    const tagsMap = await TagRepository.getTags(userId);
    const dateStamp = new Date().toISOString().split('T')[0];

    if (format === 'json') {
      const exportData = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        tags: tagsMap,
        items: items.map((item) => ({
          ...item,
          tag_names: (item.tags || []).map((tId) => tagsMap[tId]?.title || '').filter(Boolean),
        })),
      };

      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="stashly-bookmarks-${dateStamp}.json"`,
        },
      });
    }

    if (format === 'csv') {
      const headers = ['id', 'title', 'url', 'description', 'comments', 'tags', 'created_at', 'updated_at'];
      const rows = [headers.join(',')];

      for (const item of items) {
        const itemTags = (item.tags || [])
          .map((tId) => tagsMap[tId]?.title || '')
          .filter(Boolean)
          .join('|');

        rows.push(
          [
            item.id,
            escapeCsvCell(item.title),
            escapeCsvCell(item.url),
            escapeCsvCell(item.description),
            escapeCsvCell(item.comments),
            escapeCsvCell(itemTags),
            escapeCsvCell(item.created_at),
            escapeCsvCell(item.updated_at),
          ].join(',')
        );
      }

      return new Response(rows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="stashly-bookmarks-${dateStamp}.csv"`,
        },
      });
    }

    // Default: Netscape HTML Bookmark Format (compatible with Chrome, Firefox, Safari, Brave, Raindrop)
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

    for (const item of items) {
      const itemTags = (item.tags || [])
        .map((tId) => tagsMap[tId]?.title || '')
        .filter(Boolean)
        .join(',');

      const safeTitle = escapeHtmlText(item.title || item.url);
      const safeUrl = escapeHtmlAttr(item.url);
      const safeTags = escapeHtmlAttr(itemTags);
      const addDate =
        item.created_at && Number.isFinite(new Date(item.created_at).getTime())
          ? Math.floor(new Date(item.created_at).getTime() / 1000)
          : '';

      html += `    <DT><A HREF="${safeUrl}" ADD_DATE="${addDate}" TAGS="${safeTags}">${safeTitle}</A>\n`;
      if (item.description) {
        html += `    <DD>${escapeHtmlText(item.description)}\n`;
      }
    }

    html += `</DL><p>\n`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="stashly-bookmarks-${dateStamp}.html"`,
      },
    });
  });
}
