import * as htmlparser2 from 'htmlparser2';

const MAX_HTML_BYTES = 3 * 1024 * 1024; // 3 MB cap on scraped page bodies
const MAX_REDIRECTS = 5;

export function isPublicIp(ipOrHost: string): boolean {
  if (!ipOrHost) return false;
  const h = ipOrHost.toLowerCase().trim();
  if (
    h === 'localhost' ||
    h === '0.0.0.0' ||
    h === '::1' ||
    h === '::' ||
    h.endsWith('.local') ||
    h.endsWith('.internal') ||
    h.endsWith('.lan') ||
    h.endsWith('.home') ||
    h === '169.254.169.254' ||
    h === 'metadata.google.internal' ||
    h.startsWith('127.') ||
    h.startsWith('10.') ||
    h.startsWith('192.168.') ||
    h.startsWith('169.254.') ||
    h.startsWith('100.64.') ||
    h.startsWith('100.65.') ||
    h.startsWith('100.66.') ||
    h.startsWith('100.67.') ||
    h.startsWith('100.68.') ||
    h.startsWith('100.69.') ||
    h.startsWith('100.7') ||
    h.startsWith('198.18.') ||
    h.startsWith('198.19.') ||
    h.startsWith('224.') ||
    h.startsWith('fc00:') ||
    h.startsWith('fd00:') ||
    h.startsWith('fe80:') ||
    h.startsWith('::ffff:127.') ||
    h.startsWith('::ffff:10.') ||
    h.startsWith('::ffff:192.168.')
  ) {
    return false;
  }
  if (h.startsWith('172.')) {
    const parts = h.split('.');
    const second = parseInt(parts[1], 10);
    if (!isNaN(second) && second >= 16 && second <= 31) return false;
  }
  return true;
}

export function validateSafeUrl(urlString: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error('Invalid URL format');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http and https protocols are supported');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!isPublicIp(hostname)) {
    throw new Error('Access to private/internal networks is forbidden');
  }

  return parsed;
}

/**
 * SSRF-safe fetch: validates the initial URL AND every redirect target,
 * so a public URL cannot bounce a request into internal networks.
 */
export async function safeFetch(url: string | URL, init: RequestInit = {}): Promise<Response> {
  let currentUrl = validateSafeUrl(url.toString()).toString();
  const signal = init.signal || AbortSignal.timeout(10000);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(currentUrl, { ...init, signal, redirect: 'manual' });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) {
        return res;
      }
      res.body?.cancel().catch(() => {});
      currentUrl = validateSafeUrl(new URL(location, currentUrl).toString()).toString();
      continue;
    }
    return res;
  }

  throw new Error('Too many redirects');
}

/** Reads a response body as text with a hard byte cap. */
export async function readBodyWithCap(res: Response, capBytes = MAX_HTML_BYTES): Promise<string> {
  const contentLength = res.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > capBytes) {
    res.body?.cancel().catch(() => {});
    throw new Error('Response too large');
  }

  const reader = res.body?.getReader();
  if (!reader) {
    return '';
  }

  const decoder = new TextDecoder();
  let text = '';
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > capBytes) {
      await reader.cancel().catch(() => {});
      throw new Error('Response too large');
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  return text;
}

export function resolveUrl(relativeUrl: string, baseUrl: string): string {
  try {
    return new URL(relativeUrl, baseUrl).toString();
  } catch {
    return relativeUrl;
  }
}

// Extract YouTube Video ID
function extractYouTubeVideoId(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (host.includes('youtube.com')) {
    if (url.pathname.startsWith('/watch')) {
      return url.searchParams.get('v');
    }
    if (url.pathname.startsWith('/embed/') || url.pathname.startsWith('/v/') || url.pathname.startsWith('/shorts/')) {
      return url.pathname.split('/')[2] || null;
    }
  } else if (host === 'youtu.be') {
    return url.pathname.slice(1).split('?')[0] || null;
  }
  return null;
}

// Extract high quality YouTube metadata
async function scrapeYouTubeMetadata(parsedUrl: URL, targetUrl: string) {
  const videoId = extractYouTubeVideoId(parsedUrl);
  if (!videoId) return null;

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`;
    const res = await safeFetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
    let title = '';
    let authorName = '';
    if (res.ok) {
      const data: any = await res.json();
      title = data.title || '';
      authorName = data.author_name ? ` - ${data.author_name}` : '';
    }

    return {
      title: (title ? `${title}${authorName}` : `YouTube Video (${videoId})`).trim(),
      description: `YouTube video${authorName ? ` by ${authorName.replace(' - ', '')}` : ''}`,
      image: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      url: targetUrl,
    };
  } catch {
    return {
      title: `YouTube Video (${videoId})`,
      description: 'YouTube Video',
      image: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      url: targetUrl,
    };
  }
}

// GitHub repository handler (title + OpenGraph preview image)
function scrapeGitHubMetadata(parsedUrl: URL, targetUrl: string) {
  const host = parsedUrl.hostname.toLowerCase();
  if (host !== 'github.com') return null;

  const parts = parsedUrl.pathname.split('/').filter(Boolean);
  if (parts.length >= 2) {
    const owner = parts[0];
    const repo = parts[1];
    return {
      title: `${owner}/${repo} - GitHub`,
      description: `GitHub repository ${owner}/${repo}`,
      image: `https://opengraph.githubassets.com/1/${owner}/${repo}`,
      url: targetUrl,
    };
  }
  return null;
}

interface ParsedHtmlMetadata {
  title: string;
  description: string;
  image: string;
  favicons: Array<{ rel: string; href: string; sizes?: string }>;
}

