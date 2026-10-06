import { NextRequest, NextResponse } from 'next/server';
import { getImageStorageDir } from '@/server/db';
import { safeFetch, validateSafeUrl } from '@/server/scraper';
import { getAuthenticatedUserId } from '@/server/auth';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'];

export async function GET(req: NextRequest) {
  // Defense in depth: verify the session in the route itself,
  // not only in middleware (matcher regressions would expose this otherwise)
  try {
    await getAuthenticatedUserId();
  } catch {
    return new NextResponse('Authentication required', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('image-url');
  const itemIdParam = searchParams.get('item-id');

  if (!imageUrl) {
    return new NextResponse('Image URL is required', { status: 400 });
  }

  // Only numeric item IDs may form a cache directory — prevents path traversal
  const itemId = itemIdParam !== null && /^\d+$/.test(itemIdParam) ? itemIdParam : null;

  const hash = crypto.createHash('md5').update(imageUrl).digest('hex');

  // Check cached image on disk if itemId provided
  if (itemId) {
    const itemDir = path.join(getImageStorageDir(), itemId);
    if (fs.existsSync(itemDir)) {
      const files = fs.readdirSync(itemDir);
      const matched = files.find((f) => f.startsWith(hash));
      if (matched) {
        const filePath = path.join(itemDir, matched);
        const buffer = fs.readFileSync(filePath);
        const ext = path.extname(matched).replace('.', '') || 'jpeg';
        const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': mime,
            'Cache-Control': 'public, max-age=604800, immutable',
          },
        });
      }
    }
  }

  try {
    const parsed = validateSafeUrl(imageUrl);
    const res = await safeFetch(parsed.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StashlyBot/1.0)',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      return new NextResponse('', { status: 404 });
    }

    const contentType = (res.headers.get('content-type') || 'image/jpeg').split(';')[0].trim();
    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return new NextResponse('', { status: 415 });
    }

    const contentLength = res.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_BYTES) {
      res.body?.cancel().catch(() => {});
      return new NextResponse('', { status: 413 });
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
      return new NextResponse('', { status: 413 });
    }
    const buffer = Buffer.from(arrayBuffer);

    // Save locally if itemId provided
    if (itemId) {
      const itemDir = path.join(getImageStorageDir(), itemId);
      if (!fs.existsSync(itemDir)) {
        fs.mkdirSync(itemDir, { recursive: true });
      }
      let ext = 'jpg';
      if (contentType.includes('png')) ext = 'png';
      else if (contentType.includes('webp')) ext = 'webp';
      else if (contentType.includes('gif')) ext = 'gif';
      else if (contentType.includes('svg')) ext = 'svg';
      else if (contentType.includes('avif')) ext = 'avif';

      const filePath = path.join(itemDir, `${hash}.${ext}`);
      fs.writeFileSync(filePath, buffer);
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': itemId ? 'public, max-age=604800' : 'no-cache',
      },
    });
  } catch {
    return new NextResponse('', { status: 404 });
  }
}
