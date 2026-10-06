import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withAuthRoute } from '@/server/api';
import { successResponse } from '@/server/auth';
import { safeFetch, validateSafeUrl } from '@/server/scraper';

const checkSchema = z.object({
  items: z
    .array(z.object({ id: z.coerce.number().int().positive(), url: z.string().min(1) }))
    .min(1)
    .max(15),
});

interface CheckResult {
  id: number;
  url: string;
  status: 'alive' | 'broken' | 'warning';
  statusCode?: number;
  error?: string;
}

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (Stashly Bookmark Bot)',
};

async function checkSingleUrl(item: { id: number; url: string }): Promise<CheckResult> {
  const { id, url } = item;
  try {
    const parsed = validateSafeUrl(url);

    let res = await safeFetch(parsed.toString(), {
      method: 'HEAD',
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(6000),
    });

    // Some servers reject HEAD with 405/501 — retry with a ranged GET
    if (res.status === 405 || res.status === 501) {
      res = await safeFetch(parsed.toString(), {
        method: 'GET',
        headers: { ...BROWSER_HEADERS, Range: 'bytes=0-100' },
        signal: AbortSignal.timeout(6000),
      });
    }

    if (res.status >= 200 && res.status < 400) {
      return { id, url, status: 'alive', statusCode: res.status };
    }
    if (res.status === 401 || res.status === 403 || res.status === 429 || res.status >= 500) {
      // Auth wall, challenge, rate limit or server-side issue — the site itself exists
      return { id, url, status: 'warning', statusCode: res.status, error: `HTTP ${res.status}` };
    }
    return { id, url, status: 'broken', statusCode: res.status, error: `HTTP ${res.status}` };
  } catch (err: any) {
    return {
      id,
      url,
      status: 'broken',
      error: err?.name === 'TimeoutError' || err?.name === 'AbortError' ? 'Час очікування вичерпано' : 'Помилка з’єднання',
    };
  }
}

export async function POST(req: NextRequest) {
  return withAuthRoute(req, checkSchema, async ({ body }) => {
    const results = await Promise.all(body.items.map((item) => checkSingleUrl(item)));
    return successResponse('Перевірка виконана успішно', {
      results,
      totalChecked: results.length,
    });
  });
}