export function parseHtmlMetadata(html: string, baseUrl: string): ParsedHtmlMetadata {
  let docTitle = '';
  let inTitle = false;
  let h1Title = '';
  let inH1 = false;
  const metas: Record<string, string> = {};
  const favicons: Array<{ rel: string; href: string; sizes?: string }> = [];
  let firstArticleImg = '';
  let firstAnyImg = '';
  let inArticleOrMain = false;

  const parser = new htmlparser2.Parser(
    {
      onopentag(name, attribs) {
        const tag = name.toLowerCase();
        if (tag === 'title') {
          inTitle = true;
        } else if (tag === 'h1' && !h1Title) {
          inH1 = true;
        } else if (tag === 'article' || tag === 'main') {
          inArticleOrMain = true;
        } else if (tag === 'meta') {
          const key = (attribs.property || attribs.name || attribs.itemprop || '').toLowerCase().trim();
          const content = attribs.content;
          if (key && content && !metas[key]) {
            metas[key] = content;
          }
        } else if (tag === 'link') {
          const rel = (attribs.rel || '').toLowerCase().trim();
          const href = attribs.href;
          if (href && (rel.includes('icon') || rel.includes('apple-touch-icon'))) {
            favicons.push({ rel, href, sizes: attribs.sizes });
          }
        } else if (tag === 'img' && attribs.src) {
          const src = attribs.src;
          const isInvalid = src.startsWith('data:') || src.includes('spacer') || src.includes('pixel');
          if (!isInvalid) {
            if (inArticleOrMain && !firstArticleImg) {
              firstArticleImg = src;
            } else if (!firstAnyImg) {
              firstAnyImg = src;
            }
          }
        }
      },
      ontext(text) {
        if (inTitle) docTitle += text;
        if (inH1) h1Title += text;
      },
      onclosetag(name) {
        const tag = name.toLowerCase();
        if (tag === 'title') inTitle = false;
        if (tag === 'h1') inH1 = false;
        if (tag === 'article' || tag === 'main') inArticleOrMain = false;
      },
    },
    { decodeEntities: true }
  );

  parser.write(html);
  parser.end();

  const title = (
    metas['og:title'] ||
    metas['twitter:title'] ||
    metas['name'] ||
    docTitle ||
    h1Title
  ).trim();

  const description = (
    metas['og:description'] ||
    metas['description'] ||
    metas['twitter:description'] ||
    metas['description'] ||
    ''
  ).trim();

  let image = metas['og:image'] || metas['twitter:image'] || metas['image'] || '';
  if (!image) {
    image = firstArticleImg || firstAnyImg || '';
  }

  return {
    title,
    description,
    image,
    favicons,
  };
}

// Telegram Channel / Post handler
async function scrapeTelegramMetadata(parsedUrl: URL, targetUrl: string) {
  const host = parsedUrl.hostname.toLowerCase();
  if (host !== 't.me' && host !== 'telegram.me') return null;

  try {
    const path = parsedUrl.pathname.replace(/^\//, '');
    if (!path) return null;

    const previewUrl = `https://t.me/s/${path}`;
    const res = await safeFetch(previewUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const html = await readBodyWithCap(res);
      const parsed = parseHtmlMetadata(html, targetUrl);

      return {
        title: parsed.title || `Telegram: @${path}`,
        description: parsed.description || `Telegram channel or message @${path}`,
        image: parsed.image || '',
        url: targetUrl,
      };
    }
  } catch {
    // Fallback to normal flow
  }
  return null;
}

// Fallback high quality favicon fetcher
export function getHighResFavicon(
  favicons: Array<{ rel: string; href: string; sizes?: string }>,
  baseUrl: string
): string {
  const appleTouchIcon = favicons.find(
    (f) => f.rel === 'apple-touch-icon' || f.rel === 'apple-touch-icon-precomposed'
  );
  if (appleTouchIcon?.href) {
    return resolveUrl(appleTouchIcon.href, baseUrl);
  }

  const sizedIcons = favicons.filter((f) => f.sizes);
  if (sizedIcons.length > 0) {
    sizedIcons.sort((a, b) => {
      const sizeA = parseInt(a.sizes || '0', 10);
      const sizeB = parseInt(b.sizes || '0', 10);
      return sizeB - sizeA;
    });
    return resolveUrl(sizedIcons[0].href, baseUrl);
  }

  const standardIcon = favicons.find((f) => f.rel.includes('icon'));
  if (standardIcon?.href) {
    return resolveUrl(standardIcon.href, baseUrl);
  }

  try {
    const domain = new URL(baseUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return '';
  }
}

export async function scrapeUrlMetadata(targetUrl: string) {
  const parsed = validateSafeUrl(targetUrl);

  // 1. Check YouTube specific parser
  const ytMeta = await scrapeYouTubeMetadata(parsed, targetUrl);
  if (ytMeta && ytMeta.title) return ytMeta;

  // 2. Check Telegram specific parser
  const tgMeta = await scrapeTelegramMetadata(parsed, targetUrl);
  if (tgMeta && tgMeta.title) return tgMeta;

  const response = await safeFetch(targetUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (Stashly Bookmark Bot)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page: HTTP ${response.status}`);
  }

  const html = await readBodyWithCap(response);
  const metadata = parseHtmlMetadata(html, targetUrl);

  const title = (metadata.title || parsed.hostname).trim();
  const description = metadata.description.trim();
  let image = metadata.image;

  if (!image) {
    const ghMeta = scrapeGitHubMetadata(parsed, targetUrl);
    if (ghMeta?.image) {
      image = ghMeta.image;
    }
  }

  if (image) {
    image = resolveUrl(image, targetUrl);
  } else {
    image = getHighResFavicon(metadata.favicons, targetUrl);
  }

  return {
    title,
    description,
    image,
    url: targetUrl,
  };
}
